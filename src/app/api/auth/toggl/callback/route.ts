// src/app/api/auth/toggl/callback/route.ts
// Handles Toggl OAuth callback
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const TOGGL_CLIENT_ID = process.env.TOGGL_CLIENT_ID || '';
const TOGGL_CLIENT_SECRET = process.env.TOGGL_CLIENT_SECRET || '';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/toggl/callback`;

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (error) {
        return NextResponse.redirect(
            `${appUrl}/app/settings/integrations?error=${encodeURIComponent(error)}`
        );
    }

    if (!code || !state) {
        return NextResponse.redirect(
            `${appUrl}/app/settings/integrations?error=missing_params`
        );
    }

    // Verify state
    const cookieStore = await cookies();
    const storedState = cookieStore.get('toggl_oauth_state')?.value;

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
        // Exchange code for tokens
        const tokenResponse = await fetch('https://track.toggl.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: TOGGL_CLIENT_ID,
                client_secret: TOGGL_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Toggl token exchange failed:', errorText);
            throw new Error('Token exchange failed');
        }

        const tokenData = await tokenResponse.json();
        const { access_token, refresh_token, expires_in } = tokenData;

        // Get user info and default workspace
        const userResponse = await fetch('https://api.track.toggl.com/api/v9/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user info');
        }

        const userData = await userResponse.json();
        const defaultWorkspaceId = userData.default_workspace_id;

        const supabase = getSupabaseAdmin();

        // Upsert integration
        const { error: dbError } = await supabase
            .from('integrations')
            .upsert({
                organization_id: organizationId,
                provider: 'toggl',
                access_token,
                refresh_token,
                workspace_id: String(defaultWorkspaceId),
                enabled: true,
                config: {
                    user_id: userData.id,
                    email: userData.email,
                    expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
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

        // Clear state cookie
        cookieStore.delete('toggl_oauth_state');

        return NextResponse.redirect(
            `${appUrl}/app/settings/integrations?success=toggl_connected`
        );
    } catch (err) {
        console.error('Toggl OAuth callback error:', err);
        return NextResponse.redirect(
            `${appUrl}/app/settings/integrations?error=${encodeURIComponent(
                err instanceof Error ? err.message : 'connection_failed'
            )}`
        );
    }
}
