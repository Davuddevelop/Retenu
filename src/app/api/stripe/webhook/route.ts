// src/app/api/stripe/webhook/route.ts
// Handles both direct Stripe webhooks and Stripe Connect webhooks
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummyKeyForBuild', {
    apiVersion: '2026-02-25.clover' as any,
});

// We support two webhook secrets:
// 1. STRIPE_WEBHOOK_SECRET - for direct account webhooks (testing/fallback)
// 2. STRIPE_CONNECT_WEBHOOK_SECRET - for Connect account webhooks (production)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const connectWebhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET || '';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    // Try Connect webhook secret first, then fall back to direct webhook secret
    const secrets = [connectWebhookSecret, webhookSecret].filter(Boolean);

    if (secrets.length === 0) {
        return NextResponse.json({ error: 'No webhook secret configured' }, { status: 500 });
    }

    let verified = false;
    for (const secret of secrets) {
        try {
            event = stripe.webhooks.constructEvent(body, signature, secret);
            verified = true;
            break;
        } catch {
            // Try next secret
            continue;
        }
    }

    if (!verified) {
        console.error('Webhook signature verification failed with all secrets');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // TypeScript needs this assertion after the loop
    event = event!;

    const supabase = getSupabaseAdmin();

    try {
        // For Connect webhooks, event.account contains the connected account ID
        // We use this to find the organization
        const connectedAccountId = event.account;

        let organizationId: string | null = null;

        if (connectedAccountId) {
            // This is a Connect webhook - find org by stripe_user_id
            const { data: integration } = await supabase
                .from('integrations')
                .select('organization_id')
                .eq('provider', 'stripe')
                .eq('enabled', true)
                .contains('config', { stripe_user_id: connectedAccountId })
                .single();

            if (integration) {
                organizationId = integration.organization_id as string;
            }
        } else {
            // Direct webhook - find first enabled Stripe integration (legacy/testing)
            const { data: integration } = await supabase
                .from('integrations')
                .select('organization_id')
                .eq('provider', 'stripe')
                .eq('enabled', true)
                .single();

            if (integration) {
                organizationId = integration.organization_id as string;
            }
        }

        if (!organizationId) {
            console.log('No matching organization found for Stripe event');
            // Return 200 to acknowledge receipt even if we can't process
            return NextResponse.json({ received: true, processed: false });
        }

        // Process the event
        switch (event.type) {
            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaid(supabase, invoice, organizationId);
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaymentFailed(supabase, invoice);
                break;
            }
            case 'invoice.created': {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoiceCreated(supabase, invoice, organizationId);
                break;
            }
            case 'invoice.finalized': {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoiceFinalized(supabase, invoice);
                break;
            }
            case 'account.updated': {
                // Handle Connect account updates (e.g., verification status)
                const account = event.data.object as Stripe.Account;
                await handleAccountUpdated(supabase, account, connectedAccountId || '');
                break;
            }
            case 'account.application.deauthorized': {
                // User disconnected our app from their Stripe account
                await handleAccountDeauthorized(supabase, connectedAccountId || '');
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true, processed: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

type SupabaseAdmin = ReturnType<typeof getSupabaseAdmin>;

async function handleInvoiceCreated(
    supabase: SupabaseAdmin,
    invoice: Stripe.Invoice,
    organizationId: string
) {
    // Try to match client by email or name
    const customerEmail = invoice.customer_email;
    const customerName = typeof invoice.customer_name === 'string' ? invoice.customer_name : null;

    let clientId: string | null = null;

    // Try matching by email domain first
    if (customerEmail) {
        const emailDomain = customerEmail.split('@')[1];
        const emailPrefix = customerEmail.split('@')[0];

        // Try exact email match in client config, or name match
        const { data: clientByEmail } = await supabase
            .from('clients')
            .select('id')
            .eq('organization_id', organizationId)
            .or(`name.ilike.%${emailPrefix}%,name.ilike.%${emailDomain.split('.')[0]}%`)
            .limit(1)
            .single();

        if (clientByEmail) {
            clientId = clientByEmail.id as string;
        }
    }

    // Try matching by customer name
    if (!clientId && customerName) {
        const { data: clientByName } = await supabase
            .from('clients')
            .select('id')
            .eq('organization_id', organizationId)
            .ilike('name', `%${customerName}%`)
            .single();

        if (clientByName) {
            clientId = clientByName.id as string;
        }
    }

    // If no client match found, we still record the invoice but without a client link
    // This allows users to manually link it later
    const invoiceData: Record<string, unknown> = {
        stripe_invoice_id: invoice.id,
        organization_id: organizationId,
        amount: (invoice.amount_due || 0) / 100,
        status: 'draft' as const,
        issue_date: new Date(invoice.created * 1000).toISOString().split('T')[0],
        due_date: invoice.due_date
            ? new Date(invoice.due_date * 1000).toISOString().split('T')[0]
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    if (clientId) {
        invoiceData.client_id = clientId;
    }

    // Check if invoice exists
    const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('stripe_invoice_id', invoice.id)
        .single();

    if (existing) {
        await supabase
            .from('invoices')
            .update(invoiceData)
            .eq('stripe_invoice_id', invoice.id);
    } else {
        // Only insert if we have a client_id (required by schema)
        if (clientId) {
            await supabase.from('invoices').insert(invoiceData);
        } else {
            console.log('Skipping invoice insert - no matching client found for:', {
                invoiceId: invoice.id,
                customerEmail,
                customerName,
            });
        }
    }
}

async function handleInvoiceFinalized(supabase: SupabaseAdmin, invoice: Stripe.Invoice) {
    await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('stripe_invoice_id', invoice.id);
}

async function handleInvoicePaid(
    supabase: SupabaseAdmin,
    invoice: Stripe.Invoice,
    organizationId: string
) {
    // Update the invoice status
    const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('stripe_invoice_id', invoice.id)
        .single();

    if (existingInvoice) {
        await supabase
            .from('invoices')
            .update({
                status: 'paid',
                paid_date: new Date().toISOString().split('T')[0],
            })
            .eq('stripe_invoice_id', invoice.id);
    } else {
        // Invoice doesn't exist yet - create it as paid
        await handleInvoiceCreated(supabase, invoice, organizationId);
        await supabase
            .from('invoices')
            .update({
                status: 'paid',
                paid_date: new Date().toISOString().split('T')[0],
            })
            .eq('stripe_invoice_id', invoice.id);
    }

    // Update last sync timestamp
    await supabase
        .from('integrations')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('organization_id', organizationId)
        .eq('provider', 'stripe');
}

async function handleInvoicePaymentFailed(supabase: SupabaseAdmin, invoice: Stripe.Invoice) {
    await supabase
        .from('invoices')
        .update({ status: 'overdue' })
        .eq('stripe_invoice_id', invoice.id);
}

async function handleAccountUpdated(
    supabase: SupabaseAdmin,
    account: Stripe.Account,
    connectedAccountId: string
) {
    // Update integration config with latest account status
    await supabase
        .from('integrations')
        .update({
            config: {
                stripe_user_id: connectedAccountId,
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled,
                details_submitted: account.details_submitted,
                updated_at: new Date().toISOString(),
            },
        })
        .eq('provider', 'stripe')
        .contains('config', { stripe_user_id: connectedAccountId });
}

async function handleAccountDeauthorized(
    supabase: SupabaseAdmin,
    connectedAccountId: string
) {
    // Disable the integration when user disconnects from Stripe
    await supabase
        .from('integrations')
        .update({
            enabled: false,
            access_token: null,
            refresh_token: null,
            config: {
                stripe_user_id: connectedAccountId,
                disconnected_at: new Date().toISOString(),
            },
        })
        .eq('provider', 'stripe')
        .contains('config', { stripe_user_id: connectedAccountId });
}
