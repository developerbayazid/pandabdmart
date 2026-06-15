'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem } from '@/types/cart';
import { formatCurrency } from '@/lib/utils';

type Props = {
    item: CartItem;
    onQuantityChange: (variantId: string, quantity: number) => void;
    onRemove: (variantId: string) => void;
};

export function CartItemRow({ item, onQuantityChange, onRemove }: Props) {
    const lineTotal = item.unitPrice * item.quantity;

    const handleDecrease = () => {
        if (item.quantity > 1) {
            onQuantityChange(item.variantId, item.quantity - 1);
        }
    };

    const handleIncrease = () => {
        if (item.quantity < item.stock) {
            onQuantityChange(item.variantId, item.quantity + 1);
        }
    };

    return (
        <div className="flex gap-4 py-6 border-b border-border last:border-b-0">
            {/* Image */}
            <Link
                href={`/products/${item.productSlug}`}
                className="shrink-0 w-24 h-24 lg:w-28 lg:h-28 rounded-lg overflow-hidden bg-surface-secondary"
            >
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.productName}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                        No Image
                    </div>
                )}
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <Link
                            href={`/products/${item.productSlug}`}
                            className="text-[14px] font-medium text-text-primary leading-snug hover:text-text-secondary transition-colors line-clamp-2"
                        >
                            {item.productName}
                        </Link>
                        {item.variantAttributes.length > 0 && (
                            <p className="text-[12px] text-text-muted mt-1">
                                {item.variantAttributes
                                    .map((a) => `${a.attributeName}: ${a.value}`)
                                    .join(' / ')}
                            </p>
                        )}
                        <p className="text-[12px] text-text-muted mt-0.5">
                            SKU: {item.variantSku}
                        </p>
                    </div>
                    <button
                        onClick={() => onRemove(item.variantId)}
                        className="shrink-0 p-1.5 text-text-muted hover:text-error transition-colors"
                        aria-label="Remove item"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center justify-between mt-4">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-border rounded-md">
                        <button
                            onClick={handleDecrease}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
                            aria-label="Decrease quantity"
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-[13px] font-medium text-text-primary border-x border-border">
                            {item.quantity}
                        </span>
                        <button
                            onClick={handleIncrease}
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
                            aria-label="Increase quantity"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                        <p className="text-[14px] font-semibold text-text-primary">
                            {formatCurrency(lineTotal)}
                        </p>
                        {item.comparePrice && item.comparePrice > item.unitPrice && (
                            <p className="text-[12px] text-text-muted line-through">
                                {formatCurrency(item.comparePrice * item.quantity)}
                            </p>
                        )}
                        <p className="text-[12px] text-text-muted">
                            {formatCurrency(item.unitPrice)} each
                        </p>
                    </div>
                </div>

                {item.stock <= 5 && item.stock > 0 && (
                    <p className="text-[12px] text-warning mt-2">
                        Only {item.stock} left in stock
                    </p>
                )}
            </div>
        </div>
    );
}
