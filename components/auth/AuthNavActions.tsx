'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SignOutButton } from '@/components/auth/SignOutButton';

type AuthNavActionsProps = {
    isAdmin: boolean;
};

export function AuthNavActions({ isAdmin }: AuthNavActionsProps) {
    const [session, setSession] = useState<boolean | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data }) => {
            setSession(!!data.session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (session === null) {
        return (
            <div className="p-2">
                <User className="w-5 h-5 text-text-muted" />
            </div>
        );
    }

    if (session) {
        return (
            <div className="flex items-center gap-3">
                {isAdmin ? (
                    <Link
                        href="/admin"
                        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                        Dashboard
                    </Link>
                ) : (
                    <Link
                        href="/account"
                        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                        Account
                    </Link>
                )}
                <SignOutButton />
            </div>
        );
    }

    return (
        <Link
            href="/signin"
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Sign in"
        >
            <User className="w-5 h-5" />
        </Link>
    );
}
