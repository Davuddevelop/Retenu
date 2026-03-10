import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const TOGGL_API_BASE = 'https://api.track.toggl.com/api/v9';

// Only use for backend operations AFTER auth check
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

// Check if user is authenticated and authorized for this organization
async function checkAuth(organizationId: string) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Ignored
                    }
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { authorized: false, error: 'Unauthorized' };
    }

    // Verify user owns this organization
    const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('id', organizationId)
        .eq('owner_id', user.id)
        .single();

    if (!org) {
        return { authorized: false, error: 'Forbidden' };
    }

    return { authorized: true, user };
}

interface TogglTimeEntry {
    id: number;
    description: string;
    start: string;
    stop: string;
    duration: number;
    project_id: number | null;
    billable: boolean;
    user_id: number;
}

interface TogglProject {
    id: number;
    name: string;
    client_id: number | null;
}

interface TogglClient {
    id: number;
    name: string;
}

// GET - Fetch time entries from Toggl
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!organizationId) {
        return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    // AUTH CHECK
    const authCheck = await checkAuth(organizationId);
    if (!authCheck.authorized) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.error === 'Unauthorized' ? 401 : 403 });
    }

    const supabase = getSupabaseAdmin();

    // Get Toggl integration config
    const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('provider', 'toggl')
        .single();

    if (!integration || !integration.api_key) {
        return NextResponse.json({ error: 'Toggl integration not configured' }, { status: 400 });
    }

    const apiKey = integration.api_key as string;
    const workspaceId = integration.workspace_id as string;

    try {
        // Fetch time entries
        const auth = Buffer.from(`${apiKey}:api_token`).toString('base64');

        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        const entriesResponse = await fetch(
            `${TOGGL_API_BASE}/me/time_entries?${params.toString()}`,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!entriesResponse.ok) {
            throw new Error(`Toggl API error: ${entriesResponse.status}`);
        }

        const entries: TogglTimeEntry[] = await entriesResponse.json();

        // Fetch projects to map to clients
        const projectsResponse = await fetch(
            `${TOGGL_API_BASE}/workspaces/${workspaceId}/projects`,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const projects: TogglProject[] = projectsResponse.ok
            ? await projectsResponse.json()
            : [];

        // Fetch Toggl clients
        const clientsResponse = await fetch(
            `${TOGGL_API_BASE}/workspaces/${workspaceId}/clients`,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const togglClients: TogglClient[] = clientsResponse.ok
            ? await clientsResponse.json()
            : [];

        // Create lookup maps
        const projectMap = new Map(projects.map(p => [p.id, p]));
        const togglClientMap = new Map(togglClients.map(c => [c.id, c]));

        return NextResponse.json({
            entries,
            projects,
            togglClients,
            projectMap: Object.fromEntries(projectMap),
            clientMap: Object.fromEntries(togglClientMap),
        });
    } catch (error) {
        console.error('Toggl API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch from Toggl' },
            { status: 500 }
        );
    }
}

// POST - Sync time entries from Toggl to database
export async function POST(request: Request) {
    const body = await request.json();
    const { organization_id, start_date, end_date, client_mapping } = body;

    if (!organization_id) {
        return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    // AUTH CHECK
    const authCheck = await checkAuth(organization_id);
    if (!authCheck.authorized) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.error === 'Unauthorized' ? 401 : 403 });
    }

    const supabase = getSupabaseAdmin();

    // Get Toggl integration config
    const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', organization_id)
        .eq('provider', 'toggl')
        .single();

    if (!integration || !integration.api_key) {
        return NextResponse.json({ error: 'Toggl integration not configured' }, { status: 400 });
    }

    const apiKey = integration.api_key as string;
    const auth = Buffer.from(`${apiKey}:api_token`).toString('base64');

    try {
        // Fetch time entries
        const params = new URLSearchParams();
        if (start_date) params.append('start_date', start_date);
        if (end_date) params.append('end_date', end_date);

        const response = await fetch(
            `${TOGGL_API_BASE}/me/time_entries?${params.toString()}`,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Toggl API error: ${response.status}`);
        }

        const entries: TogglTimeEntry[] = await response.json();

        // Get existing external IDs to avoid duplicates
        const { data: existing } = await supabase
            .from('time_entries')
            .select('external_id')
            .eq('organization_id', organization_id)
            .eq('source', 'toggl');

        const existingIds = new Set(existing?.map(e => e.external_id) || []);

        // Filter out already imported entries
        const newEntries = entries.filter(e => !existingIds.has(`toggl-${e.id}`));

        // Map and insert entries
        const mappedEntries = newEntries
            .filter(e => e.duration > 0) // Only completed entries
            .map(entry => {
                const clientId = client_mapping?.[entry.project_id || 'default'];
                if (!clientId) return null;

                return {
                    client_id: clientId,
                    organization_id,
                    hours: entry.duration / 3600, // Convert seconds to hours
                    date: entry.start.split('T')[0],
                    team_member: 'Toggl Import',
                    description: entry.description || '',
                    billable: entry.billable,
                    external_id: `toggl-${entry.id}`,
                    source: 'toggl' as const,
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
        console.error('Toggl sync error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to sync from Toggl' },
            { status: 500 }
        );
    }
}
