'use client';

import { useState, useCallback } from 'react';
import { useCartStore } from '@/store/cart.store';
import { addItemAction } from '@/actions/cart.actions';
import { useToast } from '@/components/ui/toast';

export function useAddToCart() {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const addToCart = useCallback(
        async (variantId: string, productId: string, priceAtTime: number, quantity: number = 1) => {
            setLoading(true);

            const supabase = (await import('@/lib/supabase/client')).createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                useCartStore.getState().addItem({
                    variantId,
                    productId,
                    quantity,
                    priceAtTime,
                });
                showToast('Added to cart', 'success');
                setLoading(false);
                return;
            }

            const result = await addItemAction(variantId, quantity);

            if (result.success) {
                showToast('Added to cart', 'success');
            } else {
                showToast(result.error ?? 'Failed to add to cart', 'error');
            }

            setLoading(false);
        },
        [showToast],
    );

    return { addToCart, loading };
}
