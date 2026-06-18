import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { CategoryPageData } from '@/types/category';
import type { ShopFilters, ShopFilterOptions, ShopPageResult, ShopProduct } from '@/types/shop';
import { PRODUCTS_PER_PAGE } from '@/lib/constants/pagination';

export const getCategoryBySlug = cache(async (slug: string): Promise<CategoryPageData | null> => {
    const supabase = await createClient();

    const { data: category, error } = await supabase
        .from('categories')
        .select('id, name, slug, path, parent_id')
        .eq('slug', slug)
        .single();

    if (error || !category) return null;

    let ancestors: { name: string; slug: string }[] = [];

    if (category.path) {
        const pathSlugs = category.path.split('/');
        const ancestorSlugs = pathSlugs.slice(0, -1);

        if (ancestorSlugs.length > 0) {
            const { data: ancestorData } = await supabase
                .from('categories')
                .select('name, slug')
                .in('slug', ancestorSlugs);

            if (ancestorData) {
                const slugOrder = new Map<string, number>(
                    ancestorSlugs.map((s: string, i: number) => [s, i]),
                );
                ancestors = ancestorData.sort(
                    (a, b) => (slugOrder.get(a.slug) ?? 0) - (slugOrder.get(b.slug) ?? 0),
                );
            }
        }
    }

    const { data: children } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('parent_id', category.id)
        .order('name');

    return {
        category: { id: category.id, name: category.name, slug: category.slug },
        ancestors,
        children: (children ?? []).map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    };
});

async function getBrandIds(slugs: string[]): Promise<string[]> {
    const supabase = await createClient();
    const { data } = await supabase.from('brands').select('id').in('slug', slugs);
    return (data ?? []).map((b) => b.id);
}

function getMinPrice(variants: { price: number }[]): number {
    if (!variants || variants.length === 0) return 0;
    return Math.min(...variants.map((v) => v.price));
}

function getAvailableStock(variants: { stock: number; reserved_stock: number }[]): number {
    return variants.reduce((sum, v) => sum + Math.max(0, v.stock - (v.reserved_stock ?? 0)), 0);
}

function getPrimaryImage(variants: { variant_images: { url: string; is_primary: boolean }[] | null }[]): string | null {
    for (const variant of variants) {
        if (!variant.variant_images) continue;
        const primary = variant.variant_images.find((img) => img.is_primary);
        if (primary) return primary.url;
        if (variant.variant_images.length > 0) return variant.variant_images[0].url;
    }
    return null;
}

function mapRowToProduct(row: Record<string, unknown>): ShopProduct {
    const category = row.category as Record<string, string>;
    const brand = row.brand as Record<string, string>;
    const variants = (row.variants as Record<string, unknown>[]) ?? [];

    const price = getMinPrice(
        variants.map((v) => ({ price: (v.price as number) ?? 0 })),
    );

    const cheapestVariant = [...variants].sort(
        (a, b) => ((a.price as number) ?? 0) - ((b.price as number) ?? 0),
    )[0];
    const comparePrice =
        cheapestVariant && (cheapestVariant.compare_price as number)
            ? (cheapestVariant.compare_price as number)
            : null;

    const stock = getAvailableStock(
        variants.map((v) => ({
            stock: (v.stock as number) ?? 0,
            reserved_stock: (v.reserved_stock as number) ?? 0,
        })),
    );
    const image = getPrimaryImage(
        variants.map((v) => ({
            variant_images: v.variant_images as { url: string; is_primary: boolean }[] | null,
        })),
    );

    const primaryVariantId = variants.length === 1 ? (variants[0].id as string) : null;

    return {
        id: row.id as string,
        slug: row.slug as string,
        name: row.name as string,
        type: (row.type as 'simple' | 'variable') ?? 'simple',
        variantId: primaryVariantId,
        categorySlug: category.slug,
        categoryName: category.name,
        brandSlug: brand.slug,
        brandName: brand.name,
        price,
        comparePrice,
        stock,
        image,
        description: (row.description as string) ?? null,
        rating: 0,
        reviewCount: 0,
        createdAt: row.created_at as string,
    };
}

