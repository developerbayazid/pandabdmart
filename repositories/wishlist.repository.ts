import { createClient } from '@/lib/supabase/server';

export type WishlistItem = {
    id: string;
    variantId: string;
    productId: string;
    productName: string;
    productSlug: string;
    variantSku: string;
    price: number;
    comparePrice: number | null;
    stock: number;
    image: string | null;
    attributeNames: string;
    addedAt: string;
};

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('wishlists')
        .select(`
            id,
            variant_id,
            created_at,
            variant:product_variants!inner(
                id,
                sku,
                price,
                compare_price,
                stock,
                reserved_stock,
                product_id,
                product:products!inner(
                    id,
                    name,
                    slug
                ),
                variant_images(url, is_primary),
                variant_attribute_values(
                    value:attribute_values(
                        value,
                        attribute:attributes(name)
                    )
                )
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch wishlist.');

    return (data ?? []).map((item) => {
        const variant = item.variant as unknown as {
            id: string;
            sku: string;
            price: number;
            compare_price: number | null;
            stock: number;
            reserved_stock: number;
            product_id: string;
            product: { id: string; name: string; slug: string };
            variant_images: { url: string; is_primary: boolean }[];
            variant_attribute_values: {
                value: { value: string; attribute: { name: string } };
            }[];
        };

        const primaryImage = variant.variant_images?.find((img) => img.is_primary);
        const attributeNames = variant.variant_attribute_values
            ?.map((vav) => vav.value.value)
            .join(', ') ?? '';

        return {
            id: item.id,
            variantId: variant.id,
            productId: variant.product.id,
            productName: variant.product.name,
            productSlug: variant.product.slug,
            variantSku: variant.sku,
            price: Number(variant.price),
            comparePrice: variant.compare_price ? Number(variant.compare_price) : null,
            stock: variant.stock - (variant.reserved_stock ?? 0),
            image: primaryImage?.url ?? null,
            attributeNames,
            addedAt: item.created_at,
        };
    });
}

export async function addToWishlist(userId: string, variantId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('wishlists')
        .insert({ user_id: userId, variant_id: variantId });

    if (error) {
        if (error.code === '23505') {
            return;
        }
        throw new Error('Failed to add to wishlist.');
    }
}

export async function removeFromWishlist(wishlistId: string, userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId)
        .eq('user_id', userId);

    if (error) throw new Error('Failed to remove from wishlist.');
}

export async function removeFromWishlistByVariant(userId: string, variantId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('variant_id', variantId);

    if (error) throw new Error('Failed to remove from wishlist.');
}

export async function isInWishlist(userId: string, variantId: string): Promise<boolean> {
    const supabase = await createClient();

    const { count, error } = await supabase
        .from('wishlists')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('variant_id', variantId);

    if (error) return false;
    return (count ?? 0) > 0;
}
