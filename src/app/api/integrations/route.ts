// src/app/api/integrations/route.ts
// Fetch integrations for an organization
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
        return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    // AUTH CHECK
    const auth = await checkAuth(organizationId);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.error === 'Unauthorized' ? 401 : 403 });
    }

    const supabase = getSupabaseAdmin();

    try {
        const { data: integrations, error } = await supabase
            .from('integrations')
            .select('*')
            .eq('organization_id', organizationId);

        if (error) throw error;

        // Transform for frontend (hide sensitive data)
        const safeIntegrations = (integrations || []).map(integration => ({
            id: integration.id,
            provider: integration.provider,
            enabled: integration.enabled,
            workspace_id: integration.workspace_id,
            last_sync_at: integration.last_sync_at,
            config: {
                // Only expose safe config fields
                stripe_user_id: integration.config?.stripe_user_id,
                user_email: integration.config?.user_email,
                workspace_name: integration.config?.workspace_name,
                connected_at: integration.config?.connected_at,
            },
            // Mask API key - only show last 4 chars
            api_key: integration.api_key
                ? `••••••••${integration.api_key.slice(-4)}`
                : undefined,
        }));

        return NextResponse.json({ integrations: safeIntegrations });
    } catch (error) {
        console.error('Error fetching integrations:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch integrations' },
            { status: 500 }
        );
    }
}

// DELETE - Disconnect an integration
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const provider = searchParams.get('provider');

    if (!organizationId || !provider) {
        return NextResponse.json(
            { error: 'organization_id and provider required' },
            { status: 400 }
        );
    }

    // AUTH CHECK
    const auth = await checkAuth(organizationId);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.error === 'Unauthorized' ? 401 : 403 });
    }

    const supabase = getSupabaseAdmin();

    try {
        const { error } = await supabase
            .from('integrations')
            .update({
                enabled: false,
                access_token: null,
                refresh_token: null,
                api_key: null,
                config: {},
                updated_at: new Date().toISOString(),
            })
            .eq('organization_id', organizationId)
            .eq('provider', provider);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error disconnecting integration:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to disconnect' },
            { status: 500 }
        );
    }
}
