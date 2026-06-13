'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/signin');
        router.refresh();
    };

    return (
        <button
            type="button"
            onClick={handleSignOut}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
            Sign out
        </button>
    );
}
