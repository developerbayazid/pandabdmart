import { createClient } from '@/lib/supabase/server';
import type { ShopFilters, ShopFilterOptions, ShopPageResult, ShopProduct } from '@/types/shop';
import { PRODUCTS_PER_PAGE } from '@/lib/constants/pagination';

async function getCategoryIds(slugs: string[]): Promise<string[]> {
    const supabase = await createClient();
    const { data } = await supabase.from('categories').select('id').in('slug', slugs);
    return (data ?? []).map((c) => c.id);
}

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

export async function getShopProducts(filters: ShopFilters = {}): Promise<ShopPageResult> {
    const supabase = await createClient();

    const categoryIds = filters.categories?.length
        ? await getCategoryIds(filters.categories)
        : undefined;

    const brandIds = filters.brands?.length
        ? await getBrandIds(filters.brands)
        : undefined;

    let query = supabase
        .from('products')
        .select(
            `id, name, slug, created_at,
            category:categories!inner(id, name, slug),
            brand:brands!inner(id, name, slug),
            variants:product_variants(id, price, compare_price, stock, reserved_stock, sold_count, is_active, variant_images(url, is_primary))`,
        )
        .eq('status', 'active')
        .is('deleted_at', null);

    if (categoryIds) {
        query = query.in('category_id', categoryIds);
    }
    if (brandIds) {
        query = query.in('brand_id', brandIds);
    }
    if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('[repositories/product]', error);
        return { products: [], total: 0, page: 1, totalPages: 0 };
    }

    let products: ShopProduct[] = (data ?? []).map(mapRowToProduct);

    // price filtering
    if (filters.minPrice != null) {
        products = products.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice != null) {
        products = products.filter((p) => p.price <= filters.maxPrice!);
    }

    // stock filtering
    if (filters.inStockOnly) {
        products = products.filter((p) => p.stock > 0);
    }

    // sorting
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

    return {
        id: row.id as string,
        slug: row.slug as string,
        name: row.name as string,
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

export async function getHomepageProducts(): Promise<ShopProduct[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('products')
        .select(
            `id, name, slug, description, created_at,
            category:categories!inner(id, name, slug),
            brand:brands!inner(id, name, slug),
            variants:product_variants(id, price, compare_price, stock, reserved_stock, sold_count, is_active, variant_images(url, is_primary))`,
        )
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[repositories/product] getHomepageProducts:', error);
        return [];
    }

    return (data ?? []).map(mapRowToProduct);
}

export async function getShopFilterOptions(): Promise<ShopFilterOptions> {
    const supabase = await createClient();

    const [{ data: categories }, { data: brands }, { data: priceData }] = await Promise.all([
        supabase.from('categories').select('slug, name').order('name'),
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
        categories: (categories ?? []).map((c) => ({ slug: c.slug, name: c.name })),
        brands: (brands ?? []).map((b) => ({ slug: b.slug, name: b.name })),
        priceRange: { min: minPrice, max: maxPrice },
    };
}
