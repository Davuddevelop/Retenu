// src/app/api/auth/clockify/connect/route.ts
// Clockify uses API keys, not OAuth - this endpoint validates and saves the API key
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

export async function POST(request: Request) {
    const body = await request.json();
    const { organization_id, api_key, workspace_id } = body;

    if (!organization_id || !api_key) {
        return NextResponse.json(
            { error: 'organization_id and api_key are required' },
            { status: 400 }
        );
    }

    try {
        // Validate the API key by fetching user info
        const userResponse = await fetch(`${CLOCKIFY_API_BASE}/user`, {
            headers: { 'X-Api-Key': api_key },
        });

        if (!userResponse.ok) {
            if (userResponse.status === 401) {
                return NextResponse.json(
                    { error: 'Invalid API key' },
                    { status: 401 }
                );
            }
            throw new Error(`Clockify API error: ${userResponse.status}`);
        }

        const userData = await userResponse.json();

        // If no workspace_id provided, get user's default workspace
        let selectedWorkspaceId = workspace_id;
        if (!selectedWorkspaceId) {
            selectedWorkspaceId = userData.defaultWorkspace;
        }

        // Fetch workspace info to validate
        const workspaceResponse = await fetch(
            `${CLOCKIFY_API_BASE}/workspaces/${selectedWorkspaceId}`,
            {
                headers: { 'X-Api-Key': api_key },
            }
        );

        if (!workspaceResponse.ok) {
            return NextResponse.json(
                { error: 'Invalid workspace ID or no access' },
                { status: 400 }
            );
        }

        const workspaceData = await workspaceResponse.json();

        const supabase = getSupabaseAdmin();

        // Upsert integration
        const { error: dbError } = await supabase
            .from('integrations')
            .upsert({
                organization_id,
                provider: 'clockify',
                api_key,
                workspace_id: selectedWorkspaceId,
                enabled: true,
                config: {
                    user_id: userData.id,
                    user_email: userData.email,
                    user_name: userData.name,
                    workspace_name: workspaceData.name,
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

        return NextResponse.json({
            success: true,
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
            },
            workspace: {
                id: selectedWorkspaceId,
                name: workspaceData.name,
            },
        });
    } catch (err) {
        console.error('Clockify connect error:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Connection failed' },
            { status: 500 }
        );
    }
}

// GET - Fetch available workspaces for the API key
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('api_key');

    if (!apiKey) {
        return NextResponse.json({ error: 'api_key required' }, { status: 400 });
    }

    try {
        // Fetch all workspaces for this user
        const workspacesResponse = await fetch(`${CLOCKIFY_API_BASE}/workspaces`, {
            headers: { 'X-Api-Key': apiKey },
        });

        if (!workspacesResponse.ok) {
            if (workspacesResponse.status === 401) {
                return NextResponse.json(
                    { error: 'Invalid API key' },
                    { status: 401 }
                );
            }
            throw new Error(`Clockify API error: ${workspacesResponse.status}`);
        }

        const workspaces = await workspacesResponse.json();

        return NextResponse.json({
            workspaces: workspaces.map((w: { id: string; name: string }) => ({
                id: w.id,
                name: w.name,
            })),
        });
    } catch (err) {
        console.error('Clockify workspaces fetch error:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to fetch workspaces' },
            { status: 500 }
        );
    }
}
