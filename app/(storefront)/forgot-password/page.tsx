'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const supabase = createClient();
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/signin`,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        setSent(true);
        setMessage('If an account with that email exists, we sent a reset link.');
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8">
                <h1 className="font-[family-name:var(--font-serif)] text-[28px] font-normal text-text-primary text-center mb-2">
                    Reset your password
                </h1>
                <p className="text-sm text-text-secondary text-center mb-8">
                    Enter your email and we&apos;ll send you a reset link
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

                {!sent ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-surface-inverse text-text-inverse rounded-md px-4 py-2 text-sm font-medium hover:bg-surface-inverse-hover disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Sending...' : 'Send reset link'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <p className="text-sm text-text-secondary mb-6">
                            We sent a password reset link to <span className="font-medium text-text-primary">{email}</span>.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSent(false);
                                setMessage('');
                            }}
                            className="text-sm text-text-secondary underline underline-offset-2 hover:text-text-primary"
                        >
                            Try a different email
                        </button>
                    </div>
                )}

                <p className="mt-8 text-center text-sm text-text-secondary">
                    <Link href="/signin" className="text-text-primary underline underline-offset-2 font-medium hover:text-text-secondary">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
