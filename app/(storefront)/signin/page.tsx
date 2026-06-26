'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { mergeGuestCartOnLogin } from '@/lib/cart/merge';

type SignInMode = 'password' | 'magic-link';

function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/account';

    const [mode, setMode] = useState<SignInMode>('password');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(async ({ data }) => {
            if (data.session) {
                const { data: userRow } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', data.session.user.id)
                    .single();

                const resolvedRedirect =
                    userRow && ['admin', 'shop_manager'].includes(userRow.role)
                        ? '/admin/dashboard'
                        : redirectTo;

                router.replace(resolvedRedirect);
            }
        });
    }, [router, redirectTo]);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const hashError = params.get('error_description') || params.get('error');
            if (hashError) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setError(decodeURIComponent(hashError));
                window.location.hash = '';
            }
        }
    }, []);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const handlePasswordSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const supabase = createClient();
        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError || !data.user) {
            setError(authError?.message ?? 'Sign in failed');
            setLoading(false);
            return;
        }

        await mergeGuestCartOnLogin();

        const { data: userRow } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();

        const resolvedRedirect =
            userRow && ['admin', 'shop_manager'].includes(userRow.role)
                ? '/admin/dashboard'
                : redirectTo;

        router.push(resolvedRedirect);
        router.refresh();
    };

    const handleMagicLinkSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}` },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        setMessage('Check your email — we sent a sign-in link.');
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8">
                <h1 className="font-[family-name:var(--font-serif)] text-[28px] font-normal text-text-primary text-center mb-2">
                    Sign in
                </h1>
                <p className="text-sm text-text-secondary text-center mb-8">
                    Welcome back — sign in to your account
                </p>

                {error && (
                    <div className="bg-error-light text-error-foreground text-sm p-3 rounded-md mb-6">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-success-light text-success-foreground text-sm p-3 rounded-md mb-6">
                        {message}
                    </div>
                )}

                {mode === 'password' ? (
                    <>
                        <form onSubmit={handlePasswordSignIn} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-text-secondary underline underline-offset-2 hover:text-text-primary"
                                >
                                    Forgot password?
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError('');
                                        setMessage('');
                                        setMode('magic-link');
                                    }}
                                    className="text-xs text-text-secondary underline underline-offset-2 hover:text-text-primary"
                                >
                                    Sign in without a password
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-surface-inverse text-text-inverse rounded-md px-4 py-2 text-sm font-medium hover:bg-surface-inverse-hover disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                    </>
                ) : (
                    <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
                        <div>
                            <label htmlFor="email-magic" className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                Email
                            </label>
                            <input
                                id="email-magic"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                placeholder="you@example.com"
                            />
                            <p className="mt-1 text-xs text-text-muted">
                                We&apos;ll email you a link to sign in instantly.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-surface-inverse text-text-inverse rounded-md px-4 py-2 text-sm font-medium hover:bg-surface-inverse-hover disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Sending link...' : 'Send sign-in link'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setError('');
                                setMessage('');
                                setPassword('');
                                setMode('password');
                            }}
                            className="w-full text-sm text-text-secondary underline underline-offset-2 hover:text-text-primary"
                        >
                            Sign in with password instead
                        </button>
                    </form>
                )}

                <p className="mt-8 text-center text-sm text-text-secondary">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-text-primary underline underline-offset-2 font-medium hover:text-text-secondary">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><p className="text-sm text-text-secondary">Loading...</p></div>}>
            <SignInForm />
        </Suspense>
    );
}
