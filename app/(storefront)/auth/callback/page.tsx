'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function AuthCallbackInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();

        supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                const redirectTo = searchParams.get('redirect') || '/account';
                router.push(redirectTo);
                router.refresh();
            }
        });
    }, [router, searchParams]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-sm text-error">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <p className="text-sm text-text-secondary">Signing you in...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><p className="text-sm text-text-secondary">Loading...</p></div>}>
            <AuthCallbackInner />
        </Suspense>
    );
}
