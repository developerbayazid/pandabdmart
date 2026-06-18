import { createClient } from '@/lib/supabase/server';
import type {
    AdminBrandListItem,
    AdminBrandListResult,
    AdminBrandFormData,
    AdminBrandFilters,
} from '@/types/admin-catalog';
import { PRODUCTS_PER_PAGE } from '@/lib/constants/pagination';

export async function getAdminBrands(
    filters: AdminBrandFilters,
): Promise<AdminBrandListResult> {
    const supabase = await createClient();

    let query = supabase
        .from('brands')
        .select('id, name, slug, created_at', { count: 'exact' })
        .is('deleted_at', null)
        .order('name');

    if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
    }

    const page = filters.page ?? 1;
    const from = (page - 1) * PRODUCTS_PER_PAGE;
    const to = from + PRODUCTS_PER_PAGE - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
        console.error('[repositories/brand] getAdminBrands:', error);
        return { brands: [], total: 0, page: 1, totalPages: 0 };
    }

    const brandIds = (data ?? []).map((b) => b.id);

    let productCountMap = new Map<string, number>();
    if (brandIds.length > 0) {
        const { data: prodCounts } = await supabase
            .from('products')
            .select('brand_id')
            .is('deleted_at', null)
            .in('brand_id', brandIds);

        for (const p of prodCounts ?? []) {
            productCountMap.set(
                p.brand_id,
                (productCountMap.get(p.brand_id) ?? 0) + 1,
            );
        }
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));

    const brands: AdminBrandListItem[] = (data ?? []).map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        productCount: productCountMap.get(b.id) ?? 0,
        createdAt: b.created_at,
    }));

    return { brands, total, page, totalPages };
}

export async function getAdminBrandById(
    id: string,
): Promise<AdminBrandFormData | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('brands')
        .select('id, name, slug')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

    if (error || !data) return null;

    return {
        name: data.name,
        slug: data.slug,
    };
}

export async function createBrand(
    data: AdminBrandFormData,
): Promise<string> {
    const supabase = await createClient();

    const { data: created, error } = await supabase
        .from('brands')
        .insert({
            name: data.name,
            slug: data.slug,
        })
        .select('id')
        .single();

    if (error) throw error;
    return created.id;
}

export async function updateBrand(
    id: string,
    data: Partial<AdminBrandFormData>,
): Promise<void> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;

    if (Object.keys(updateData).length === 0) return;

    const { error } = await supabase
        .from('brands')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
}

export async function softDeleteBrand(id: string): Promise<void> {
    const supabase = await createClient();

    const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', id)
        .is('deleted_at', null);

    if (count && count > 0) {
        throw new Error('Cannot delete brand with active products');
    }

    const { error } = await supabase
        .from('brands')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw error;
}
