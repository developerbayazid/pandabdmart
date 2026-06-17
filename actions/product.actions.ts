'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth/get-user';
import {
    createProduct,
    updateProduct,
    deleteProduct,
    createVariant,
    updateVariant,
    deleteVariant,
} from '@/services/product.service';
import type { AdminProductFormData, AdminVariantFormData } from '@/types/admin-product';

async function getActorId(): Promise<string> {
    const user = await getUser();
    return user?.id ?? '';
}

export async function createProductAction(
    data: AdminProductFormData,
): Promise<{ success: boolean; productId?: string; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await createProduct(actorId, data);
    if (result.success) {
        revalidatePath('/admin/products');
        revalidatePath('/shop');
        revalidatePath('/');
    }
    return result;
}

export async function updateProductAction(
    productId: string,
    data: Partial<AdminProductFormData>,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await updateProduct(actorId, productId, data);
    if (result.success) {
        revalidatePath('/admin/products');
        revalidatePath(`/admin/products/${productId}/edit`);
        revalidatePath('/shop');
        revalidatePath('/');
    }
    return result;
}

export async function deleteProductAction(
    productId: string,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await deleteProduct(actorId, productId);
    if (result.success) {
        revalidatePath('/admin/products');
        revalidatePath('/shop');
        revalidatePath('/');
    }
    return result;
}

export async function createVariantAction(
    productId: string,
    data: AdminVariantFormData,
): Promise<{ success: boolean; variantId?: string; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await createVariant(actorId, productId, data);
    if (result.success) {
        revalidatePath('/admin/products');
        revalidatePath(`/admin/products/${productId}/edit`);
        revalidatePath('/shop');
        revalidatePath('/');
    }
    return result;
}

export async function updateVariantAction(
    variantId: string,
    data: Partial<AdminVariantFormData>,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await updateVariant(actorId, variantId, data);
    if (result.success) {
        revalidatePath('/admin/products');
        revalidatePath('/shop');
        revalidatePath('/');
    }
    return result;
}

export async function deleteVariantAction(
    variantId: string,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await deleteVariant(actorId, variantId);
    if (result.success) {
        revalidatePath('/admin/products');
        revalidatePath('/shop');
        revalidatePath('/');
    }
    return result;
}
