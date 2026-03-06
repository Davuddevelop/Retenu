// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { signIn, signInWithGoogle } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const { error: signInError } = await signIn(email, password);

        if (signInError) {
            setError(signInError.message);
            setIsLoading(false);
        } else {
            router.push('/app');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
            <div className="max-w-md w-full bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">RevenueLeak</h1>
                    <p className="text-gray-400 mt-2 text-sm">Sign in to your account</p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-900/30 border border-red-800 rounded-lg p-3 text-red-200 text-sm break-words">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                            placeholder="you@agency.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-[var(--foreground)] text-[var(--card)] font-bold rounded-lg px-4 py-2.5 hover:bg-gray-200 transition-colors mt-6 disabled:opacity-50"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? 'Signing in...' : 'Sign In with Email'}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--border)]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[var(--card)] text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => signInWithGoogle()}
                        className="w-full flex items-center justify-center bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] font-medium rounded-lg px-4 py-2.5 hover:bg-[var(--border)] transition-colors"
                    >
                        Google
                    </button>
                </form>
            </div>
        </div>
    );
}
