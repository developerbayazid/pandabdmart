'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import type { ShopProduct } from '@/types/shop';

const ITEMS_PER_PAGE = 8;

type RecentProductsProps = {
    products: ShopProduct[];
};

export function RecentProducts({ products }: RecentProductsProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="bg-background py-12 lg:py-16">
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
                <div className="text-center mb-8">
                    <h2 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary mb-2">
                        Recent Products
                    </h2>
                    <p className="text-text-secondary text-sm">
                        &ldquo;Explore Our Latest Arrivals — Fresh Styles Just In!&rdquo;
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {paginatedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-10">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="px-3 py-1.5 text-[13px] font-medium border border-border rounded-md text-text-secondary hover:bg-surface-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 text-[13px] font-medium rounded-md transition-colors ${
                                    safePage === page
                                        ? 'bg-surface-inverse text-text-inverse'
                                        : 'border border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            className="px-3 py-1.5 text-[13px] font-medium border border-border rounded-md text-text-secondary hover:bg-surface-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
