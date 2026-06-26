'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { mergeGuestCartOnLogin } from '@/lib/cart/merge';

function AuthCallbackInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();

        supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                await mergeGuestCartOnLogin();

                const { data: userRow } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                const redirectTo = searchParams.get('redirect');
                const resolvedRedirect =
                    userRow && ['admin', 'shop_manager'].includes(userRow.role)
                        ? '/admin/dashboard'
                        : redirectTo || '/account';

                router.push(resolvedRedirect);
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
