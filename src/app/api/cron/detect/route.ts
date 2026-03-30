// src/app/api/cron/detect/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateClientMetrics, generateClientAlerts } from '@/app/lib/calculations';
import { startOfMonth, endOfMonth } from 'date-fns';
import type { Client, Contract, Invoice, TimeEntry, FinancialSettings } from '@/app/lib/types';

export const dynamic = 'force-dynamic';

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
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    try {
        // Step 1: Get all organizations that are not in demo mode
        const { data: orgs, error: orgsError } = await supabase
            .from('organizations')
            .select('id')
            .eq('demo_mode', false);

        if (orgsError || !orgs) {
            throw new Error('Failed to fetch orgs');
        }

        const now = new Date();
        const periodStart = startOfMonth(now);
        const periodEnd = endOfMonth(now);
        
        const results = [];

        // For each org, fetch their data and run the detection engine
        for (const org of orgs) {
            const orgId = org.id;
            try {
                // Fetch all necessary data concurrently
                const [
                    { data: clients },
                    { data: contracts },
                    { data: invoices },
                    { data: timeEntries },
                    { data: settings }
                ] = await Promise.all([
                    supabase.from('clients').select('*').eq('organization_id', orgId).eq('status', 'active'),
                    supabase.from('contracts').select('*').eq('organization_id', orgId).eq('status', 'active'),
                    supabase.from('invoices').select('*').eq('organization_id', orgId),
                    supabase.from('time_entries').select('*').eq('organization_id', orgId).gte('date', periodStart.toISOString()),
                    supabase.from('financial_settings').select('*').eq('organization_id', orgId).single()
                ]);

                if (!settings || !clients) {
                    continue; // Skip org if no settings or clients configured yet
                }

                const typedClients = clients as unknown as Client[];
                const typedContracts = contracts as unknown as Contract[];
                const typedInvoices = invoices as unknown as Invoice[];
                const typedTimeEntries = timeEntries as unknown as TimeEntry[];
                const typedSettings = settings as unknown as FinancialSettings;

                const generatedAlerts = [];

                // Run calculations per active client
                for (const client of typedClients) {
                    const contract = typedContracts.find(c => c.client_id === client.id) || null;
                    
                    const metrics = calculateClientMetrics(
                        client,
                        contract,
                        typedInvoices,
                        typedTimeEntries,
                        typedSettings,
                        periodStart,
                        periodEnd
                    );

                    const alerts = generateClientAlerts(client, metrics, typedSettings, orgId);
                    generatedAlerts.push(...alerts);
                }

                // Upsert exact alerts into the DB
                if (generatedAlerts.length > 0) {
                    // In a production environment, you might want to resolve old alerts that are no longer active, 
                    // but for simplicity, we focus on upserting active ones based on logic.
                    const { error: insertError } = await supabase
                        .from('alerts')
                        .upsert(
                            generatedAlerts.map(a => ({
                                id: a.id,
                                client_id: a.client_id,
                                organization_id: a.organization_id,
                                alert_type: a.alert_type,
                                severity: a.severity,
                                estimated_leakage: a.estimated_leakage,
                                message: a.message,
                                details: a.details,
                                status: a.status,
                                created_at: a.created_at
                            })), 
                            { onConflict: 'id' } 
                        );

                    if (insertError) throw insertError;
                }

                results.push({ orgId, alertsGenerated: generatedAlerts.length });
            } catch (err) {
                console.error(`Error processing org ${orgId}:`, err);
                results.push({ orgId, error: String(err) });
            }
        }

        return NextResponse.json({ success: true, processed: results.length, results });
    } catch (error) {
        console.error('Detection CRON Error:', error);
        return NextResponse.json({ error: 'Cron execution failed' }, { status: 500 });
    }
}
