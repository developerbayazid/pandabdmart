'use client';

import { useState, useCallback, useMemo } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { Pagination } from '@/components/ui/pagination';
import type { ShopProduct } from '@/types/shop';

const ITEMS_PER_PAGE = 12;

type TrendingProductsProps = {
    products: ShopProduct[];
    categories: { slug: string; name: string }[];
};

export function TrendingProducts({ products, categories }: TrendingProductsProps) {
    const [activeSlug, setActiveSlug] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [animationKey, setAnimationKey] = useState(0);

    const filteredProducts = useMemo(
        () =>
            activeSlug === null
                ? products
                : products.filter((p) => p.categorySlug === activeSlug),
        [products, activeSlug],
    );

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleTabChange = useCallback(
        (slug: string | null) => {
            if (slug === activeSlug) return;
            setActiveSlug(slug);
            setCurrentPage(1);
            setAnimationKey((prev) => prev + 1);
        },
        [activeSlug],
    );

    return (
        <section className="bg-background py-12 lg:py-16">
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
                <div className="text-center mb-8">
                    <h2 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary mb-2">
                        Trending Products
                    </h2>
                    <p className="text-text-secondary text-sm">
                        &ldquo;Discover the Most Wanted Styles — Shop Our Bestselling Picks Now!&rdquo;
                    </p>
                </div>

                <div className="flex justify-center gap-6 mb-8">
                    <button
                        onClick={() => handleTabChange(null)}
                        className={`text-[13px] font-medium pb-1 border-b-2 transition-colors ${
                            activeSlug === null
                                ? 'text-text-primary border-text-primary'
                                : 'text-text-secondary border-transparent hover:text-text-primary'
                        }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.slug}
                            onClick={() => handleTabChange(cat.slug)}
                            className={`text-[13px] font-medium pb-1 border-b-2 transition-colors ${
                                activeSlug === cat.slug
                                    ? 'text-text-primary border-text-primary'
                                    : 'text-text-secondary border-transparent hover:text-text-primary'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div
                    key={animationKey}
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 min-h-[500px] lg:min-h-[600px] transition-all duration-700 ease-in-out animate-in fade-in slide-in-from-bottom-6"
                >
                    {paginatedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center mt-10">
                        <Pagination
                            currentPage={safePage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            variant="compact"
                        />
                    </div>
                )}
            </div>
        </section>
    );
}
