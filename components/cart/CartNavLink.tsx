'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';

type CartNavLinkProps = {
    initialCount: number | null;
};

export function CartNavLink({ initialCount }: CartNavLinkProps) {
    const guestItems = useCartStore((s) => s.items);
    const guestCount = guestItems.reduce((sum, i) => sum + i.quantity, 0);

    const count = initialCount !== null ? initialCount : guestCount;

    return (
        <Link
            href="/cart"
            className="p-2 text-text-secondary hover:text-text-primary transition-colors relative"
            aria-label="Cart"
        >
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 bg-text-primary text-white text-[10px] font-medium rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {count > 99 ? '99+' : count}
            </span>
        </Link>
    );
}
