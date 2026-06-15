'use client';

import { useCartStore } from '@/store/cart.store';

export async function mergeGuestCartOnLogin(): Promise<void> {
    const guestItems = useCartStore.getState().items;

    if (guestItems.length === 0) return;

    try {
        const response = await fetch('/api/cart/merge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: guestItems }),
        });

        if (response.ok) {
            useCartStore.getState().clear();
        }
    } catch {
        console.warn('[cart/merge] Failed to merge guest cart on login');
    }
}
