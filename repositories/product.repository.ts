import { createClient } from '@/lib/supabase/server';
import type {
    ProductDetail,
    ProductVariant,
    ProductAttribute,
    ProductReview,
    RelatedProduct,
} from '@/types/product';
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

export async function getHomepageProducts(): Promise<ShopProduct[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('products')
        .select(
            `id, name, slug, type, created_at,
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

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
    const supabase = await createClient();

    const { data: product, error } = await supabase
        .from('products')
        .select(
            `id, name, slug, description, type, status, specs,
            category:categories!inner(id, name, slug),
            brand:brands!inner(id, name, slug),
            variants:product_variants(id, sku, price, compare_price, stock, reserved_stock, sold_count, is_active, variant_images(url, is_primary, sort_order), variant_attribute_values(attribute_value_id, attribute_values(id, value, attribute_id, attributes(id, name))))`,
        )
        .eq('slug', slug)
        .eq('status', 'active')
        .is('deleted_at', null)
        .single();

    if (error || !product) {
        console.error('[repositories/product] getProductBySlug:', error);
        return null;
    }

    const category = product.category as unknown as Record<string, string>;
    const brand = product.brand as unknown as Record<string, string>;

    const rawVariants = (product.variants as Record<string, unknown>[]) ?? [];

    const variants: ProductVariant[] = rawVariants.map((v) => {
        const rawImages = (v.variant_images as Record<string, unknown>[]) ?? [];
        const images = rawImages.map((img) => ({
            url: img.url as string,
            isPrimary: img.is_primary as boolean,
            sortOrder: (img.sort_order as number) ?? 0,
        }));

        const rawAttrValues = (v.variant_attribute_values as Record<string, unknown>[]) ?? [];
        const attributes = rawAttrValues.map((av) => {
            const attrValue = av.attribute_values as Record<string, unknown>;
            const attr = attrValue?.attributes as Record<string, unknown>;
            return {
                attributeId: (attr?.id as string) ?? '',
                attributeName: (attr?.name as string) ?? '',
                valueId: (attrValue?.id as string) ?? '',
                value: (attrValue?.value as string) ?? '',
            };
        });

        return {
            id: v.id as string,
            sku: v.sku as string,
            price: (v.price as number) ?? 0,
            comparePrice: (v.compare_price as number) ?? null,
            stock: (v.stock as number) ?? 0,
            reservedStock: (v.reserved_stock as number) ?? 0,
            soldCount: (v.sold_count as number) ?? 0,
            isActive: (v.is_active as boolean) ?? true,
            images,
            attributes,
        };
    });

    // Extract attributes from variants
    const attributeMap = new Map<string, ProductAttribute>();
    for (const variant of variants) {
        for (const attr of variant.attributes) {
            if (!attributeMap.has(attr.attributeId)) {
                attributeMap.set(attr.attributeId, {
                    id: attr.attributeId,
                    name: attr.attributeName,
                    values: [],
                });
            }
            const existing = attributeMap.get(attr.attributeId)!;
            if (!existing.values.find((v) => v.id === attr.valueId)) {
                existing.values.push({ id: attr.valueId, value: attr.value });
            }
        }
    }

    // Fetch reviews for this product
    const { data: reviewData } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, user:users!inner(full_name)')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

    const reviews: ProductReview[] = (reviewData ?? []).map((r) => {
        const user = r.user as unknown as { full_name: string | null };
        return {
            id: r.id as string,
            userName: user.full_name ?? 'Anonymous',
            rating: r.rating as number,
            comment: (r.comment as string) ?? '',
            createdAt: r.created_at as string,
        };
    });

    const avgRating =
        reviews.length > 0
            ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
            : 0;

    return {
        id: product.id as string,
        slug: product.slug as string,
        name: product.name as string,
        description: (product.description as string) ?? null,
        type: (product.type as 'simple' | 'variable') ?? 'simple',
        status: product.status as string,
        brandName: brand.name,
        brandSlug: brand.slug,
        categoryName: category.name,
        categorySlug: category.slug,
        specs: (product.specs as Record<string, unknown>) ?? null,
        variants,
        attributes: Array.from(attributeMap.values()),
        rating: avgRating,
        reviewCount: reviews.length,
        reviews,
    };
}

export async function getRelatedProducts(
    categorySlug: string,
    excludeSlug: string,
    limit: number = 4,
): Promise<RelatedProduct[]> {
    const supabase = await createClient();

    const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

    if (!category) return [];

    const { data, error } = await supabase
        .from('products')
        .select(
            `id, name, slug, type, created_at,
            category:categories!inner(id, name, slug),
            brand:brands!inner(id, name, slug),
            variants:product_variants(id, price, compare_price, stock, reserved_stock, sold_count, is_active, variant_images(url, is_primary))`,
        )
        .eq('status', 'active')
        .is('deleted_at', null)
        .eq('category_id', category.id)
        .neq('slug', excludeSlug)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[repositories/product] getRelatedProducts:', error);
        return [];
    }

    return (data ?? []).map((row) => {
        const category = row.category as unknown as Record<string, string>;
        const brand = row.brand as unknown as Record<string, string>;
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
            price,
            comparePrice,
            image,
            categoryName: category.name,
            categorySlug: category.slug,
            stock,
        };
    });
}
