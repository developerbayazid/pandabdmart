'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth/require-auth';
import { removeFromWishlist, moveToCart, addToWishlist, checkWishlist, removeFromWishlistByVariant } from '@/services/wishlist.service';

export type WishlistActionResult = {
    success: boolean;
    error?: string;
};

export type CheckWishlistResult = {
    isWishlisted: boolean;
};

export async function removeFromWishlistAction(wishlistId: string): Promise<WishlistActionResult> {
    const user = await requireAuth();

    const result = await removeFromWishlist({
        wishlistId,
        userId: user.id,
    });

    if (result.success) {
        revalidatePath('/account/wishlist');
    }

    return result;
}

export async function moveToCartAction(
    wishlistId: string,
    variantId: string,
    price: number,
): Promise<WishlistActionResult> {
    const user = await requireAuth();

    const result = await moveToCart({
        wishlistId,
        userId: user.id,
        variantId,
        price,
    });

    if (result.success) {
        revalidatePath('/account/wishlist');
        revalidatePath('/cart');
    }

    return result;
}

export async function addToWishlistAction(variantId: string): Promise<WishlistActionResult> {
    const user = await requireAuth();

    const result = await addToWishlist(user.id, variantId);

    if (result.success) {
        revalidatePath('/account/wishlist');
    }

    return result;
}

export async function checkWishlistAction(variantId: string): Promise<CheckWishlistResult> {
    const user = await requireAuth();

    const isWishlisted = await checkWishlist(user.id, variantId);
    return { isWishlisted };
}

export async function removeFromWishlistByVariantAction(variantId: string): Promise<WishlistActionResult> {
    const user = await requireAuth();

    const result = await removeFromWishlistByVariant(user.id, variantId);

    if (result.success) {
        revalidatePath('/account/wishlist');
    }

    return result;
}
