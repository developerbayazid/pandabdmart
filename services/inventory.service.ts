import {
    getInventoryItems,
    getInventoryItemById,
    createInventoryItem as createInventoryItemInDb,
    updateInventoryItem as updateInventoryItemInDb,
    softDeleteInventoryItem,
    createInventoryVariant as createInventoryVariantInDb,
    updateInventoryVariant as updateInventoryVariantInDb,
    deleteInventoryVariant as deleteInventoryVariantInDb,
    getCategoriesForSelect,
    getBrandsForSelect,
    getDistinctSuppliers,
} from '@/repositories/inventory.repository';
import { createClient } from '@/lib/supabase/server';
import { logAuditEvent } from '@/services/audit.service';
import type {
    InventoryItemListItem,
    InventoryFilters,
    InventoryItemFormData,
    InventoryVariantFormData,
} from '@/types/admin-inventory';

export type InventoryListResult = {
    items: InventoryItemListItem[];
    total: number;
    page: number;
    totalPages: number;
};

export type InventoryFormOptions = {
    categories: { id: string; name: string; fullPath: string }[];
    brands: { id: string; name: string }[];
    suppliers: string[];
};

export async function getInventoryList(
    filters: InventoryFilters,
): Promise<{ success: boolean; data?: InventoryListResult; error?: string }> {
    try {
        const result = await getInventoryItems(filters);
        return { success: true, data: result };
    } catch (error) {
        console.error('[services/inventory] getInventoryList:', error);
        return { success: false, error: 'Failed to load inventory items' };
    }
}

export async function getInventoryFormData(
    itemId?: string,
): Promise<{
    success: boolean;
    data?: {
        item: Record<string, unknown> | null;
        options: InventoryFormOptions;
    };
    error?: string;
}> {
    try {
        const [item, categories, brands, suppliers] = await Promise.all([
            itemId ? getInventoryItemById(itemId) : null,
            getCategoriesForSelect(),
            getBrandsForSelect(),
            getDistinctSuppliers(),
        ]);

        return {
            success: true,
            data: {
                item,
                options: { categories, brands, suppliers },
            },
        };
    } catch (error) {
        console.error('[services/inventory] getInventoryFormData:', error);
        return { success: false, error: 'Failed to load form data' };
    }
}

export async function getFormOptions(): Promise<{
    success: boolean;
    data?: InventoryFormOptions;
    error?: string;
}> {
    try {
        const [categories, brands, suppliers] = await Promise.all([
            getCategoriesForSelect(),
            getBrandsForSelect(),
            getDistinctSuppliers(),
        ]);

        return {
            success: true,
            data: { categories, brands, suppliers },
        };
    } catch (error) {
        console.error('[services/inventory] getFormOptions:', error);
        return { success: false, error: 'Failed to load form options' };
    }
}

export async function createInventoryItem(
    actorId: string,
    data: InventoryItemFormData,
): Promise<{ success: boolean; itemId?: string; error?: string }> {
    try {
        if (!data.name.trim()) {
            return { success: false, error: 'Item name is required' };
        }
        if (!data.skuPrefix.trim()) {
            return { success: false, error: 'SKU prefix is required' };
        }
        if (data.purchasePrice < 0) {
            return { success: false, error: 'Purchase price must be non-negative' };
        }
        if (data.sellingPrice < 0) {
            return { success: false, error: 'Selling price must be non-negative' };
        }

        const itemId = await createInventoryItemInDb(data);

        await logAuditEvent({
            actorId,
            action: 'inventory.create',
            entityType: 'inventory_item',
            entityId: itemId,
            meta: { name: data.name, type: data.type },
        });

        return { success: true, itemId };
    } catch (error) {
        console.error('[services/inventory] createInventoryItem:', error);
        return { success: false, error: 'Failed to create inventory item' };
    }
}

