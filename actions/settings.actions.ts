'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth/get-user';
import { createClient } from '@/lib/supabase/server';
import { updateAdminSettings } from '@/services/settings.service';
import type { AdminSettingsFormData } from '@/types/admin-settings';

async function getActorId(): Promise<string> {
    const user = await getUser();
    if (!user || !['admin'].includes(user.role)) {
        return '';
    }
    return user.id;
}

export async function updateStoreSettingsAction(
    settingsId: string,
    data: Partial<AdminSettingsFormData>,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await updateAdminSettings(actorId, settingsId, data);
    if (result.success) {
        revalidatePath('/admin/settings');
    }
    return result;
}

export async function searchProductsAction(query: string): Promise<{ success: boolean; data?: { id: string; name: string }[]; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    if (!query.trim() || query.length < 2) {
        return { success: true, data: [] };
    }

    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('products')
            .select('id, name')
            .ilike('name', `%${query}%`)
            .eq('status', 'active')
            .is('deleted_at', null)
            .order('name')
            .limit(10);

        if (error) throw error;
        return { success: true, data: (data ?? []).map((p) => ({ id: p.id, name: p.name })) };
    } catch (error) {
        console.error('[actions/settings] searchProducts:', error);
        return { success: false, error: 'Failed to search products' };
    }
}
