import {
    getAdminBrands,
    getAdminBrandById,
    createBrand as createBrandInDb,
    updateBrand as updateBrandInDb,
    softDeleteBrand,
} from '@/repositories/brand.repository';
import { logAuditEvent } from '@/services/audit.service';
import type {
    AdminBrandListResult,
    AdminBrandFormData,
    AdminBrandFilters,
} from '@/types/admin-catalog';

export async function getAdminBrandList(
    filters: AdminBrandFilters,
): Promise<{ success: boolean; data?: AdminBrandListResult; error?: string }> {
    try {
        const result = await getAdminBrands(filters);
        return { success: true, data: result };
    } catch (error) {
        console.error('[services/brand] getAdminBrandList:', error);
        return { success: false, error: 'Failed to load brands' };
    }
}

export async function getBrandFormData(
    brandId?: string,
): Promise<{
    success: boolean;
    data?: AdminBrandFormData | null;
    error?: string;
}> {
    try {
        if (!brandId) return { success: true, data: null };

        const brand = await getAdminBrandById(brandId);
        return { success: true, data: brand };
    } catch (error) {
        console.error('[services/brand] getBrandFormData:', error);
        return { success: false, error: 'Failed to load brand data' };
    }
}

export async function createBrand(
    actorId: string,
    data: AdminBrandFormData,
): Promise<{ success: boolean; brandId?: string; error?: string }> {
    try {
        if (!data.name.trim()) {
            return { success: false, error: 'Brand name is required' };
        }
        if (!data.slug.trim()) {
            return { success: false, error: 'Slug is required' };
        }

        const brandId = await createBrandInDb(data);

        await logAuditEvent({
            actorId,
            action: 'brand.create',
            entityType: 'brand',
            entityId: brandId,
            meta: { name: data.name },
        });

        return { success: true, brandId };
    } catch (error) {
        console.error('[services/brand] createBrand:', error);
        return { success: false, error: 'Failed to create brand' };
    }
}

export async function updateBrand(
    actorId: string,
    brandId: string,
    data: Partial<AdminBrandFormData>,
): Promise<{ success: boolean; error?: string }> {
    try {
        if (data.name !== undefined && !data.name.trim()) {
            return { success: false, error: 'Brand name is required' };
        }
        if (data.slug !== undefined && !data.slug.trim()) {
            return { success: false, error: 'Slug is required' };
        }

        await updateBrandInDb(brandId, data);

        await logAuditEvent({
            actorId,
            action: 'brand.update',
            entityType: 'brand',
            entityId: brandId,
            meta: data as Record<string, unknown>,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/brand] updateBrand:', error);
        return { success: false, error: 'Failed to update brand' };
    }
}

export async function deleteBrand(
    actorId: string,
    brandId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        await softDeleteBrand(brandId);

        await logAuditEvent({
            actorId,
            action: 'brand.delete',
            entityType: 'brand',
            entityId: brandId,
        });

        return { success: true };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to delete brand';
        console.error('[services/brand] deleteBrand:', error);
        return { success: false, error: message };
    }
}
