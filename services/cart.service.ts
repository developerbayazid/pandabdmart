import { createClient } from '@/lib/supabase/server';
import * as cartRepository from '@/repositories/cart.repository';
import { GuestCartItem } from '@/types/cart';

export async function addItem(
    userId: string,
    variantId: string,
    quantity: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { data: variant, error } = await supabase
            .from('product_variants')
            .select('price, stock, reserved_stock')
            .eq('id', variantId)
            .single();

        if (error || !variant) {
            return { success: false, error: 'Product variant not found.' };
        }

        const availableStock = variant.stock - (variant.reserved_stock ?? 0);

        if (availableStock < quantity) {
            return { success: false, error: 'Not enough stock available.' };
        }

        await cartRepository.addCartItem(
            userId,
            variantId,
            quantity,
            Number(variant.price),
        );

        return { success: true };
    } catch (err) {
        console.error('[services/cart] addItem', err);
        return { success: false, error: 'Failed to add item to cart.' };
    }
}

export async function updateQuantity(
    itemId: string,
    quantity: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        if (quantity < 1) {
            return { success: false, error: 'Quantity must be at least 1.' };
        }

        const supabase = await createClient();

        const { data: cartItem, error: fetchError } = await supabase
            .from('cart_items')
            .select('cart_id, variant_id')
            .eq('id', itemId)
            .single();

        if (fetchError || !cartItem) {
            return { success: false, error: 'Cart item not found.' };
        }

        const { data: variant, error: variantError } = await supabase
            .from('product_variants')
            .select('stock, reserved_stock')
            .eq('id', cartItem.variant_id)
            .single();

        if (variantError || !variant) {
            return { success: false, error: 'Product variant not found.' };
        }

        const availableStock = variant.stock - (variant.reserved_stock ?? 0);

        if (availableStock < quantity) {
            return { success: false, error: `Only ${availableStock} items available.` };
        }

        await cartRepository.updateCartItemQuantity(itemId, quantity);

        return { success: true };
    } catch (err) {
        console.error('[services/cart] updateQuantity', err);
        return { success: false, error: 'Failed to update quantity.' };
    }
}

export async function removeItem(
    itemId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        await cartRepository.removeCartItem(itemId);
        return { success: true };
    } catch (err) {
        console.error('[services/cart] removeItem', err);
        return { success: false, error: 'Failed to remove item.' };
    }
}

export async function clearCart(
    userId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        await cartRepository.clearCart(userId);
        return { success: true };
    } catch (err) {
        console.error('[services/cart] clearCart', err);
        return { success: false, error: 'Failed to clear cart.' };
    }
}

export async function mergeGuestCart(
    userId: string,
    guestItems: GuestCartItem[],
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!guestItems || guestItems.length === 0) {
            return { success: true };
        }

        await cartRepository.mergeGuestCart(userId, guestItems);
        return { success: true };
    } catch (err) {
        console.error('[services/cart] mergeGuestCart', err);
        return { success: false, error: 'Failed to merge cart.' };
    }
}

export type CouponResult = {
    code: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    discount: number;
};

export async function validateCoupon(
    code: string,
    subtotal: number,
): Promise<{ success: boolean; data?: CouponResult; error?: string }> {
    try {
        const supabase = await createClient();

        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();

        if (error || !coupon) {
            return { success: false, error: 'Invalid coupon code.' };
        }

        if (!coupon.is_active) {
            return { success: false, error: 'This coupon is no longer active.' };
        }

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return { success: false, error: 'This coupon has expired.' };
        }

        if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
            return { success: false, error: 'This coupon has reached its usage limit.' };
        }

        if (Number(coupon.min_order) > subtotal) {
            return {
                success: false,
                error: `Minimum order of ৳${Number(coupon.min_order)} required.`,
            };
        }

        let discount = 0;

        if (coupon.type === 'percentage') {
            discount = Math.round((subtotal * Number(coupon.value)) / 100);
        } else if (coupon.type === 'fixed') {
            discount = Math.min(Number(coupon.value), subtotal);
        }

        return {
            success: true,
            data: {
                code: coupon.code,
                type: coupon.type,
                value: Number(coupon.value),
                discount,
            },
        };
    } catch (err) {
        console.error('[services/cart] validateCoupon', err);
        return { success: false, error: 'Failed to validate coupon.' };
    }
}
