'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Tag, Minus, Plus, Trash2, X } from 'lucide-react';
import { CartItem } from '@/types/cart';
import { CheckoutSummary } from '@/types/checkout';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

type Props = {
    items: CartItem[];
    summary: CheckoutSummary;
    couponCode: string | null;
    discount: number;
    onQuantityChange: (variantId: string, quantity: number) => void;
    onRemove: (variantId: string) => void;
    onCouponApply: (code: string) => void;
};

export function CheckoutOrderSummary({
    items,
    summary,
    couponCode,
    discount,
    onQuantityChange,
    onRemove,
    onCouponApply,
}: Props) {
    const [codeInput, setCodeInput] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    const handleApply = () => {
        if (!codeInput.trim()) return;
        setIsApplying(true);
        onCouponApply(codeInput.trim());
        setIsApplying(false);
    };

    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
                {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4">
                        <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-surface-secondary">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.productName}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-surface-secondary" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <Link
                                    href={`/products/${item.productSlug}`}
                                    className="text-sm font-medium text-text-primary leading-snug hover:text-text-secondary transition-colors line-clamp-2"
                                >
                                    {item.productName}
                                </Link>
                                <span className="text-sm font-semibold text-text-primary shrink-0">
                                    {formatCurrency(item.unitPrice * item.quantity)}
                                </span>
                            </div>
                            {item.variantAttributes.length > 0 && (
                                <p className="text-xs text-text-muted mt-0.5">
                                    {item.variantAttributes.map((a) => `${a.attributeName}: ${a.value}`).join(', ')}
                                </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => onRemove(item.variantId)}
                                        className="flex items-center gap-1 text-xs text-text-muted hover:text-error transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                        Remove
                                    </button>
                                </div>
                                <div className="flex items-center border border-border rounded-md">
                                    <button
                                        onClick={() => onQuantityChange(item.variantId, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-50"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-7 h-7 flex items-center justify-center text-xs font-medium text-text-primary border-x border-border">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => onQuantityChange(item.variantId, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                        className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-50"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Promo Code"
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        className="w-full bg-surface border border-border rounded-md pl-9 pr-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                    />
                </div>
                <button
                    onClick={handleApply}
                    disabled={!codeInput.trim() || isApplying}
                    className="bg-surface border border-border text-text-primary px-4 py-2 text-[13px] font-medium rounded-md hover:bg-surface-secondary disabled:opacity-50 transition-colors"
                >
                    Apply
                </button>
            </div>

            {couponCode && discount > 0 && (
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                    <span className="text-[13px] text-text-secondary">
                        Coupon ({couponCode})
                    </span>
                    <span className="text-[13px] font-medium text-success-foreground">
                        −{formatCurrency(discount)}
                    </span>
                </div>
            )}

            {/* Totals */}
            <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-text-primary">
                        Sub Total
                    </span>
                    <span className="text-[14px] font-medium text-text-primary">
                        {formatCurrency(summary.subtotal)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-text-primary">
                        Shipping
                    </span>
                    <span className="text-[14px] font-medium text-text-primary">
                        {formatCurrency(summary.shipping)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-text-primary">
                        Estimated taxes
                    </span>
                    <span className="text-[14px] font-medium text-text-primary">
                        {formatCurrency(summary.tax)}
                    </span>
                </div>
                {discount > 0 && (
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] font-medium text-text-primary">
                            Discount
                        </span>
                        <span className="text-[14px] font-medium text-success-foreground">
                            −{formatCurrency(discount)}
                        </span>
                    </div>
                )}
            </div>

            <div className="border-t border-border pt-4 mb-6">
                <div className="flex items-center justify-between">
                    <span className="text-[16px] font-semibold text-text-primary">Total</span>
                    <span className="text-[20px] font-semibold text-text-primary">
                        {formatCurrency(summary.total)}
                    </span>
                </div>
            </div>
        </div>
    );
}
