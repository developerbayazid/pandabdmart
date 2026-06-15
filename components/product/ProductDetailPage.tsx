'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import type { ProductDetail, ProductVariant } from '@/types/product';
import { ProductImageGallery } from './ProductImageGallery';
import { VariantSelector } from './VariantSelector';
import { QuantitySelector } from './QuantitySelector';
import { ProductTabs } from './ProductTabs';
import { SizeChart } from './SizeChart';
import { RelatedProducts } from './RelatedProducts';
import { FaqSection } from './FaqSection';
import { RecentlyViewed } from './RecentlyViewed';
import { useRealtimeStock } from '@/hooks/useRealtimeStock';
import { useAddToCart } from '@/hooks/useAddToCart';
import type { RelatedProduct } from '@/types/product';

type ProductDetailPageProps = {
    product: ProductDetail;
    relatedProducts: RelatedProduct[];
};

export function ProductDetailPage({ product, relatedProducts }: ProductDetailPageProps) {
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [liveVariants, setLiveVariants] = useState<ProductVariant[]>(product.variants);

    const handleVariantUpdate = useCallback((updated: ProductVariant[]) => {
        setLiveVariants(updated);
    }, []);

    useRealtimeStock(product.id, product.variants, handleVariantUpdate);

    const { addToCart } = useAddToCart();

    // Save to recently viewed on mount
    useEffect(() => {
        try {
            const STORAGE_KEY = 'pandabdmart_recently_viewed';
            const MAX_ITEMS = 6;
            const raw = localStorage.getItem(STORAGE_KEY);
            const current: unknown[] = raw ? JSON.parse(raw) : [];

            const entry = {
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.variants[0]?.price ?? 0,
                comparePrice: product.variants[0]?.comparePrice ?? null,
                image: product.variants[0]?.images?.[0]?.url ?? null,
                categoryName: product.categoryName,
                categorySlug: product.categorySlug,
            };

            const filtered = current.filter((p: unknown) => (p as Record<string, string>).id !== product.id);
            filtered.unshift(entry);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
        } catch {
            // ignore
        }
    }, [product]);

    // Find selected variant based on attribute selections
    const selectedVariant = useMemo(() => {
        if (product.attributes.length === 0) {
            return liveVariants[0] ?? null;
        }
        return (
            liveVariants.find((v) => {
                if (v.attributes.length === 0) return false;
                return product.attributes.every((attr) => {
                    const selectedValueId = selectedAttributes[attr.id];
                    if (!selectedValueId) return false;
                    return v.attributes.some(
                        (va) => va.attributeId === attr.id && va.valueId === selectedValueId,
                    );
                });
            }) ?? null
        );
    }, [liveVariants, product, selectedAttributes]);

    // Get available price and stock
    const displayPrice = selectedVariant?.price ?? liveVariants[0]?.price ?? 0;
    const displayComparePrice =
        selectedVariant?.comparePrice ?? liveVariants[0]?.comparePrice ?? null;
    const displayStock = selectedVariant?.stock ?? liveVariants[0]?.stock ?? 0;
    const displayReserved = selectedVariant?.reservedStock ?? 0;
    const availableStock = Math.max(0, displayStock - displayReserved);
    const displaySku = selectedVariant?.sku ?? liveVariants[0]?.sku ?? 'N/A';

    const handleAttributeChange = (attributeId: string, valueId: string) => {
        setSelectedAttributes((prev) => ({
            ...prev,
            [attributeId]: prev[attributeId] === valueId ? '' : valueId,
        }));
    };

    const formattedPrice = new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 2,
    }).format(displayPrice);

    const formattedComparePrice = displayComparePrice
        ? new Intl.NumberFormat('en-BD', {
              style: 'currency',
              currency: 'BDT',
              minimumFractionDigits: 2,
          }).format(displayComparePrice)
        : null;

    const outOfStock = availableStock <= 0;
    const lowStock = availableStock > 0 && availableStock <= 5;
    const needsVariantSelection = product.attributes.length > 0 && !selectedVariant;
    const addToCartDisabled = outOfStock || needsVariantSelection;

    const handleAddToCart = () => {
        if (!selectedVariant || addToCartDisabled) return;
        addToCart(selectedVariant.id, product.id, displayPrice, quantity);
    };

    const totalPrice = displayPrice * quantity;
    const formattedTotalPrice = new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 2,
    }).format(totalPrice);

    return (
        <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[13px] text-text-secondary mb-6">
                <Link href="/" className="hover:text-text-primary transition-colors">
                    Home
                </Link>
                <span>&gt;</span>
                <span className="text-text-primary font-medium">{product.name}</span>
            </nav>

            {/* Product Main Section */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div className="lg:w-[55%]">
                    <ProductImageGallery variants={liveVariants} productName={product.name} />
                </div>

                {/* Product Info */}
                <div className="lg:w-[45%] lg:pl-4">
                    <h1 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal leading-[1.3] text-text-primary">
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div className="flex items-center gap-3 mt-3">
                        {formattedComparePrice && displayComparePrice && displayComparePrice > displayPrice && (
                            <span className="text-[18px] text-text-muted line-through">
                                {formattedComparePrice}
                            </span>
                        )}
                        <span className="text-[24px] font-semibold text-text-primary">
                            {formattedPrice}
                        </span>
                    </div>

                    {/* Short Description */}
                    {product.description && (
                        <p className="text-[14px] text-text-secondary mt-4 leading-relaxed">
                            &ldquo;{product.description}&rdquo;
                        </p>
                    )}

                    {/* Variant Selector */}
                    <div className="mt-6">
                        <VariantSelector
                            attributes={product.attributes}
                            variants={liveVariants}
                            selectedAttributes={selectedAttributes}
                            onAttributeChange={handleAttributeChange}
                        />
                    </div>

                    {/* Total Price */}
                    <div className="mt-6 pt-6 border-t border-border">
                        <div className="flex items-center justify-between">
                            <span className="text-[14px] font-medium text-text-primary">Total</span>
                            <span className="text-[20px] font-semibold text-text-primary">
                                {formattedTotalPrice}
                            </span>
                        </div>
                    </div>

                    {/* Quantity + Add to Cart */}
                    <div className="mt-6 flex items-center gap-4">
                        <QuantitySelector
                            quantity={quantity}
                            onChange={setQuantity}
                            max={outOfStock ? undefined : availableStock}
                        />
                        <button
                            disabled={addToCartDisabled}
                            onClick={handleAddToCart}
                            className="flex-1 h-10 bg-surface-inverse text-text-inverse text-[13px] font-medium rounded-md hover:bg-surface-inverse-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {outOfStock
                                ? 'Out of Stock'
                                : needsVariantSelection
                                    ? 'Select Options'
                                    : 'Add To Cart'}
                        </button>
                        <button
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className={`w-10 h-10 flex items-center justify-center border rounded-md transition-colors ${
                                isWishlisted
                                    ? 'border-error text-error'
                                    : 'border-border text-text-secondary hover:border-border-strong'
                            }`}
                            aria-label="Add to wishlist"
                        >
                            <Heart
                                className="w-4 h-4"
                                fill={isWishlisted ? 'currentColor' : 'none'}
                            />
                        </button>
                    </div>

                    {/* Stock Status */}
                    <div className="mt-4">
                        {outOfStock ? (
                            <span className="inline-flex items-center gap-1.5 text-[13px] text-error">
                                <span className="w-2 h-2 rounded-full bg-error" />
                                Out of Stock
                            </span>
                        ) : lowStock ? (
                            <span className="inline-flex items-center gap-1.5 text-[13px] text-warning-foreground">
                                <span className="w-2 h-2 rounded-full bg-warning" />
                                Low Stock — Only {availableStock} left
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-[13px] text-success-foreground">
                                <span className="w-2 h-2 rounded-full bg-success" />
                                In Stock
                            </span>
                        )}
                    </div>

                    {/* SKU & Category */}
                    <div className="mt-6 pt-6 border-t border-border space-y-2">
                        <p className="text-[13px] text-text-secondary">
                            <span className="font-medium text-text-primary">SKU:</span> {displaySku}
                        </p>
                        <p className="text-[13px] text-text-secondary">
                            <span className="font-medium text-text-primary">Categories:</span>{' '}
                            <Link
                                href={`/categories/${product.categorySlug}`}
                                className="hover:text-text-primary transition-colors"
                            >
                                {product.categoryName}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-16 pt-8 border-t border-border">
                <ProductTabs product={product} />
                <SizeChart />
            </div>

            {/* Related Products */}
            <RelatedProducts products={relatedProducts} />

            {/* Recently Viewed */}
            <RecentlyViewed currentProductId={product.id} />

            {/* FAQ Section */}
            <FaqSection />
        </div>
    );
}
