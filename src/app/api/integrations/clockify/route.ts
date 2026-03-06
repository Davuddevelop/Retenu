// src/app/api/integrations/clockify/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CLOCKIFY_API_BASE = 'https://api.clockify.me/api/v1';

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

interface ClockifyTimeEntry {
    id: string;
    description: string;
    timeInterval: {
        start: string;
        end: string;
        duration: string; // ISO 8601 duration format (PT1H30M)
    };
    projectId: string | null;
    billable: boolean;
    userId: string;
}

interface ClockifyProject {
    id: string;
    name: string;
    clientId: string | null;
}

interface ClockifyClient {
    id: string;
    name: string;
}

// Parse ISO 8601 duration to hours
function parseDurationToHours(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    return hours + minutes / 60 + seconds / 3600;
}

// GET - Fetch time entries from Clockify
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!organizationId) {
        return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get Clockify integration config
    const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('provider', 'clockify')
        .single();

    if (!integration || !integration.api_key) {
        return NextResponse.json({ error: 'Clockify integration not configured' }, { status: 400 });
    }

    const apiKey = integration.api_key as string;
    const workspaceId = integration.workspace_id as string;

    if (!workspaceId) {
        return NextResponse.json({ error: 'Clockify workspace ID not configured' }, { status: 400 });
    }

    try {
        // Get current user
        const userResponse = await fetch(`${CLOCKIFY_API_BASE}/user`, {
            headers: { 'X-Api-Key': apiKey },
        });

        if (!userResponse.ok) {
            throw new Error(`Clockify API error: ${userResponse.status}`);
        }

        const user = await userResponse.json();

        // Fetch time entries
        const params = new URLSearchParams();
        if (startDate) params.append('start', new Date(startDate).toISOString());
        if (endDate) params.append('end', new Date(endDate).toISOString());

        const entriesResponse = await fetch(
            `${CLOCKIFY_API_BASE}/workspaces/${workspaceId}/user/${user.id}/time-entries?${params.toString()}`,
            {
                headers: { 'X-Api-Key': apiKey },
            }
        );

        if (!entriesResponse.ok) {
            throw new Error(`Clockify API error: ${entriesResponse.status}`);
        }

        const entries: ClockifyTimeEntry[] = await entriesResponse.json();

        // Fetch projects
        const projectsResponse = await fetch(
            `${CLOCKIFY_API_BASE}/workspaces/${workspaceId}/projects`,
            {
                headers: { 'X-Api-Key': apiKey },
            }
        );

        const projects: ClockifyProject[] = projectsResponse.ok
            ? await projectsResponse.json()
            : [];

        // Fetch Clockify clients
        const clientsResponse = await fetch(
            `${CLOCKIFY_API_BASE}/workspaces/${workspaceId}/clients`,
            {
                headers: { 'X-Api-Key': apiKey },
            }
        );

        const clockifyClients: ClockifyClient[] = clientsResponse.ok
            ? await clientsResponse.json()
            : [];

        return NextResponse.json({
            entries,
            projects,
            clockifyClients,
        });
    } catch (error) {
        console.error('Clockify API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch from Clockify' },
            { status: 500 }
        );
    }
}

// POST - Sync time entries from Clockify to database
export async function POST(request: Request) {
    const body = await request.json();
    const { organization_id, start_date, end_date, client_mapping } = body;

    if (!organization_id) {
        return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get Clockify integration config
    const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', organization_id)
        .eq('provider', 'clockify')
        .single();

    if (!integration || !integration.api_key) {
        return NextResponse.json({ error: 'Clockify integration not configured' }, { status: 400 });
    }

    const apiKey = integration.api_key as string;
    const workspaceId = integration.workspace_id as string;

    try {
        // Get current user
        const userResponse = await fetch(`${CLOCKIFY_API_BASE}/user`, {
            headers: { 'X-Api-Key': apiKey },
        });

        if (!userResponse.ok) {
            throw new Error(`Clockify API error: ${userResponse.status}`);
        }

        const user = await userResponse.json();

        // Fetch time entries
        const params = new URLSearchParams();
        if (start_date) params.append('start', new Date(start_date).toISOString());
        if (end_date) params.append('end', new Date(end_date).toISOString());

        const response = await fetch(
            `${CLOCKIFY_API_BASE}/workspaces/${workspaceId}/user/${user.id}/time-entries?${params.toString()}`,
            {
                headers: { 'X-Api-Key': apiKey },
            }
        );

        if (!response.ok) {
            throw new Error(`Clockify API error: ${response.status}`);
        }

        const entries: ClockifyTimeEntry[] = await response.json();

        // Get existing external IDs to avoid duplicates
        const { data: existing } = await supabase
            .from('time_entries')
            .select('external_id')
            .eq('organization_id', organization_id)
            .eq('source', 'clockify');

        const existingIds = new Set(existing?.map(e => e.external_id) || []);

        // Filter out already imported entries
        const newEntries = entries.filter(e => !existingIds.has(`clockify-${e.id}`));

        // Map and insert entries
        const mappedEntries = newEntries
            .filter(e => e.timeInterval.end) // Only completed entries
            .map(entry => {
                const clientId = client_mapping?.[entry.projectId || 'default'];
                if (!clientId) return null;

                const hours = parseDurationToHours(entry.timeInterval.duration);

                return {
                    client_id: clientId,
                    organization_id,
                    hours,
                    date: entry.timeInterval.start.split('T')[0],
                    team_member: user.name || 'Clockify Import',
                    description: entry.description || '',
                    billable: entry.billable,
                    external_id: `clockify-${entry.id}`,
                    source: 'clockify' as const,
                };
            })
            .filter(Boolean);

        if (mappedEntries.length > 0) {
            const { error } = await supabase
                .from('time_entries')
                .insert(mappedEntries);

            if (error) throw error;
        }

        // Update last sync timestamp
        await supabase
            .from('integrations')
            .update({ last_sync_at: new Date().toISOString() })
            .eq('id', integration.id);

        return NextResponse.json({
            imported: mappedEntries.length,
            skipped: entries.length - newEntries.length,
            unmapped: newEntries.length - mappedEntries.length,
        });
    } catch (error) {
        console.error('Clockify sync error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to sync from Clockify' },
            { status: 500 }
        );
    }
}
