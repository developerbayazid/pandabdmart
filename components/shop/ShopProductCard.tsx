'use client';

import Image from 'next/image';
import type { ShopProduct } from './mock-data';

type ShopProductCardProps = {
    product: ShopProduct;
};

export function ShopProductCard({ product }: ShopProductCardProps) {
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(product.price);

    return (
        <div className="group cursor-pointer">
            <div className="relative w-full h-[220px] lg:h-[280px] bg-surface-secondary rounded-lg overflow-hidden mb-3">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {!product.inStock && (
                    <div className="absolute inset-0 bg-surface/80 flex items-center justify-center">
                        <span className="bg-error-light text-error-foreground text-xs font-medium px-3 py-1 rounded-full">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>
            <span className="text-[11px] text-text-muted uppercase tracking-wider">
                {product.category}
            </span>
            <h3 className="text-[13px] font-medium text-text-primary mt-1 leading-snug line-clamp-2">
                {product.name}
            </h3>
            <p className="text-[13px] font-semibold text-text-primary mt-1">
                {formattedPrice}
            </p>
            {product.inStock && (
                <button className="mt-3 border border-text-primary text-text-primary px-5 py-2 text-[12px] font-medium hover:bg-surface-inverse hover:text-text-inverse transition-colors rounded-md">
                    Add To Cart
                </button>
            )}
        </div>
    );
}
