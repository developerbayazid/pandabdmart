'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { RecentlyViewedProduct } from '@/hooks/useRecentlyViewed';

type RecentlyViewedProps = {
    currentProductId: string;
};

export function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
    const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);

    useEffect(() => {
        const STORAGE_KEY = 'pandabdmart_recently_viewed';
        const MAX_ITEMS = 6;

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    const filtered = parsed
                        .filter((p: RecentlyViewedProduct) => p.id !== currentProductId)
                        .slice(0, MAX_ITEMS);
                    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading from localStorage after mount is standard
                    setProducts(filtered);
                }
            }
        } catch {
            // ignore
        }
    }, [currentProductId]);

    if (products.length === 0) return null;

    return (
        <section className="mt-16">
            <h2 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary text-center mb-2">
                Recently Viewed
            </h2>
            <p className="text-[13px] text-text-secondary text-center mb-8">
                Pick up where you left off
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {products.map((product) => (
                    <RecentlyViewedCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}

function RecentlyViewedCard({ product }: { product: RecentlyViewedProduct }) {
    const formattedPrice = new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
    }).format(product.price);

    const formattedComparePrice = product.comparePrice
        ? new Intl.NumberFormat('en-BD', {
              style: 'currency',
              currency: 'BDT',
              minimumFractionDigits: 0,
          }).format(product.comparePrice)
        : null;

    return (
        <div className="group cursor-pointer block">
            <Link href={`/products/${product.slug}`} className="block">
                <div className="relative w-full h-[220px] lg:h-[280px] bg-surface-secondary rounded-lg overflow-hidden mb-3">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-text-muted text-[13px]">
                            No Image
                        </div>
                    )}
                </div>
            </Link>
            <Link
                href={`/categories/${product.categorySlug}`}
                className="text-[11px] text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors block"
            >
                {product.categoryName}
            </Link>
            <Link href={`/products/${product.slug}`} className="block">
                <h3 className="text-[13px] font-medium text-text-primary mt-1 leading-snug line-clamp-2">
                    {product.name}
                </h3>
            </Link>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[13px] font-semibold text-text-primary">
                    {formattedPrice}
                </span>
                {formattedComparePrice && product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-[11px] font-normal text-text-muted line-through">
                        {formattedComparePrice}
                    </span>
                )}
            </div>
        </div>
    );
}
