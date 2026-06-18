'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth/get-user';
import {
    createBrand,
    updateBrand,
    deleteBrand,
} from '@/services/brand.service';
import type { AdminBrandFormData } from '@/types/admin-catalog';

async function getActorId(): Promise<string> {
    const user = await getUser();
    if (!user || !['admin', 'shop_manager'].includes(user.role)) {
        return '';
    }
    return user.id;
}

export async function createBrandAction(
    data: AdminBrandFormData,
): Promise<{ success: boolean; brandId?: string; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await createBrand(actorId, data);
    if (result.success) {
        revalidatePath('/admin/brands');
        revalidatePath('/shop');
        revalidatePath('/');
    }
    return result;
}

export async function updateBrandAction(
    brandId: string,
    data: Partial<AdminBrandFormData>,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await updateBrand(actorId, brandId, data);
    if (result.success) {
        revalidatePath('/admin/brands');
        revalidatePath('/shop');
        revalidatePath('/');
    }
    return result;
}

export async function deleteBrandAction(
    brandId: string,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await deleteBrand(actorId, brandId);
    if (result.success) {
        revalidatePath('/admin/brands');
        revalidatePath('/shop');
        revalidatePath('/');
    }
    return result;
}
