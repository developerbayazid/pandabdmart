import { createClient } from '@/lib/supabase/server';
import type {
    InventoryItemListItem,
    InventoryFilters,
    InventoryItemFormData,
    InventoryVariantFormData,
} from '@/types/admin-inventory';
import { ADMIN_PRODUCTS_PER_PAGE } from '@/lib/constants/pagination';

const INVENTORY_PER_PAGE = ADMIN_PRODUCTS_PER_PAGE;

export async function getInventoryItems(
    filters: InventoryFilters = {},
): Promise<{ items: InventoryItemListItem[]; total: number; page: number; totalPages: number }> {
    const supabase = await createClient();

    let query = supabase
        .from('inventory_items')
        .select(
            'id, name, sku_prefix, type, status, supplier, purchase_price, selling_price, reorder_point, warehouse_location, transferred_to_product_id, created_at, category:categories(id, name), brand:brands(id, name), variants:inventory_variants(id, stock)',
            { count: 'exact' },
        )
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

    if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
    }
    if (filters.brandId) {
        query = query.eq('brand_id', filters.brandId);
    }
    if (filters.supplier) {
        query = query.eq('supplier', filters.supplier);
    }
    if (filters.status) {
        query = query.eq('status', filters.status);
    }

    const page = filters.page ?? 1;
    const from = (page - 1) * INVENTORY_PER_PAGE;
    const to = from + INVENTORY_PER_PAGE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error('[repositories/inventory] getInventoryItems:', error);
        return { items: [], total: 0, page: 1, totalPages: 0 };
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / INVENTORY_PER_PAGE));

    const items: InventoryItemListItem[] = (data ?? []).map((row) => {
        const rawCategory = row.category as unknown;
        const rawBrand = row.brand as unknown;
        const cat = (Array.isArray(rawCategory) ? (rawCategory as Record<string, unknown>[])[0] : rawCategory) as { id: string; name: string } | null | undefined;
        const brd = (Array.isArray(rawBrand) ? (rawBrand as Record<string, unknown>[])[0] : rawBrand) as { id: string; name: string } | null | undefined;
        const category = cat ?? { id: '', name: '-' };
        const brand = brd ?? { id: '', name: '-' };
        const variants = (row.variants as { id: string; stock: number }[]) ?? [];

        const totalStock = variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);

        return {
            id: row.id as string,
            name: row.name as string,
            skuPrefix: row.sku_prefix as string,
            type: (row.type as 'simple' | 'variable') ?? 'simple',
            status: (row.status as 'draft' | 'transferred') ?? 'draft',
            categoryName: category.name,
            brandName: brand.name,
            supplier: (row.supplier as string) ?? '',
            purchasePrice: (row.purchase_price as number) ?? 0,
            sellingPrice: (row.selling_price as number) ?? 0,
            totalStock,
            variantCount: variants.length,
            warehouseLocation: (row.warehouse_location as string) ?? '',
            reorderPoint: (row.reorder_point as number) ?? 5,
            transferredToProductId: (row.transferred_to_product_id as string) ?? null,
            createdAt: row.created_at as string,
        };
    });

    return { items, total, page, totalPages };
}

export async function getInventoryItemById(
    id: string,
): Promise<Record<string, unknown> | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('inventory_items')
        .select(
            `id, name, sku_prefix, type, status, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes, transferred_to_product_id,
            category:categories(id, name),
            brand:brands(id, name),
            variants:inventory_variants(id, sku, purchase_price, selling_price, stock, is_active)`,
        )
        .eq('id', id)
        .is('deleted_at', null)
        .single();

    if (error) {
        console.error('[repositories/inventory] getInventoryItemById:', error);
        return null;
    }

    return data as unknown as Record<string, unknown>;
}

export async function createInventoryItem(
    data: InventoryItemFormData,
): Promise<string> {
    const supabase = await createClient();

    const { data: item, error } = await supabase
        .from('inventory_items')
        .insert({
            name: data.name,
            sku_prefix: data.skuPrefix,
            type: data.type,
            category_id: data.categoryId || null,
            brand_id: data.brandId || null,
            supplier: data.supplier,
            purchase_price: data.purchasePrice,
            selling_price: data.sellingPrice,
            reorder_point: data.reorderPoint,
            warehouse_location: data.warehouseLocation,
            notes: data.notes,
        })
        .select('id')
        .single();

    if (error) {
        console.error('[repositories/inventory] createInventoryItem:', error);
        throw new Error(error.message);
    }

    return item.id as string;
}

