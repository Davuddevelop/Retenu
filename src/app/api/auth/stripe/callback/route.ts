// src/app/api/auth/stripe/callback/route.ts
// Handles Stripe Connect OAuth callback
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummyKeyForBuild', {
    apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
});

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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Handle OAuth errors
    if (error) {
        console.error('Stripe Connect error:', error, errorDescription);
        return NextResponse.redirect(
            `${appUrl}/app/settings/integrations?error=${encodeURIComponent(errorDescription || error)}`
        );
    }

    if (!code || !state) {
        return NextResponse.redirect(
            `${appUrl}/app/settings/integrations?error=missing_params`
        );
    }

    // Verify state matches what we stored
    const cookieStore = await cookies();
    const storedState = cookieStore.get('stripe_connect_state')?.value;

    if (!storedState || storedState !== state) {
        return NextResponse.redirect(
            `${appUrl}/app/settings/integrations?error=invalid_state`
        );
    }

    // Parse organization ID from state
    let organizationId: string;
    try {
        const stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
        organizationId = stateData.organization_id;

        // Check if state is expired (10 minutes)
        if (Date.now() - stateData.timestamp > 600000) {
            return NextResponse.redirect(
                `${appUrl}/app/settings/integrations?error=expired_state`
            );
        }
    } catch {
        return NextResponse.redirect(
            `${appUrl}/app/settings/integrations?error=invalid_state`
        );
    }

    try {
        // Exchange authorization code for access token
        const response = await stripe.oauth.token({
            grant_type: 'authorization_code',
            code,
        });

        const {
            access_token,
            refresh_token,
            stripe_user_id,
            scope,
            livemode,
        } = response;

        if (!stripe_user_id) {
            throw new Error('No stripe_user_id returned');
        }

        const supabase = getSupabaseAdmin();

        // Upsert the integration record
        const { error: dbError } = await supabase
            .from('integrations')
            .upsert({
                organization_id: organizationId,
                provider: 'stripe',
                access_token,
                refresh_token,
                enabled: true,
                config: {
                    stripe_user_id,
                    scope,
                    livemode,
                    connected_at: new Date().toISOString(),
                },
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'organization_id,provider',
            });

        if (dbError) {
            console.error('Database error:', dbError);
            throw new Error('Failed to save integration');
        }

        // Clear the state cookie
        cookieStore.delete('stripe_connect_state');

        return NextResponse.redirect(
            `${appUrl}/app/settings/integrations?success=stripe_connected`
        );
    } catch (err) {
        console.error('Stripe Connect callback error:', err);
        return NextResponse.redirect(
            `${appUrl}/app/settings/integrations?error=${encodeURIComponent(
                err instanceof Error ? err.message : 'connection_failed'
            )}`
        );
    }
}
