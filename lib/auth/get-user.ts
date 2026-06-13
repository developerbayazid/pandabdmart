import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type AuthUser = {
    id: string;
    email: string | undefined;
    role: 'admin' | 'shop_manager' | 'customer';
    fullName: string | null;
};

export async function getUser(): Promise<AuthUser | null> {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    let role: AuthUser['role'] = 'customer';
    let fullName: string | null = null;

    try {
        const { data: profile } = await supabase
            .from('users')
            .select('role, full_name')
            .eq('id', user.id)
            .single();

        if (profile) {
            role = profile.role ?? 'customer';
            fullName = profile.full_name ?? null;
        }
    } catch {
        role = 'customer';
    }

    return {
        id: user.id,
        email: user.email,
        role,
        fullName,
    };
}

export async function getUserOrRedirect(): Promise<AuthUser> {
    const user = await getUser();

    if (!user) {
        redirect('/signin');
    }

    return user;
}
