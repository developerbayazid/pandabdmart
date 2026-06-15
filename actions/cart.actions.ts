'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth/require-auth';
import * as cartService from '@/services/cart.service';

export type CartActionResult = {
    success: boolean;
    error?: string;
};

export type CouponActionResult = {
    success: boolean;
    error?: string;
    data?: {
        code: string;
        type: string;
        value: number;
        discount: number;
    };
};

export async function addItemAction(
    variantId: string,
    quantity: number,
): Promise<CartActionResult> {
    const user = await requireAuth();
    const result = await cartService.addItem(user.id, variantId, quantity);
    if (result.success) revalidatePath('/cart');
    return result;
}

export async function updateQuantityAction(
    itemId: string,
    quantity: number,
): Promise<CartActionResult> {
    await requireAuth();
    const result = await cartService.updateQuantity(itemId, quantity);
    if (result.success) revalidatePath('/cart');
    return result;
}

export async function removeItemAction(
    itemId: string,
): Promise<CartActionResult> {
    await requireAuth();
    const result = await cartService.removeItem(itemId);
    if (result.success) revalidatePath('/cart');
    return result;
}

export async function clearCartAction(): Promise<CartActionResult> {
    const user = await requireAuth();
    const result = await cartService.clearCart(user.id);
    if (result.success) revalidatePath('/cart');
    return result;
}

export async function validateCouponAction(
    code: string,
    subtotal: number,
): Promise<CouponActionResult> {
    const result = await cartService.validateCoupon(code, subtotal);
    return result;
}
