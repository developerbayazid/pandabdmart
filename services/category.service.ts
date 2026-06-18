import {
    getAdminCategoriesAll,
    getAdminCategoryById,
    createCategory as createCategoryInDb,
    updateCategory as updateCategoryInDb,
    softDeleteCategory,
    getCategoriesForParentSelect,
} from '@/repositories/category.repository';
import { logAuditEvent } from '@/services/audit.service';
import type {
    AdminCategoryListResult,
    AdminCategoryFormData,
    AdminParentCategoryOption,
} from '@/types/admin-catalog';

export async function getAdminCategories(): Promise<{
    success: boolean;
    data?: AdminCategoryListResult;
    error?: string;
}> {
    try {
        const result = await getAdminCategoriesAll();
        return { success: true, data: result };
    } catch (error) {
        console.error('[services/category] getAdminCategories:', error);
        return { success: false, error: 'Failed to load categories' };
    }
}

export async function getCategoryFormData(
    categoryId?: string,
): Promise<{
    success: boolean;
    data?: {
        category: AdminCategoryFormData | null;
        parentOptions: AdminParentCategoryOption[];
    };
    error?: string;
}> {
    try {
        const [category, parentOptions] = await Promise.all([
            categoryId ? getAdminCategoryById(categoryId) : null,
            getCategoriesForParentSelect(categoryId),
        ]);

        return {
            success: true,
            data: { category, parentOptions },
        };
    } catch (error) {
        console.error('[services/category] getCategoryFormData:', error);
        return { success: false, error: 'Failed to load form data' };
    }
}

export async function createCategory(
    actorId: string,
    data: AdminCategoryFormData,
): Promise<{ success: boolean; categoryId?: string; error?: string }> {
    try {
        if (!data.name.trim()) {
            return { success: false, error: 'Category name is required' };
        }
        if (!data.slug.trim()) {
            return { success: false, error: 'Slug is required' };
        }

        const categoryId = await createCategoryInDb(data);

        await logAuditEvent({
            actorId,
            action: 'category.create',
            entityType: 'category',
            entityId: categoryId,
            meta: { name: data.name, parentId: data.parentId },
        });

        return { success: true, categoryId };
    } catch (error) {
        console.error('[services/category] createCategory:', error);
        return { success: false, error: 'Failed to create category' };
    }
}

export async function updateCategory(
    actorId: string,
    categoryId: string,
    data: Partial<AdminCategoryFormData>,
): Promise<{ success: boolean; error?: string }> {
    try {
        if (data.name !== undefined && !data.name.trim()) {
            return { success: false, error: 'Category name is required' };
        }
        if (data.slug !== undefined && !data.slug.trim()) {
            return { success: false, error: 'Slug is required' };
        }

        await updateCategoryInDb(categoryId, data);

        await logAuditEvent({
            actorId,
            action: 'category.update',
            entityType: 'category',
            entityId: categoryId,
            meta: data as Record<string, unknown>,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/category] updateCategory:', error);
        return { success: false, error: 'Failed to update category' };
    }
}

export async function deleteCategory(
    actorId: string,
    categoryId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        await softDeleteCategory(categoryId);

        await logAuditEvent({
            actorId,
            action: 'category.delete',
            entityType: 'category',
            entityId: categoryId,
        });

        return { success: true };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to delete category';
        console.error('[services/category] deleteCategory:', error);
        return { success: false, error: message };
    }
}
