'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        const supabase = createClient();
        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name },
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        router.push('/account');
        router.refresh();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8">
                <h1 className="font-[family-name:var(--font-serif)] text-[28px] font-normal text-text-primary text-center mb-2">
                    Create an account
                </h1>
                <p className="text-sm text-text-secondary text-center mb-8">
                    Sign up to start shopping
                </p>

                {error && (
                    <div className="bg-error-light text-error-foreground text-sm p-3 rounded-md mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Full name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                            placeholder="Your name"
                        />
                    </div>

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
                            minLength={6}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                            placeholder="Min. 6 characters"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Confirm password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                            placeholder="Re-enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-surface-inverse text-text-inverse rounded-md px-4 py-2 text-sm font-medium hover:bg-surface-inverse-hover disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-text-secondary">
                    Already have an account?{' '}
                    <Link href="/signin" className="text-text-primary underline underline-offset-2 font-medium hover:text-text-secondary">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
