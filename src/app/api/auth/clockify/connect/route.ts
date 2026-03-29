// src/app/api/auth/clockify/connect/route.ts
// Clockify uses API keys, not OAuth - this endpoint validates and saves the API key
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuthAndOrgAccess } from '@/lib/apiAuth';
import { validateBody } from '@/lib/validation/validate';
import { clockifyConnectSchema } from '@/lib/validation/schemas';
import { withRateLimit, applyRateLimitHeaders } from '@/lib/rateLimit';
import { encryptApiKey, isEncryptionConfigured } from '@/lib/encryption';
import { logIntegrationConnect } from '@/lib/audit';

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
    // Rate limiting
    const rateLimit = await withRateLimit(request, 'api');
    if (rateLimit.limited) {
        return rateLimit.response;
    }

    // Parse and validate request body
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
        );
    }

    // Validate input with Zod
    const validation = validateBody(clockifyConnectSchema, body);
    if (!validation.success) {
        return validation.error;
    }

    const { organization_id, api_key, workspace_id } = validation.data;

    // Authenticate and verify organization access
    const auth = await requireAuthAndOrgAccess(organization_id);
    if (auth.error || !auth.user) {
        return auth.response!;
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

        // Encrypt API key before storing
        const encryptedApiKey = isEncryptionConfigured()
            ? encryptApiKey(api_key)
            : null;

        // Upsert integration with encrypted API key
        const { error: dbError } = await supabase
            .from('integrations')
            .upsert({
                organization_id,
                provider: 'clockify',
                // Store encrypted key if encryption is configured, otherwise store plaintext (legacy)
                api_key: encryptedApiKey ? null : api_key,
                api_key_encrypted: encryptedApiKey,
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

        // Audit log the connection
        await logIntegrationConnect(
            auth.user.id,
            organization_id,
            'clockify',
            {
                workspace_id: selectedWorkspaceId,
                workspace_name: workspaceData.name,
                user_email: userData.email,
            },
            request
        );

        const response = NextResponse.json({
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

        return applyRateLimitHeaders(response, rateLimit.headers);
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
    // Rate limiting
    const rateLimit = await withRateLimit(request, 'api');
    if (rateLimit.limited) {
        return rateLimit.response;
    }

    // Require authentication (user must be logged in to validate API keys)
    const auth = await requireAuthAndOrgAccess(
        new URL(request.url).searchParams.get('organization_id') || ''
    );
    if (auth.error) {
        return auth.response!;
    }

    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('api_key');

    if (!apiKey) {
        return NextResponse.json({ error: 'api_key required' }, { status: 400 });
    }

    // Basic validation of API key format
    if (apiKey.length < 10 || apiKey.length > 500) {
        return NextResponse.json({ error: 'Invalid API key format' }, { status: 400 });
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

        const response = NextResponse.json({
            workspaces: workspaces.map((w: { id: string; name: string }) => ({
                id: w.id,
                name: w.name,
            })),
        });

        return applyRateLimitHeaders(response, rateLimit.headers);
    } catch (err) {
        console.error('Clockify workspaces fetch error:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to fetch workspaces' },
            { status: 500 }
        );
    }
}
