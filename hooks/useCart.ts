'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cart.store';
import { CartItem, GuestCartItem } from '@/types/cart';
import {
    updateQuantityAction,
    removeItemAction,
    validateCouponAction,
} from '@/actions/cart.actions';

async function resolveGuestCartItems(
    guestItems: GuestCartItem[],
): Promise<CartItem[]> {
    if (guestItems.length === 0) return [];

    const supabase = createClient();
    const variantIds = guestItems.map((i) => i.variantId);

    const { data, error } = await supabase
        .from('product_variants')
        .select(`
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
        `)
        .in('id', variantIds);

    if (error || !data) return [];

    const variantMap = new Map(data.map((v) => [v.id, v]));

    return guestItems.map((gi) => {
        const variant = variantMap.get(gi.variantId);
        if (!variant) return null;

        const v = variant as unknown as {
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
                value: { id: string; value: string; attribute: { id: string; name: string } };
            }[];
        };

        const primaryImage = v.variant_images?.find((img) => img.is_primary);
        const availableStock = v.stock - (v.reserved_stock ?? 0);

        return {
            id: gi.variantId,
            variantId: v.id,
            productId: v.product.id,
            productName: v.product.name,
            productSlug: v.product.slug,
            variantSku: v.sku,
            variantAttributes: (v.variant_attribute_values ?? []).map((vav) => ({
                attributeName: vav.value.attribute.name,
                value: vav.value.value,
            })),
            unitPrice: gi.priceAtTime,
            comparePrice: v.compare_price ? Number(v.compare_price) : null,
            quantity: gi.quantity,
            image: primaryImage?.url ?? null,
            stock: availableStock,
        };
    }).filter(Boolean) as CartItem[];
}

type UseCartReturn = {
    items: CartItem[];
    handleQuantityChange: (variantId: string, quantity: number) => void;
    handleRemove: (variantId: string) => void;
    handleApplyCoupon: (code: string, subtotal: number) => Promise<{ success: boolean; data?: { code: string; type: string; value: number; discount: number }; error?: string }>;
};

export function useCart(initialAuthItems: CartItem[] | null): UseCartReturn {
    const [authItems, setAuthItems] = useState<CartItem[]>(initialAuthItems ?? []);
    const [guestResolvedItems, setGuestResolvedItems] = useState<CartItem[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(initialAuthItems !== null);

    const guestItems = useCartStore((s) => s.items);
    const guestUpdateQuantity = useCartStore((s) => s.updateQuantity);
    const guestRemoveItem = useCartStore((s) => s.removeItem);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAuthenticated(initialAuthItems !== null);
        if (initialAuthItems !== null) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAuthItems(initialAuthItems);
        }
    }, [initialAuthItems]);

    useEffect(() => {
        if (isAuthenticated) return;
        resolveGuestCartItems(guestItems).then(setGuestResolvedItems);
    }, [guestItems, isAuthenticated]);

    const handleQuantityChange = useCallback(
        (variantId: string, quantity: number) => {
            if (isAuthenticated) {
                const item = authItems.find((i) => i.variantId === variantId);
                if (!item) return;
                setAuthItems((prev) =>
                    prev.map((i) =>
                        i.variantId === variantId ? { ...i, quantity } : i,
                    ),
                );
                updateQuantityAction(item.id, quantity);
            } else {
                guestUpdateQuantity(variantId, quantity);
            }
        },
        [isAuthenticated, authItems, guestUpdateQuantity],
    );

    const handleRemove = useCallback(
        (variantId: string) => {
            if (isAuthenticated) {
                const item = authItems.find((i) => i.variantId === variantId);
                if (!item) return;
                setAuthItems((prev) => prev.filter((i) => i.variantId !== variantId));
                removeItemAction(item.id);
            } else {
                guestRemoveItem(variantId);
            }
        },
        [isAuthenticated, authItems, guestRemoveItem],
    );

    const handleApplyCoupon = useCallback(
        async (code: string, subtotal: number) => {
            return validateCouponAction(code, subtotal);
        },
        [],
    );

    const items = isAuthenticated ? authItems : guestResolvedItems;

    return {
        items,
        handleQuantityChange,
        handleRemove,
        handleApplyCoupon,
    };
}
