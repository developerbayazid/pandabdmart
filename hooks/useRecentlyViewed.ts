'use client';

import { useCallback } from 'react';

export type RecentlyViewedProduct = {
    id: string;
    slug: string;
    name: string;
    price: number;
    comparePrice: number | null;
    image: string | null;
    categoryName: string;
    categorySlug: string;
};

const STORAGE_KEY = 'pandabdmart_recently_viewed';
const MAX_ITEMS = 6;

function getStored(): RecentlyViewedProduct[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.slice(0, MAX_ITEMS);
    } catch {
        return [];
    }
}

function saveStored(items: RecentlyViewedProduct[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
    } catch {
        // localStorage full or unavailable
    }
}

export function useRecentlyViewed() {
    const addToRecentlyViewed = useCallback((product: RecentlyViewedProduct) => {
        const current = getStored();
        const filtered = current.filter((p) => p.id !== product.id);
        filtered.unshift(product);
        saveStored(filtered);
    }, []);

    const getRecentlyViewed = useCallback((): RecentlyViewedProduct[] => {
        return getStored();
    }, []);

    return { addToRecentlyViewed, getRecentlyViewed };
}
