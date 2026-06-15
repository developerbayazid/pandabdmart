'use client';

import { useState } from 'react';
import { Tag } from 'lucide-react';
import { CartSummaryData } from '@/types/cart';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

type Props = {
    summary: CartSummaryData;
    onCouponApply: (code: string) => void;
};

export function CartSummary({ summary, onCouponApply }: Props) {
    const [couponCode, setCouponCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    const handleApply = () => {
        if (!couponCode.trim()) return;
        setIsApplying(true);
        onCouponApply(couponCode.trim());
        setIsApplying(false);
    };

    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            <h2 className="text-base font-semibold text-text-primary leading-6 mb-4">
                Order Summary
            </h2>

            {/* Coupon */}
            <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Promo Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full bg-surface border border-border rounded-md pl-9 pr-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                    />
                </div>
                <button
                    onClick={handleApply}
                    disabled={!couponCode.trim() || isApplying}
                    className="bg-surface border border-border text-text-primary px-4 py-2 text-[13px] font-medium rounded-md hover:bg-surface-secondary disabled:opacity-50 transition-colors"
                >
                    Apply
                </button>
            </div>

            {summary.couponCode && summary.discount > 0 && (
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                    <span className="text-[13px] text-text-secondary">
                        Coupon ({summary.couponCode})
                    </span>
                    <span className="text-[13px] font-medium text-success-foreground">
                        −{formatCurrency(summary.discount)}
                    </span>
                </div>
            )}

            {/* Totals */}
            <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                    <span className="text-[13px] text-text-secondary">
                        Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
                    </span>
                    <span className="text-[13px] font-medium text-text-primary">
                        {formatCurrency(summary.subtotal)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[13px] text-text-secondary">Shipping</span>
                    <span className="text-[13px] font-medium text-text-primary">
                        {summary.shippingEstimate > 0
                            ? formatCurrency(summary.shippingEstimate)
                            : 'Calculated at checkout'}
                    </span>
                </div>
            </div>

            <div className="border-t border-border pt-4 mb-6">
                <div className="flex items-center justify-between">
                    <span className="text-[16px] font-semibold text-text-primary">Total</span>
                    <span className="text-[20px] font-semibold text-text-primary">
                        {formatCurrency(summary.total)}
                    </span>
                </div>
                <p className="text-[12px] text-text-muted mt-1">
                    Including shipping and taxes
                </p>
            </div>

            <Link
                href="/checkout"
                className="block w-full bg-surface-inverse text-text-inverse text-center rounded-md px-4 py-3 text-[14px] font-medium hover:bg-surface-inverse-hover transition-colors"
            >
                Proceed to Checkout
            </Link>

            <Link
                href="/shop"
                className="block w-full text-center mt-3 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
            >
                Continue Shopping
            </Link>
        </div>
    );
}
