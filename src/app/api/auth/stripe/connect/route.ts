// src/app/api/auth/stripe/connect/route.ts
// Initiates Stripe Connect OAuth flow
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const STRIPE_CLIENT_ID = process.env.STRIPE_CLIENT_ID || '';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/stripe/callback`;

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
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
        return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    if (!STRIPE_CLIENT_ID) {
        return NextResponse.json({ error: 'Stripe Connect not configured' }, { status: 500 });
    }

    // Generate a state token to prevent CSRF and track the organization
    const state = Buffer.from(JSON.stringify({
        organization_id: organizationId,
        timestamp: Date.now(),
        nonce: crypto.randomUUID(),
    })).toString('base64url');

    // Store state in a secure cookie for verification on callback
    const cookieStore = await cookies();
    cookieStore.set('stripe_connect_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/',
    });

    // Build Stripe Connect OAuth URL
    const stripeConnectUrl = new URL('https://connect.stripe.com/oauth/authorize');
    stripeConnectUrl.searchParams.set('response_type', 'code');
    stripeConnectUrl.searchParams.set('client_id', STRIPE_CLIENT_ID);
    stripeConnectUrl.searchParams.set('scope', 'read_write');
    stripeConnectUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    stripeConnectUrl.searchParams.set('state', state);
    // Request specific capabilities
    stripeConnectUrl.searchParams.set('stripe_user[business_type]', 'company');

    return NextResponse.redirect(stripeConnectUrl.toString());
}
