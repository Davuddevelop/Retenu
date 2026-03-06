// src/app/api/auth/toggl/connect/route.ts
// Initiates Toggl OAuth flow
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const TOGGL_CLIENT_ID = process.env.TOGGL_CLIENT_ID || '';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/toggl/callback`;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
        return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    if (!TOGGL_CLIENT_ID) {
        return NextResponse.json({ error: 'Toggl OAuth not configured' }, { status: 500 });
    }

    // Generate state token for CSRF protection
    const state = Buffer.from(JSON.stringify({
        organization_id: organizationId,
        timestamp: Date.now(),
        nonce: crypto.randomUUID(),
    })).toString('base64url');

    // Store state in secure cookie
    const cookieStore = await cookies();
    cookieStore.set('toggl_oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
    });

    // Build Toggl OAuth URL
    // Toggl uses standard OAuth 2.0
    const togglAuthUrl = new URL('https://track.toggl.com/oauth/authorize');
    togglAuthUrl.searchParams.set('client_id', TOGGL_CLIENT_ID);
    togglAuthUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    togglAuthUrl.searchParams.set('response_type', 'code');
    togglAuthUrl.searchParams.set('state', state);
    // Request access to time entries and workspaces
    togglAuthUrl.searchParams.set('scope', 'openid profile email');

    return NextResponse.redirect(togglAuthUrl.toString());
}
