'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ShopProduct } from '@/types/shop';

type ProductCardProps = {
    product: ShopProduct;
};

export function ProductCard({ product }: ProductCardProps) {
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

    const outOfStock = product.stock <= 0;

    return (
        <div className="group cursor-pointer">
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
                {outOfStock && (
                    <div className="absolute inset-0 bg-surface/80 flex items-center justify-center">
                        <span className="bg-error-light text-error-foreground text-xs font-medium px-3 py-1 rounded-full">
                            Out of Stock
                        </span>
                    </div>
                )}
                {!outOfStock && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                        <button className="w-full bg-surface-inverse text-text-inverse text-[12px] font-medium py-2.5 rounded-md hover:bg-surface-inverse-hover transition-colors">
                            Add To Cart
                        </button>
                    </div>
                )}
            </div>
            <Link
                href={`/categories/${product.categorySlug}`}
                className="text-[11px] text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors"
            >
                {product.categoryName}
            </Link>
            <h3 className="text-[13px] font-medium text-text-primary mt-1 leading-snug line-clamp-2">
                {product.name}
            </h3>
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
