// src/app/providers/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface SignUpResult {
    error: Error | null;
    needsEmailConfirmation?: boolean;
    message?: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isGuest: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, metadata?: { fullName: string, companyName: string }) => Promise<SignUpResult>;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

            // Check if email confirmation is required (user exists but no session)
            if (data?.user && !data?.session) {
                // User created but needs email confirmation
                // Return special indicator
                return {
                    error: null,
                    needsEmailConfirmation: true,
                    message: 'Please check your email to confirm your account.'
                };
            }

            if (data?.user && data?.session) {
                await ensureOrganization(data.user.id, data.user.email || '', metadata?.companyName);
            }

            return { error: null, needsEmailConfirmation: false };
        } catch (error) {
            return { error: error as Error, needsEmailConfirmation: false };
        }
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

    const signInAsGuest = async () => {
        try {
            // Use Supabase anonymous auth for guest mode
            // This creates a real session that can be verified by middleware
            const { data, error } = await supabase.auth.signInAnonymously();

            if (error) {
                console.error('Anonymous sign in error:', error);
                // Fallback: still set cookie and let user in for demo purposes
                // The DataProvider will handle demo data
            }

            // Set guest mode cookie to indicate demo data should be shown
            // This is now just a flag for data, not for auth bypass
            document.cookie = 'guest_mode=true; path=/; max-age=604800; SameSite=Lax';
            setIsGuest(true);

            if (data?.user) {
                setUser(data.user);
                setSession(data.session);
            }

            router.push('/app');
        } catch (error) {
            console.error('Guest sign in error:', error);
            // Still allow access for demo - middleware will handle appropriately
            document.cookie = 'guest_mode=true; path=/; max-age=604800; SameSite=Lax';
            setIsGuest(true);
            router.push('/app');
        }
    };

    // Override signOut to also handle guest mode
    const handleSignOut = async () => {
        // Clear guest mode cookie regardless
        document.cookie = 'guest_mode=; path=/; max-age=0';

        if (isGuest) {
            setIsGuest(false);
        }

        // Always sign out from Supabase (handles both regular and anonymous users)
        await supabase.auth.signOut();
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
