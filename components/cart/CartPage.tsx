'use client';

import { useState } from 'react';
import { CartItem, CartSummaryData } from '@/types/cart';
import { useToast } from '@/components/ui/toast';
import { useCart } from '@/hooks/useCart';
import { CartItemRow } from './CartItemRow';
import { CartSummary } from './CartSummary';
import { EmptyCart } from './EmptyCart';

type Props = {
    initialItems: CartItem[] | null;
};

function calculateSummary(
    items: CartItem[],
    discount: number,
    couponCode: string | null,
): CartSummaryData {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const shippingEstimate = 0;
    const total = subtotal - discount + shippingEstimate;

    return {
        subtotal,
        discount,
        couponCode,
        shippingEstimate,
        total,
        itemCount,
    };
}

export function CartPageClient({ initialItems }: Props) {
    const { items, handleQuantityChange, handleRemove, handleApplyCoupon } = useCart(initialItems);
    const { showToast } = useToast();

    const [couponApplied, setCouponApplied] = useState<{
        code: string;
        discount: number;
    } | null>(null);

    const handleApply = async (code: string) => {
        const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const result = await handleApplyCoupon(code, subtotal);

        if (result.success && result.data) {
            setCouponApplied({ code: result.data.code, discount: result.data.discount });
            showToast(`Coupon "${result.data.code}" applied — ৳${result.data.discount} off`, 'success');
        } else {
            showToast(result.error ?? 'Failed to apply coupon', 'error');
        }
    };

    const summary = calculateSummary(
        items,
        couponApplied?.discount ?? 0,
        couponApplied?.code ?? null,
    );

    if (items.length === 0) {
        return (
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16 py-8">
                <h1 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary mb-8">
                    Shopping Cart
                </h1>
                <EmptyCart />
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-8 lg:px-16 py-8">
            <h1 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary mb-8">
                Shopping Cart
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 min-w-0">
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        {items.map((item) => (
                            <CartItemRow
                                key={item.variantId}
                                item={item}
                                onQuantityChange={(variantId, quantity) => {
                                    if (quantity < 1) return;
                                    handleQuantityChange(variantId, quantity);
                                }}
                                onRemove={(variantId) => handleRemove(variantId)}
                            />
                        ))}
                    </div>
                </div>

                <div className="w-full lg:w-[380px] shrink-0">
                    <CartSummary
                        summary={summary}
                        onCouponApply={handleApply}
                    />
                </div>
            </div>
        </div>
    );
}
