import { createClient } from '@/lib/supabase/server';
import { CartItem, GuestCartItem } from '@/types/cart';

export async function getCartCount(userId: string): Promise<number> {
    const supabase = await createClient();

    const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

    if (!cart) return 0;

    const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('cart_id', cart.id);

    if (error || !data) return 0;
    return data.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}

async function getOrCreateCart(userId: string): Promise<string> {
    const supabase = await createClient();

    const { data: existing } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

    if (existing) return existing.id;

    const { data: created, error } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();

    if (error) throw new Error('Failed to create cart');
    return created.id;
}

export async function getCartItems(userId: string): Promise<CartItem[]> {
    const cartId = await getOrCreateCart(userId);
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('cart_items')
        .select(`
            id,
            quantity,
            price_at_time,
            variant_id,
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
                        id,
                        value,
                        attribute:attributes(
                            id,
                            name
                        )
                    )
                )
            )
        `)
        .eq('cart_id', cartId);

    if (error) throw new Error('Failed to fetch cart items');

    return (data ?? []).map((item) => {
        const variant = item.variant as unknown as {
            id: string;
            sku: string;
            price: number;
            compare_price: number | null;
            stock: number;
            reserved_stock: number;
            product_id: string;
            product: unknown;
            variant_images: { url: string; is_primary: boolean }[];
            variant_attribute_values: {
                value: {
                    id: string;
                    value: string;
                    attribute: { id: string; name: string };
                };
            }[];
        };
        const product = variant.product as unknown as { id: string; name: string; slug: string };

        const primaryImage = variant.variant_images?.find((img) => img.is_primary);
        const availableStock = variant.stock - (variant.reserved_stock ?? 0);

        return {
            id: item.id,
            variantId: variant.id,
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            variantSku: variant.sku,
            variantAttributes: (variant.variant_attribute_values ?? []).map((vav) => ({
                attributeName: vav.value.attribute.name,
                value: vav.value.value,
            })),
            unitPrice: Number(item.price_at_time),
            comparePrice: variant.compare_price ? Number(variant.compare_price) : null,
            quantity: item.quantity,
            image: primaryImage?.url ?? null,
            stock: availableStock,
        };
    });
}

export async function addCartItem(
    userId: string,
    variantId: string,
    quantity: number,
    priceAtTime: number,
): Promise<void> {
    const cartId = await getOrCreateCart(userId);
    const supabase = await createClient();

    const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('variant_id', variantId)
        .maybeSingle();

    if (existing) {
        const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + quantity })
            .eq('id', existing.id);

        if (error) throw new Error('Failed to update cart item');
        return;
    }

    const { error } = await supabase
        .from('cart_items')
        .insert({
            cart_id: cartId,
            variant_id: variantId,
            quantity,
            price_at_time: priceAtTime,
        });

    if (error) throw new Error('Failed to add item to cart');
}

export async function updateCartItemQuantity(
    itemId: string,
    quantity: number,
): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

    if (error) throw new Error('Failed to update cart item quantity');
}

export async function removeCartItem(itemId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

    if (error) throw new Error('Failed to remove cart item');
}

export async function clearCart(userId: string): Promise<void> {
    const cartId = await getOrCreateCart(userId);
    const supabase = await createClient();

    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

    if (error) throw new Error('Failed to clear cart');
}

export async function mergeGuestCart(
    userId: string,
    guestItems: GuestCartItem[],
): Promise<void> {
    const cartId = await getOrCreateCart(userId);
    const supabase = await createClient();

    for (const guestItem of guestItems) {
        const { data: existing } = await supabase
            .from('cart_items')
            .select('id')
            .eq('cart_id', cartId)
            .eq('variant_id', guestItem.variantId)
            .maybeSingle();

        if (existing) continue;

        const { error } = await supabase
            .from('cart_items')
            .insert({
                cart_id: cartId,
                variant_id: guestItem.variantId,
                quantity: guestItem.quantity,
                price_at_time: guestItem.priceAtTime,
            });

        if (error) throw new Error('Failed to merge cart item');
    }
}
