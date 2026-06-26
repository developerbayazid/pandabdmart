'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth/get-user';
import {
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    createInventoryVariant,
    updateInventoryVariant,
    deleteInventoryVariant,
    transferToProducts,
    revertTransfer,
} from '@/services/inventory.service';
import type { InventoryItemFormData, InventoryVariantFormData } from '@/types/admin-inventory';

async function getActorId(): Promise<string> {
    const user = await getUser();
    return user?.id ?? '';
}

export async function createInventoryItemAction(
    data: InventoryItemFormData,
): Promise<{ success: boolean; itemId?: string; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await createInventoryItem(actorId, data);
    if (result.success) {
        revalidatePath('/admin/inventory');
    }
    return result;
}

export async function updateInventoryItemAction(
    itemId: string,
    data: Partial<InventoryItemFormData>,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await updateInventoryItem(actorId, itemId, data);
    if (result.success) {
        revalidatePath('/admin/inventory');
        revalidatePath(`/admin/inventory/${itemId}/edit`);
    }
    return result;
}

export async function deleteInventoryItemAction(
    itemId: string,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await deleteInventoryItem(actorId, itemId);
    if (result.success) {
        revalidatePath('/admin/inventory');
    }
    return result;
}

export async function createInventoryVariantAction(
    inventoryItemId: string,
    data: InventoryVariantFormData,
): Promise<{ success: boolean; variantId?: string; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await createInventoryVariant(actorId, inventoryItemId, data);
    if (result.success) {
        revalidatePath('/admin/inventory');
        revalidatePath(`/admin/inventory/${inventoryItemId}/edit`);
    }
    return result;
}

export async function updateInventoryVariantAction(
    variantId: string,
    data: Partial<InventoryVariantFormData>,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await updateInventoryVariant(actorId, variantId, data);
    if (result.success) {
        revalidatePath('/admin/inventory');
    }
    return result;
}

export async function deleteInventoryVariantAction(
    variantId: string,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await deleteInventoryVariant(actorId, variantId);
    if (result.success) {
        revalidatePath('/admin/inventory');
    }
    return result;
}

export async function transferToProductsAction(
    inventoryItemId: string,
): Promise<{ success: boolean; productId?: string; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await transferToProducts(actorId, inventoryItemId);
    if (result.success) {
        revalidatePath('/admin/inventory');
        revalidatePath('/admin/products');
        revalidatePath('/shop');
        revalidatePath('/');
    }
    return result;
}

export async function revertTransferAction(
    inventoryItemId: string,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await revertTransfer(actorId, inventoryItemId);
    if (result.success) {
        revalidatePath('/admin/inventory');
        revalidatePath('/admin/products');
        revalidatePath('/shop');
        revalidatePath('/');
    }
    return result;
}
