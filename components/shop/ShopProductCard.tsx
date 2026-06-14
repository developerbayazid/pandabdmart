'use client';

import { ProductCard } from '@/components/product/ProductCard';
import type { ShopProduct } from '@/types/shop';

type ShopProductCardProps = {
    product: ShopProduct;
};

export function ShopProductCard({ product }: ShopProductCardProps) {
    return <ProductCard product={product} />;
}
