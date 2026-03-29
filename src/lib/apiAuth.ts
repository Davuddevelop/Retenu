// src/lib/apiAuth.ts
// Authentication helpers for API routes

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { User, SupabaseClient } from '@supabase/supabase-js';

export interface AuthResult {
    user: User | null;
    supabase: SupabaseClient | null;
    error: string | null;
    response?: NextResponse;
}

export interface OrgAccessResult {
    authorized: boolean;
    error: string | null;
    response?: NextResponse;
}

/**
 * Require authentication for an API route
 * Returns user and supabase client if authenticated, error response if not
 */
export async function requireAuth(): Promise<AuthResult> {
    try {
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
                            // Ignore errors in read-only contexts
                        }
                    },
                },
            }
        );

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return {
                user: null,
                supabase: null,
                error: 'Unauthorized',
                response: NextResponse.json(
                    { error: 'Unauthorized', message: 'Authentication required' },
                    { status: 401 }
                ),
            };
        }

        return { user, supabase, error: null };
    } catch (err) {
        console.error('Auth error:', err);
        return {
            user: null,
            supabase: null,
            error: 'Authentication failed',
            response: NextResponse.json(
                { error: 'Authentication failed' },
                { status: 500 }
            ),
        };
    }
}

/**
 * Verify user has access to an organization
 * Must be called after requireAuth()
 */
export async function requireOrgAccess(
    userId: string,
    organizationId: string,
    supabase: SupabaseClient
): Promise<OrgAccessResult> {
    if (!organizationId) {
        return {
            authorized: false,
            error: 'Organization ID required',
            response: NextResponse.json(
                { error: 'Bad Request', message: 'Organization ID is required' },
                { status: 400 }
            ),
        };
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(organizationId)) {
        return {
            authorized: false,
            error: 'Invalid organization ID format',
            response: NextResponse.json(
                { error: 'Bad Request', message: 'Invalid organization ID format' },
                { status: 400 }
            ),
        };
    }

    try {
        // Check if user owns this organization
        const { data: org, error } = await supabase
            .from('organizations')
            .select('id')
            .eq('id', organizationId)
            .eq('owner_id', userId)
            .single();

        if (error || !org) {
            return {
                authorized: false,
                error: 'Forbidden',
                response: NextResponse.json(
                    { error: 'Forbidden', message: 'You do not have access to this organization' },
                    { status: 403 }
                ),
            };
        }

        return { authorized: true, error: null };
    } catch (err) {
        console.error('Org access check error:', err);
        return {
            authorized: false,
            error: 'Failed to verify organization access',
            response: NextResponse.json(
                { error: 'Internal Server Error' },
                { status: 500 }
            ),
        };
    }
}

/**
 * Combined helper: require auth AND organization access
 */
export async function requireAuthAndOrgAccess(
    organizationId: string
): Promise<AuthResult & OrgAccessResult> {
    const authResult = await requireAuth();

    if (authResult.error || !authResult.user || !authResult.supabase) {
        return {
            ...authResult,
            authorized: false,
        };
    }

    const orgResult = await requireOrgAccess(
        authResult.user.id,
        organizationId,
        authResult.supabase
    );

    return {
        ...authResult,
        ...orgResult,
    };
}

/**
 * Get the authenticated user's organization ID
 */
export async function getUserOrganization(
    userId: string,
    supabase: SupabaseClient
): Promise<{ organizationId: string | null; error: string | null }> {
    try {
        const { data: org, error } = await supabase
            .from('organizations')
            .select('id')
            .eq('owner_id', userId)
            .single();

        if (error || !org) {
            return { organizationId: null, error: 'Organization not found' };
        }

        return { organizationId: org.id, error: null };
    } catch (err) {
        console.error('Get organization error:', err);
        return { organizationId: null, error: 'Failed to get organization' };
    }
}
