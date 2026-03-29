// src/app/api/auth/stripe/connect/route.ts
// Initiates Stripe Connect OAuth flow
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAuthAndOrgAccess } from '@/lib/apiAuth';
import { withRateLimit } from '@/lib/rateLimit';

const STRIPE_CLIENT_ID = process.env.STRIPE_CLIENT_ID || '';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/stripe/callback`;

export async function GET(request: Request) {
    // Rate limiting
    const rateLimit = await withRateLimit(request, 'auth');
    if (rateLimit.limited) {
        return rateLimit.response;
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
        return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(organizationId)) {
        return NextResponse.json({ error: 'Invalid organization_id format' }, { status: 400 });
    }

    // Authenticate and verify organization access
    const auth = await requireAuthAndOrgAccess(organizationId);
    if (auth.error || !auth.user) {
        return auth.response!;
    }

    if (!STRIPE_CLIENT_ID) {
        return NextResponse.json({ error: 'Stripe Connect not configured' }, { status: 500 });
    }

    // Generate a state token to prevent CSRF and track the organization
    // Include user ID for additional verification on callback
    const state = Buffer.from(JSON.stringify({
        organization_id: organizationId,
        user_id: auth.user.id,
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
