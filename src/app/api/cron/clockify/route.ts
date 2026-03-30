import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decryptApiKey, isEncryptionConfigured } from '@/lib/encryption';

const CLOCKIFY_API_BASE = 'https://api.clockify.me/api/v1';

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
        // Fetch all active Clockify integrations
        const { data: integrations, error: fetchError } = await supabase
            .from('integrations')
            .select('*')
            .eq('provider', 'clockify')
            .eq('enabled', true);

        if (fetchError || !integrations) {
            throw new Error(`Failed to fetch integrations: ${fetchError?.message}`);
        }

        const results = [];

        for (const integration of integrations) {
            try {
                // Determine API key (check if it was encrypted)
                let apiKey = integration.api_key;
                if (!apiKey && integration.api_key_encrypted && isEncryptionConfigured()) {
                    apiKey = decryptApiKey(integration.api_key_encrypted);
                }

                if (!apiKey) {
                    throw new Error('No API key found attached to integration.');
                }

                const workspaceId = integration.workspace_id;
                const userId = integration.config?.user_id;

                if (!workspaceId || !userId) {
                    throw new Error('Missing workspace or user config');
                }

                // Call Clockify to get time entries for the last 7 days
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - 7);

                const response = await fetch(
                    `${CLOCKIFY_API_BASE}/workspaces/${workspaceId}/user/${userId}/time-entries?start=${start.toISOString()}&end=${end.toISOString()}`,
                    {
                        headers: { 'X-Api-Key': apiKey },
                    }
                );

                if (!response.ok) {
                    throw new Error(`Clockify API error: ${response.status}`);
                }

                const timeEntries = await response.json();
                
                let imported = 0;
                for (const entry of timeEntries) {
                    // Extract project mapping if configured
                    const clientMapping = integration.config?.client_mapping || {};
                    const clientId = clientMapping[entry.projectId || 'default'];

                    // Skip entries without a mapped client
                    if (!clientId) {
                        continue;
                    }
                    
                    const durationStr = entry.timeInterval.duration; // e.g. "PT1H30M"
                    // Parse iso8601 duration
                    const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                    let hours = 0;
                    if (match) {
                        hours = (parseInt(match[1] || '0') * 3600 + parseInt(match[2] || '0') * 60 + parseInt(match[3] || '0')) / 3600.0;
                    }

                    const { error: insertError } = await supabase
                        .from('time_entries')
                        .upsert({
                            organization_id: integration.organization_id,
                            client_id: clientId,
                            hours: Number(hours.toFixed(2)),
                            date: entry.timeInterval.start.split('T')[0],
                            description: entry.description || 'Clockify Entry',
                            billable: entry.billable || false,
                            external_id: `clockify_${entry.id}`,
                            source: 'clockify',
                            created_at: new Date().toISOString()
                        }, { onConflict: 'external_id' });

                    if (!insertError) imported++;
                }

                // Update sync status
                await supabase
                    .from('integrations')
                    .update({ last_sync_at: new Date().toISOString() })
                    .eq('id', integration.id);

                results.push({ org: integration.organization_id, status: 'success', imported });
            } catch (err) {
                results.push({
                    org: integration.organization_id,
                    status: 'error',
                    message: err instanceof Error ? err.message : String(err)
                });
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('CRON Error:', error);
        return NextResponse.json({ error: 'Cron execution failed' }, { status: 500 });
    }
}
