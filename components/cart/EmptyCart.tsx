'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export function EmptyCart() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-text-muted" />
            </div>
            <p className="text-[14px] text-text-secondary mb-2">
                Your cart is empty
            </p>
            <p className="text-[13px] text-text-muted mb-6">
                Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link
                href="/shop"
                className="bg-surface border border-border text-text-primary px-6 py-2.5 text-[13px] font-medium rounded-md hover:bg-surface-secondary transition-colors"
            >
                Continue Shopping
            </Link>
        </div>
    );
}
