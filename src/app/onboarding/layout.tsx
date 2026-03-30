// src/app/onboarding/layout.tsx
import { DataProvider } from '../providers/DataProvider';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check if user is authenticated
    try {
        const cookieStore = await cookies();
        const isGuestMode = cookieStore.get('guest_mode')?.value === 'true';

        // Guest users shouldn't be on onboarding
        if (isGuestMode) {
            redirect('/app');
        }

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key',
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll() { }
                }
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        // No user or anonymous user shouldn't be on onboarding
        if (!user || user.is_anonymous) {
            redirect('/login');
        }

        return (
            <DataProvider useSupabase={true} forceDemoMode={false}>
                {children}
            </DataProvider>
        );
    } catch {
        redirect('/login');
    }
}