export async function updateInventoryItem(
    id: string,
    data: Partial<InventoryItemFormData>,
): Promise<void> {
    const supabase = await createClient();

    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.skuPrefix !== undefined) updates.sku_prefix = data.skuPrefix;
    if (data.type !== undefined) updates.type = data.type;
    if (data.categoryId !== undefined) updates.category_id = data.categoryId || null;
    if (data.brandId !== undefined) updates.brand_id = data.brandId || null;
    if (data.supplier !== undefined) updates.supplier = data.supplier;
    if (data.purchasePrice !== undefined) updates.purchase_price = data.purchasePrice;
    if (data.sellingPrice !== undefined) updates.selling_price = data.sellingPrice;
    if (data.reorderPoint !== undefined) updates.reorder_point = data.reorderPoint;
    if (data.warehouseLocation !== undefined) updates.warehouse_location = data.warehouseLocation;
    if (data.notes !== undefined) updates.notes = data.notes;

    const { error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('[repositories/inventory] updateInventoryItem:', error);
        throw new Error(error.message);
    }
}

export async function softDeleteInventoryItem(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('inventory_items')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('[repositories/inventory] softDeleteInventoryItem:', error);
        throw new Error(error.message);
    }
}

export async function markInventoryItemTransferred(
    id: string,
    productId: string,
): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('inventory_items')
        .update({
            status: 'transferred',
            transferred_to_product_id: productId,
        })
        .eq('id', id);

    if (error) {
        console.error('[repositories/inventory] markInventoryItemTransferred:', error);
        throw new Error(error.message);
    }
}

export async function createInventoryVariant(
    data: InventoryVariantFormData & { inventoryItemId: string },
): Promise<string> {
    const supabase = await createClient();

    const { data: variant, error } = await supabase
        .from('inventory_variants')
        .insert({
            inventory_item_id: data.inventoryItemId,
            sku: data.sku,
            purchase_price: data.purchasePrice,
            selling_price: data.sellingPrice,
            stock: data.stock,
            is_active: data.isActive,
        })
        .select('id')
        .single();

    if (error) {
        console.error('[repositories/inventory] createInventoryVariant:', error);
        throw new Error(error.message);
    }

    return variant.id as string;
}

export async function updateInventoryVariant(
    id: string,
    data: Partial<InventoryVariantFormData>,
): Promise<void> {
    const supabase = await createClient();

    const updates: Record<string, unknown> = {};
    if (data.sku !== undefined) updates.sku = data.sku;
    if (data.purchasePrice !== undefined) updates.purchase_price = data.purchasePrice;
    if (data.sellingPrice !== undefined) updates.selling_price = data.sellingPrice;
    if (data.stock !== undefined) updates.stock = data.stock;
    if (data.isActive !== undefined) updates.is_active = data.isActive;

    if (Object.keys(updates).length === 0) return;

    const { error } = await supabase
        .from('inventory_variants')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('[repositories/inventory] updateInventoryVariant:', error);
        throw new Error(error.message);
    }
}

export async function deleteInventoryVariant(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('inventory_variants')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[repositories/inventory] deleteInventoryVariant:', error);
        throw new Error(error.message);
    }
}

export async function getCategoriesForSelect(): Promise<{ id: string; name: string; fullPath: string }[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('categories')
        .select('id, name, path')
        .order('path', { ascending: true });

    if (error) {
        console.error('[repositories/inventory] getCategoriesForSelect:', error);
        return [];
    }

    return (data ?? []).map((row) => ({
        id: row.id as string,
        name: row.name as string,
        fullPath: (row.path as string) ?? row.name,
    }));
}

export async function getBrandsForSelect(): Promise<{ id: string; name: string }[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .order('name', { ascending: true });

    if (error) {
        console.error('[repositories/inventory] getBrandsForSelect:', error);
        return [];
    }

    return (data ?? []).map((row) => ({
        id: row.id as string,
        name: row.name as string,
    }));
}

export async function getDistinctSuppliers(): Promise<string[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_distinct_inventory_suppliers');

    if (error) {
        console.error('[repositories/inventory] getDistinctSuppliers:', error);
        return [];
    }

    return (data ?? []) as string[];
}