export async function getCategoryProducts(
    categorySlug: string,
    filters: ShopFilters = {},
): Promise<ShopPageResult> {
    const supabase = await createClient();

    const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

    if (!category) {
        return { products: [], total: 0, page: 1, totalPages: 0 };
    }

    const brandIds = filters.brands?.length
        ? await getBrandIds(filters.brands)
        : undefined;

    let query = supabase
        .from('products')
        .select(
            `id, name, slug, type, description, created_at,
            category:categories!inner(id, name, slug),
            brand:brands!inner(id, name, slug),
            variants:product_variants(id, price, compare_price, stock, reserved_stock, sold_count, is_active, variant_images(url, is_primary))`,
        )
        .eq('status', 'active')
        .is('deleted_at', null)
        .eq('category_id', category.id);

    if (brandIds) {
        query = query.in('brand_id', brandIds);
    }
    if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('[repositories/category] getCategoryProducts:', error);
        return { products: [], total: 0, page: 1, totalPages: 0 };
    }

    let products: ShopProduct[] = (data ?? []).map(mapRowToProduct);

    if (filters.minPrice != null) {
        products = products.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice != null) {
        products = products.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.inStockOnly) {
        products = products.filter((p) => p.stock > 0);
    }

    switch (filters.sort) {
        case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
        default:
            products.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            );
            break;
    }

    const total = products.length;
    const page = filters.page ?? 1;
    const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    const paginatedProducts = products.slice(start, start + PRODUCTS_PER_PAGE);

    return { products: paginatedProducts, total, page, totalPages };
}

import type {
    AdminCategoryListItem,
    AdminCategoryListResult,
    AdminCategoryFormData,
    AdminParentCategoryOption,
} from '@/types/admin-catalog';

export async function getAdminCategoriesAll(): Promise<AdminCategoryListResult> {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
        .from('categories')
        .select('id, parent_id, name, slug, path')
        .is('deleted_at', null)
        .order('path')
        .order('name');

    if (error) {
        console.error('[repositories/category] getAdminCategoriesAll:', error);
        return { categories: [], total: 0 };
    }

    const result: AdminCategoryListItem[] = (categories ?? []).map((c) => ({
        id: c.id,
        parentId: c.parent_id,
        name: c.name,
        slug: c.slug,
        path: c.path,
        childrenCount: 0,
        productCount: 0,
    }));

    const categoryIds = result.map((c) => c.id);

    if (categoryIds.length > 0) {
        const [{ data: childCounts }, { data: prodCounts }] = await Promise.all([
            supabase
                .from('categories')
                .select('parent_id')
                .is('deleted_at', null)
                .in('parent_id', categoryIds),
            supabase
                .from('products')
                .select('category_id')
                .is('deleted_at', null)
                .in('category_id', categoryIds),
        ]);

        const childCountMap = new Map<string, number>();
        (childCounts ?? []).forEach((c) => {
            if (c.parent_id) {
                childCountMap.set(c.parent_id, (childCountMap.get(c.parent_id) ?? 0) + 1);
            }
        });

        const prodCountMap = new Map<string, number>();
        (prodCounts ?? []).forEach((p) => {
            prodCountMap.set(p.category_id, (prodCountMap.get(p.category_id) ?? 0) + 1);
        });

        for (const cat of result) {
            cat.childrenCount = childCountMap.get(cat.id) ?? 0;
            cat.productCount = prodCountMap.get(cat.id) ?? 0;
        }
    }

    return { categories: result, total: result.length };
}

export async function getAdminCategoryById(
    id: string,
): Promise<AdminCategoryFormData | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('categories')
        .select('id, parent_id, name, slug')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

    if (error || !data) return null;

    return {
        name: data.name,
        slug: data.slug,
        parentId: data.parent_id,
    };
}

