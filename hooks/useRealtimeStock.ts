'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ProductVariant } from '@/types/product';

type StockChangePayload = {
    id: string;
    stock: number;
    reserved_stock: number;
    price: number;
    compare_price: number | null;
    is_active: boolean;
};

export function useRealtimeStock(
    productId: string,
    variants: ProductVariant[],
    onVariantUpdate: (updatedVariants: ProductVariant[]) => void,
): void {
    const variantsRef = useRef(variants);
    // eslint-disable-next-line react-hooks/refs
    variantsRef.current = variants;

    const onUpdateRef = useRef(onVariantUpdate);
    // eslint-disable-next-line react-hooks/refs
    onUpdateRef.current = onVariantUpdate;

    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel(`product-variants-${productId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'product_variants',
                    filter: `product_id=eq.${productId}`,
                },
                (payload) => {
                    const updated = payload.new as StockChangePayload;
                    const currentVariants = variantsRef.current;

                    const newVariants = currentVariants.map((v) => {
                        if (v.id === updated.id) {
                            return {
                                ...v,
                                price: updated.price,
                                comparePrice: updated.compare_price ?? null,
                                stock: updated.stock,
                                reservedStock: updated.reserved_stock ?? 0,
                                isActive: updated.is_active,
                            };
                        }
                        return v;
                    });

                    onUpdateRef.current(newVariants);
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [productId]);
}
