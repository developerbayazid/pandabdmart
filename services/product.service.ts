import {
    getAdminProducts,
    getAdminProductById,
    createProduct as createProductInDb,
    updateProduct as updateProductInDb,
    softDeleteProduct,
    createVariant as createVariantInDb,
    updateVariant as updateVariantInDb,
    deleteVariant as deleteVariantInDb,
    getCategoriesForSelect,
    getBrandsForSelect,
    getAttributesForSelect,
} from '@/repositories/product.repository';
import { logAuditEvent } from '@/services/audit.service';
import type {
    AdminProductListItem,
    AdminProductFilters,
    AdminProductFormData,
    AdminVariantFormData,
    AdminCategoryOption,
    AdminBrandOption,
    AdminAttributeOption,
} from '@/types/admin-product';

export type AdminProductListResult = {
    products: AdminProductListItem[];
    total: number;
    page: number;
    totalPages: number;
};

export type ProductFormOptions = {
    categories: AdminCategoryOption[];
    brands: AdminBrandOption[];
    attributes: AdminAttributeOption[];
};

export async function getAdminProductList(
    filters: AdminProductFilters,
): Promise<{ success: boolean; data?: AdminProductListResult; error?: string }> {
    try {
        const result = await getAdminProducts(filters);
        return { success: true, data: result };
    } catch (error) {
        console.error('[services/product] getAdminProductList:', error);
        return { success: false, error: 'Failed to load products' };
    }
}

export async function getProductFormData(
    productId?: string,
): Promise<{
    success: boolean;
    data?: {
        product: Record<string, unknown> | null;
        options: ProductFormOptions;
    };
    error?: string;
}> {
    try {
        const [product, categories, brands, attributes] = await Promise.all([
            productId ? getAdminProductById(productId) : null,
            getCategoriesForSelect(),
            getBrandsForSelect(),
            getAttributesForSelect(),
        ]);

        return {
            success: true,
            data: {
                product,
                options: { categories, brands, attributes },
            },
        };
    } catch (error) {
        console.error('[services/product] getProductFormData:', error);
        return { success: false, error: 'Failed to load form data' };
    }
}

export async function getFormOptions(): Promise<{
    success: boolean;
    data?: ProductFormOptions;
    error?: string;
}> {
    try {
        const [categories, brands, attributes] = await Promise.all([
            getCategoriesForSelect(),
            getBrandsForSelect(),
            getAttributesForSelect(),
        ]);

        return {
            success: true,
            data: { categories, brands, attributes },
        };
    } catch (error) {
        console.error('[services/product] getFormOptions:', error);
        return { success: false, error: 'Failed to load form options' };
    }
}

export async function createProduct(
    actorId: string,
    data: AdminProductFormData,
): Promise<{ success: boolean; productId?: string; error?: string }> {
    try {
        if (!data.name.trim()) {
            return { success: false, error: 'Product name is required' };
        }
        if (!data.slug.trim()) {
            return { success: false, error: 'Slug is required' };
        }
        if (!data.categoryId) {
            return { success: false, error: 'Category is required' };
        }

        const productId = await createProductInDb(data);

        await logAuditEvent({
            actorId,
            action: 'product.create',
            entityType: 'product',
            entityId: productId,
            meta: { name: data.name, type: data.type, status: data.status },
        });

        return { success: true, productId };
    } catch (error) {
        console.error('[services/product] createProduct:', error);
        return { success: false, error: 'Failed to create product' };
    }
}

export async function updateProduct(
    actorId: string,
    productId: string,
    data: Partial<AdminProductFormData>,
): Promise<{ success: boolean; error?: string }> {
    try {
        if (data.name !== undefined && !data.name.trim()) {
            return { success: false, error: 'Product name is required' };
        }
        if (data.slug !== undefined && !data.slug.trim()) {
            return { success: false, error: 'Slug is required' };
        }

        await updateProductInDb(productId, data);

        await logAuditEvent({
            actorId,
            action: 'product.update',
            entityType: 'product',
            entityId: productId,
            meta: data as Record<string, unknown>,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/product] updateProduct:', error);
        return { success: false, error: 'Failed to update product' };
    }
}

export async function deleteProduct(
    actorId: string,
    productId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        await softDeleteProduct(productId);

        await logAuditEvent({
            actorId,
            action: 'product.delete',
            entityType: 'product',
            entityId: productId,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/product] deleteProduct:', error);
        return { success: false, error: 'Failed to delete product' };
    }
}

export async function createVariant(
    actorId: string,
    productId: string,
    data: AdminVariantFormData,
): Promise<{ success: boolean; variantId?: string; error?: string }> {
    try {
        if (!data.sku.trim()) {
            return { success: false, error: 'SKU is required' };
        }
        if (data.price < 0) {
            return { success: false, error: 'Price must be non-negative' };
        }
        if (data.stock < 0) {
            return { success: false, error: 'Stock must be non-negative' };
        }

        const variantId = await createVariantInDb({
            productId,
            sku: data.sku,
            price: data.price,
            comparePrice: data.comparePrice ?? null,
            stock: data.stock,
            isActive: data.isActive,
            attributeValueIds: data.attributeValueIds,
            images: data.images,
        });

        await logAuditEvent({
            actorId,
            action: 'variant.create',
            entityType: 'product_variant',
            entityId: variantId,
            meta: { productId, sku: data.sku, price: data.price },
        });

        return { success: true, variantId };
    } catch (error) {
        console.error('[services/product] createVariant:', error);
        return { success: false, error: 'Failed to create variant' };
    }
}

export async function updateVariant(
    actorId: string,
    variantId: string,
    data: Partial<AdminVariantFormData>,
): Promise<{ success: boolean; error?: string }> {
    try {
        if (data.sku !== undefined && !data.sku.trim()) {
            return { success: false, error: 'SKU is required' };
        }
        if (data.price !== undefined && data.price < 0) {
            return { success: false, error: 'Price must be non-negative' };
        }
        if (data.stock !== undefined && data.stock < 0) {
            return { success: false, error: 'Stock must be non-negative' };
        }

        await updateVariantInDb(variantId, {
            sku: data.sku,
            price: data.price,
            comparePrice: data.comparePrice,
            stock: data.stock,
            isActive: data.isActive,
            attributeValueIds: data.attributeValueIds,
            images: data.images,
        });

        await logAuditEvent({
            actorId,
            action: 'variant.update',
            entityType: 'product_variant',
            entityId: variantId,
            meta: data as Record<string, unknown>,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/product] updateVariant:', error);
        return { success: false, error: 'Failed to update variant' };
    }
}

export async function deleteVariant(
    actorId: string,
    variantId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteVariantInDb(variantId);

        await logAuditEvent({
            actorId,
            action: 'variant.delete',
            entityType: 'product_variant',
            entityId: variantId,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/product] deleteVariant:', error);
        return { success: false, error: 'Failed to delete variant' };
    }
}
