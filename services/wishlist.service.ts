import * as wishlistRepository from '@/repositories/wishlist.repository';
import * as cartRepository from '@/repositories/cart.repository';

export type RemoveFromWishlistInput = {
    wishlistId: string;
    userId: string;
};

export type MoveToCartInput = {
    wishlistId: string;
    userId: string;
    variantId: string;
    price: number;
};

export async function removeFromWishlist(input: RemoveFromWishlistInput): Promise<{ success: boolean; error?: string }> {
    try {
        await wishlistRepository.removeFromWishlist(input.wishlistId, input.userId);
        return { success: true };
    } catch (err) {
        console.error('[services/wishlist] removeFromWishlist', err);
        return { success: false, error: 'Failed to remove from wishlist.' };
    }
}

export async function moveToCart(input: MoveToCartInput): Promise<{ success: boolean; error?: string }> {
    try {
        await cartRepository.addCartItem(input.userId, input.variantId, 1, input.price);
        await wishlistRepository.removeFromWishlist(input.wishlistId, input.userId);
        return { success: true };
    } catch (err) {
        console.error('[services/wishlist] moveToCart', err);
        return { success: false, error: 'Failed to move item to cart.' };
    }
}

export async function addToWishlist(userId: string, variantId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await wishlistRepository.addToWishlist(userId, variantId);
        return { success: true };
    } catch (err) {
        console.error('[services/wishlist] addToWishlist', err);
        return { success: false, error: 'Failed to add to wishlist.' };
    }
}

export async function checkWishlist(userId: string, variantId: string): Promise<boolean> {
    try {
        return await wishlistRepository.isInWishlist(userId, variantId);
    } catch (err) {
        console.error('[services/wishlist] checkWishlist', err);
        return false;
    }
}

export async function removeFromWishlistByVariant(userId: string, variantId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await wishlistRepository.removeFromWishlistByVariant(userId, variantId);
        return { success: true };
    } catch (err) {
        console.error('[services/wishlist] removeFromWishlistByVariant', err);
        return { success: false, error: 'Failed to remove from wishlist.' };
    }
}
