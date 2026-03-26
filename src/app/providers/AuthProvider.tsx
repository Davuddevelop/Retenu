// src/app/providers/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isGuest: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, metadata?: { fullName: string, companyName: string }) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithGitHub: () => Promise<void>;
    signInAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);
    const router = useRouter();
    const [supabase] = useState(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key'
    ));

    // Check for guest mode on mount
    useEffect(() => {
        const guestCookie = document.cookie.split('; ').find(row => row.startsWith('guest_mode='));
        if (guestCookie?.split('=')[1] === 'true') {
            setIsGuest(true);
        }
    }, []);

    useEffect(() => {
        // Check for existing session
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('Error getting session:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                if (event === 'SIGNED_IN') {
                    router.refresh();
                }
                if (event === 'SIGNED_OUT') {
                    router.push('/login');
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    const ensureOrganization = async (userId: string, email: string, companyName?: string) => {
        try {
            const { data: org } = await supabase
                .from('organizations')
                .select('id')
                .eq('owner_id', userId)
                .single();

            if (!org) {
                await supabase.from('organizations').insert({
                    name: companyName || email.split('@')[0] + "'s Agency",
                    owner_id: userId,
                });
            }
        } catch (e) {
            console.error('Error ensuring organization:', e);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            
            if (data?.user) {
                await ensureOrganization(data.user.id, data.user.email || '');
            }
            
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signUp = async (email: string, password: string, metadata?: { fullName: string, companyName: string }) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
            
            if (data?.user && data?.session) {
                await ensureOrganization(data.user.id, data.user.email || '', metadata?.companyName);
            }
            
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const signInWithGitHub = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const signInAsGuest = () => {
        // Set guest mode cookie (expires in 7 days)
        document.cookie = 'guest_mode=true; path=/; max-age=604800; SameSite=Lax';
        setIsGuest(true);
        router.push('/app');
    };

    const exitGuestMode = () => {
        document.cookie = 'guest_mode=; path=/; max-age=0';
        setIsGuest(false);
        router.push('/login');
    };

    // Override signOut to also handle guest mode
    const handleSignOut = async () => {
        if (isGuest) {
            exitGuestMode();
        } else {
            await supabase.auth.signOut();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                isGuest,
                signIn,
                signUp,
                signOut: handleSignOut,
                signInWithGoogle,
                signInWithGitHub,
                signInAsGuest,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