export async function updateInventoryItem(
    actorId: string,
    itemId: string,
    data: Partial<InventoryItemFormData>,
): Promise<{ success: boolean; error?: string }> {
    try {
        if (data.name !== undefined && !data.name.trim()) {
            return { success: false, error: 'Item name is required' };
        }
        if (data.skuPrefix !== undefined && !data.skuPrefix.trim()) {
            return { success: false, error: 'SKU prefix is required' };
        }
        if (data.purchasePrice !== undefined && data.purchasePrice < 0) {
            return { success: false, error: 'Purchase price must be non-negative' };
        }
        if (data.sellingPrice !== undefined && data.sellingPrice < 0) {
            return { success: false, error: 'Selling price must be non-negative' };
        }

        await updateInventoryItemInDb(itemId, data);

        await logAuditEvent({
            actorId,
            action: 'inventory.update',
            entityType: 'inventory_item',
            entityId: itemId,
            meta: data as Record<string, unknown>,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/inventory] updateInventoryItem:', error);
        return { success: false, error: 'Failed to update inventory item' };
    }
}

export async function deleteInventoryItem(
    actorId: string,
    itemId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        await softDeleteInventoryItem(itemId);

        await logAuditEvent({
            actorId,
            action: 'inventory.delete',
            entityType: 'inventory_item',
            entityId: itemId,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/inventory] deleteInventoryItem:', error);
        return { success: false, error: 'Failed to delete inventory item' };
    }
}

export async function createInventoryVariant(
    actorId: string,
    inventoryItemId: string,
    data: InventoryVariantFormData,
): Promise<{ success: boolean; variantId?: string; error?: string }> {
    try {
        if (!data.sku.trim()) {
            return { success: false, error: 'SKU is required' };
        }
        if (data.purchasePrice < 0) {
            return { success: false, error: 'Purchase price must be non-negative' };
        }
        if (data.sellingPrice < 0) {
            return { success: false, error: 'Selling price must be non-negative' };
        }
        if (data.stock < 0) {
            return { success: false, error: 'Stock must be non-negative' };
        }

        const variantId = await createInventoryVariantInDb({
            ...data,
            inventoryItemId,
        });

        await logAuditEvent({
            actorId,
            action: 'inventory_variant.create',
            entityType: 'inventory_variant',
            entityId: variantId,
            meta: { inventoryItemId, sku: data.sku },
        });

        return { success: true, variantId };
    } catch (error) {
        console.error('[services/inventory] createInventoryVariant:', error);
        return { success: false, error: 'Failed to create variant' };
    }
}

export async function updateInventoryVariant(
    actorId: string,
    variantId: string,
    data: Partial<InventoryVariantFormData>,
): Promise<{ success: boolean; error?: string }> {
    try {
        if (data.sku !== undefined && !data.sku.trim()) {
            return { success: false, error: 'SKU is required' };
        }
        if (data.purchasePrice !== undefined && data.purchasePrice < 0) {
            return { success: false, error: 'Purchase price must be non-negative' };
        }
        if (data.sellingPrice !== undefined && data.sellingPrice < 0) {
            return { success: false, error: 'Selling price must be non-negative' };
        }
        if (data.stock !== undefined && data.stock < 0) {
            return { success: false, error: 'Stock must be non-negative' };
        }

        await updateInventoryVariantInDb(variantId, data);

        await logAuditEvent({
            actorId,
            action: 'inventory_variant.update',
            entityType: 'inventory_variant',
            entityId: variantId,
            meta: data as Record<string, unknown>,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/inventory] updateInventoryVariant:', error);
        return { success: false, error: 'Failed to update variant' };
    }
}

export async function deleteInventoryVariant(
    actorId: string,
    variantId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteInventoryVariantInDb(variantId);

        await logAuditEvent({
            actorId,
            action: 'inventory_variant.delete',
            entityType: 'inventory_variant',
            entityId: variantId,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/inventory] deleteInventoryVariant:', error);
        return { success: false, error: 'Failed to delete variant' };
    }
}

export async function transferToProducts(
    actorId: string,
    inventoryItemId: string,
): Promise<{ success: boolean; productId?: string; error?: string }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase.rpc('transfer_inventory_to_product', {
            p_inventory_item_id: inventoryItemId,
            p_actor_id: actorId,
        });

        if (error) {
            console.error('[services/inventory] transferToProducts RPC error:', error);
            return { success: false, error: error.message };
        }

        const result = data as { success: boolean; product_id?: string; error?: string };

        if (!result.success) {
            return { success: false, error: result.error ?? 'Transfer failed' };
        }

        await logAuditEvent({
            actorId,
            action: 'inventory.transfer',
            entityType: 'inventory_item',
            entityId: inventoryItemId,
            meta: { transferredToProductId: result.product_id },
        });

        return { success: true, productId: result.product_id };
    } catch (error) {
        console.error('[services/inventory] transferToProducts:', error);
        return { success: false, error: 'Failed to transfer to products' };
    }
}

export async function revertTransfer(
    actorId: string,
    inventoryItemId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase.rpc('revert_inventory_transfer', {
            p_inventory_item_id: inventoryItemId,
            p_actor_id: actorId,
        });

        if (error) {
            console.error('[services/inventory] revertTransfer RPC error:', error);
            return { success: false, error: error.message };
        }

        const result = data as { success: boolean; error?: string };

        if (!result.success) {
            return { success: false, error: result.error ?? 'Revert failed' };
        }

        await logAuditEvent({
            actorId,
            action: 'inventory.revert',
            entityType: 'inventory_item',
            entityId: inventoryItemId,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/inventory] revertTransfer:', error);
        return { success: false, error: 'Failed to revert transfer' };
    }
}
