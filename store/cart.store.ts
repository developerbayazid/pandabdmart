import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GuestCartItem } from '@/types/cart';

type CartStore = {
    items: GuestCartItem[];
    addItem: (item: GuestCartItem) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    removeItem: (variantId: string) => void;
    clear: () => void;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],
            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find(
                        (i) => i.variantId === item.variantId,
                    );
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.variantId === item.variantId
                                    ? { ...i, quantity: i.quantity + item.quantity }
                                    : i,
                            ),
                        };
                    }
                    return { items: [...state.items, item] };
                }),
            updateQuantity: (variantId, quantity) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.variantId === variantId ? { ...i, quantity } : i,
                    ),
                })),
            removeItem: (variantId) =>
                set((state) => ({
                    items: state.items.filter((i) => i.variantId !== variantId),
                })),
            clear: () => set({ items: [] }),
        }),
        { name: 'guest-cart' },
    ),
);
