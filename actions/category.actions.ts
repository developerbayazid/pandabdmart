'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth/get-user';
import {
    createCategory,
    updateCategory,
    deleteCategory,
} from '@/services/category.service';
import type { AdminCategoryFormData } from '@/types/admin-catalog';

async function getActorId(): Promise<string> {
    const user = await getUser();
    if (!user || !['admin', 'shop_manager'].includes(user.role)) {
        return '';
    }
    return user.id;
}

export async function createCategoryAction(
    data: AdminCategoryFormData,
): Promise<{ success: boolean; categoryId?: string; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await createCategory(actorId, data);
    if (result.success) {
        revalidatePath('/admin/categories');
        revalidatePath('/shop');
        revalidatePath('/');
    }
    return result;
}

export async function updateCategoryAction(
    categoryId: string,
    data: Partial<AdminCategoryFormData>,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await updateCategory(actorId, categoryId, data);
    if (result.success) {
        revalidatePath('/admin/categories');
        revalidatePath('/shop');
        revalidatePath('/');
    }
    return result;
}

export async function deleteCategoryAction(
    categoryId: string,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await deleteCategory(actorId, categoryId);
    if (result.success) {
        revalidatePath('/admin/categories');
        revalidatePath('/shop');
        revalidatePath('/');
    }
    return result;
}
