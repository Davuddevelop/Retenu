// src/app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;

    if (code) {
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
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Check if user has an organization, if not create one
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: org } = await supabase
                    .from('organizations')
                    .select('id')
                    .eq('owner_id', user.id)
                    .single();

                if (!org) {
                    // Create default organization for new user
                    await supabase.from('organizations').insert({
                        name: user.user_metadata?.companyName || user.email?.split('@')[0] || 'My Organization',
                        owner_id: user.id,
                    });
                }
            }

            return NextResponse.redirect(`${origin}/app`);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth`);
}
