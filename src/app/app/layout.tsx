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

    try {
        const cookieStore = await cookies();
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
        const { data: { session } } = await supabase.auth.getSession();
        useSupabase = !!session;
    } catch {
        // If Supabase is not configured, fall back to local mode
        useSupabase = false;
    }

    return (
        <DataProvider useSupabase={useSupabase}>
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
