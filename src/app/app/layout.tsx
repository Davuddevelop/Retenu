// src/app/app/layout.tsx
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import { DataProvider } from '../providers/DataProvider';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check if user is authenticated with Supabase
    let useSupabase = false;
    let isGuestMode = false;
    let isAnonymousUser = false;

    try {
        const cookieStore = await cookies();

        // Check for guest mode cookie
        isGuestMode = cookieStore.get('guest_mode')?.value === 'true';

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key',
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll() { }
                }
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Check if this is an anonymous user (guest mode with Supabase session)
            isAnonymousUser = user.is_anonymous === true;

            // Real authenticated users use Supabase
            // Anonymous/guest users use local demo data
            useSupabase = !isAnonymousUser && !isGuestMode;
        }
    } catch {
        // If Supabase is not configured, fall back to local mode
        useSupabase = false;
    }

    // Force demo mode for guests
    const forceDemoMode = isGuestMode || isAnonymousUser;

    return (
        <DataProvider useSupabase={useSupabase} forceDemoMode={forceDemoMode}>
            <div className="min-h-screen bg-[var(--background)]">
                <Sidebar />
                <div className="md:pl-64 flex flex-col min-h-screen">
                    <TopNav />
                    <main className="flex-1 p-6 md:p-8 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </DataProvider>
    );
}
