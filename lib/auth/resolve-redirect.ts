import { createClient } from '@/lib/supabase/server';

export async function resolveRedirect(
    userId: string,
    fallback: string = '/account',
): Promise<string> {
    const supabase = await createClient();
    const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

    if (user && ['admin', 'shop_manager'].includes(user.role)) {
        return '/admin/dashboard';
    }

    return fallback;
}
