// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GradientOrbs, AnimatedGrid, NoiseGrain, Spotlight } from '../../components/Shaders';

// Google icon SVG component
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

export default function LoginPage() {
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const router = useRouter();

    // UI State
    const [isSignIn, setIsSignIn] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (isSignIn) {
            const { error: signInError } = await signIn(email, password);
            if (signInError) {
                setError(signInError.message);
                setIsLoading(false);
            } else {
                router.push('/app');
            }
        } else {
            const { error: signUpError } = await signUp(email, password, {
                fullName,
                companyName
            });
            if (signUpError) {
                setError(signUpError.message);
                setIsLoading(false);
            } else {
                router.push('/app');
            }
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Shader Effects */}
            <GradientOrbs />
            <AnimatedGrid />
            <NoiseGrain />
            <Spotlight />

            {/* Main Container - Centered, Single Column */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center justify-center gap-3 mb-8">
                        <Image src="/logo-removebg-preview.png" alt="Obsidian Logo" width={48} height={48} className="h-12 w-12 object-contain shadow-lg rounded-xl" />
                        <span className="text-2xl font-bold text-[var(--foreground)]">
                            Obsidian
                        </span>
                    </Link>

                    <motion.div
                        key={isSignIn ? 'signin' : 'signup'}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
                            {isSignIn ? "Welcome back" : "Create your account"}
                        </h1>
                        <p className="text-gray-400">
                            {isSignIn
                                ? "Sign in to continue to your dashboard"
                                : "Start recovering lost revenue today"}
                        </p>
                    </motion.div>
                </div>

                {/* Form Card */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 shadow-xl">
                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 rounded-xl bg-[var(--leak)]/10 border border-[var(--leak)]/20 text-[var(--leak)] text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isSignIn && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-5"
                            >
                                <div>
                                    <Label htmlFor="fullName" className="text-gray-400 text-sm mb-2 block">
                                        Full Name
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="fullName"
                                            required={!isSignIn}
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="John Doe"
                                            className="h-12 rounded-xl bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-[var(--leak)] focus-visible:border-[var(--leak)] transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="companyName" className="text-gray-400 text-sm mb-2 block">
                                        Company
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="companyName"
                                            required={!isSignIn}
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="Acme Corp"
                                            className="h-12 rounded-xl bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-[var(--leak)] focus-visible:border-[var(--leak)] transition-all"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div>
                            <Label htmlFor="email" className="text-gray-400 text-sm mb-2 block">
                                Email
                            </Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="h-12 rounded-xl bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-[var(--leak)] focus-visible:border-[var(--leak)] transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <Label htmlFor="password" className="text-gray-400 text-sm">
                                    Password
                                </Label>
                                {isSignIn && (
                                    <a href="#" className="text-xs text-[var(--neutral-metric)] hover:text-blue-400 transition-colors">
                                        Forgot password?
                                    </a>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-12 rounded-xl bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-[var(--leak)] focus-visible:border-[var(--leak)] transition-all"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-[var(--leak)] to-orange-500 hover:from-[var(--leak)]/90 hover:to-orange-500/90 text-white font-semibold transition-all shadow-lg shadow-[var(--leak)]/20 group mt-8"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isSignIn ? "Sign in" : "Create account"}
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--border)]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-[var(--card)] text-gray-500 uppercase tracking-wider">Or</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => signInWithGoogle()}
                        className="w-full h-12 rounded-xl bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background)]/80 hover:border-gray-600 transition-all"
                    >
                        <GoogleIcon className="w-5 h-5 mr-3" />
                        Continue with Google
                    </Button>

                    {/* Toggle Sign In/Up */}
                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-500">
                            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button
                                type="button"
                                onClick={() => { setIsSignIn(!isSignIn); setError(''); }}
                                className="text-[var(--leak)] hover:text-orange-500 font-semibold transition-colors"
                            >
                                {isSignIn ? "Sign up" : "Sign in"}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Terms */}
                <p className="mt-8 text-center text-xs text-gray-600 leading-relaxed">
                    By continuing, you agree to our{' '}
                    <a href="/terms" target="_blank" className="text-gray-500 hover:text-[var(--foreground)] transition-colors underline underline-offset-2">
                        Terms
                    </a>
                    {' '}and{' '}
                    <a href="/privacy" target="_blank" className="text-gray-500 hover:text-[var(--foreground)] transition-colors underline underline-offset-2">
                        Privacy Policy
                    </a>
                </p>
            </motion.div>
        </div>
    )
}