export async function createCategory(
    data: AdminCategoryFormData,
): Promise<string> {
    const supabase = await createClient();

    let computedPath: string | null = null;
    if (data.parentId) {
        const { data: parent } = await supabase
            .from('categories')
            .select('path, slug')
            .eq('id', data.parentId)
            .is('deleted_at', null)
            .single();

        if (parent) {
            const parentPath = parent.path || parent.slug;
            computedPath = `${parentPath}/${data.slug}`;
        }
    }

    const { data: created, error } = await supabase
        .from('categories')
        .insert({
            name: data.name,
            slug: data.slug,
            parent_id: data.parentId,
            path: computedPath ?? data.slug,
        })
        .select('id')
        .single();

    if (error) throw error;
    return created.id;
}

export async function updateCategory(
    id: string,
    data: Partial<AdminCategoryFormData>,
): Promise<void> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.parentId !== undefined) updateData.parent_id = data.parentId;

    if (data.parentId !== undefined || data.slug !== undefined) {
        let computedPath: string | null = null;
        if (data.parentId !== undefined) {
            if (data.parentId) {
                const { data: parent } = await supabase
                    .from('categories')
                    .select('path, slug')
                    .eq('id', data.parentId)
                    .is('deleted_at', null)
                    .single();

                if (parent) {
                    const parentPath = parent.path || parent.slug;
                    computedPath = `${parentPath}/${data.slug ?? ''}`;
                }
            } else {
                computedPath = data.slug ?? null;
            }
        } else if (data.slug) {
            const { data: current } = await supabase
                .from('categories')
                .select('parent_id')
                .eq('id', id)
                .single();

            if (current?.parent_id) {
                const { data: currentParent } = await supabase
                    .from('categories')
                    .select('path, slug')
                    .eq('id', current.parent_id)
                    .single();

                if (currentParent) {
                    const parentPath = currentParent.path || currentParent.slug;
                    computedPath = `${parentPath}/${data.slug}`;
                } else {
                    computedPath = data.slug;
                }
            } else {
                computedPath = data.slug;
            }
        }
        if (computedPath) updateData.path = computedPath;
    }

    if (data.parentId !== undefined && data.parentId) {
        if (data.parentId === id) {
            throw new Error('Cannot set category as its own parent');
        }
    }

    if (Object.keys(updateData).length === 0) return;

    const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
}

export async function softDeleteCategory(id: string): Promise<void> {
    const supabase = await createClient();

    const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id)
        .is('deleted_at', null);

    if (count && count > 0) {
        throw new Error('Cannot delete category with active products');
    }

    const { count: childCount } = await supabase
        .from('categories')
        .select('id', { count: 'exact', head: true })
        .eq('parent_id', id)
        .is('deleted_at', null);

    if (childCount && childCount > 0) {
        throw new Error('Cannot delete category with subcategories');
    }

    const { error } = await supabase
        .from('categories')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw error;
}

export async function getCategoriesForParentSelect(
    excludeId?: string,
): Promise<AdminParentCategoryOption[]> {
    const supabase = await createClient();

    let query = supabase
        .from('categories')
        .select('id, name, path')
        .is('deleted_at', null)
        .order('path')
        .order('name');

    if (excludeId) {
        query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) return [];

    return (data ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        path: c.path,
        depth: c.path ? c.path.split('/').length : 1,
    }));
}

export async function getCategoryFilterOptions(): Promise<ShopFilterOptions> {
    const supabase = await createClient();

    const [{ data: brands }, { data: priceData }] = await Promise.all([
        supabase.from('brands').select('slug, name').order('name'),
        supabase
            .from('product_variants')
            .select('price')
            .eq('is_active', true)
            .order('price', { ascending: true })
            .limit(1),
    ]);

    const minPrice =
        priceData && priceData.length > 0 ? Math.floor(Number(priceData[0].price)) : 0;

    const { data: maxPriceData } = await supabase
        .from('product_variants')
        .select('price')
        .eq('is_active', true)
        .order('price', { ascending: false })
        .limit(1);

    const maxPrice =
        maxPriceData && maxPriceData.length > 0
            ? Math.ceil(Number(maxPriceData[0].price))
            : 100;

    return {
        categories: [],
        brands: (brands ?? []).map((b) => ({ slug: b.slug, name: b.name })),
        priceRange: { min: minPrice, max: maxPrice },
    };
}
