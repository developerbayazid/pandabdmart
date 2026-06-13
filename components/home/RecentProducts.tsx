'use client';

import { useState } from 'react';
import Image from 'next/image';

const recentProducts = [
    {
        id: 1,
        category: 'Panjabi',
        name: 'Embro Semi Fit Panjabi',
        price: '$24.00',
        image: '/images/Product Card (3).png',
    },
    {
        id: 2,
        category: 'Perfume',
        name: 'Al Haramain Hayati Gold',
        price: '$24.00',
        image: '/images/Product Card (4).png',
    },
    {
        id: 3,
        category: 'Trouser',
        name: 'Elite Comfort Pajama',
        price: '$24.00',
        image: '/images/Product Card (5).png',
    },
    {
        id: 4,
        category: 'Panjabi',
        name: 'Semi Fit Panjabi - Charcoal',
        price: '$24.00',
        image: '/images/Product Card (6).png',
    },
    {
        id: 5,
        category: 'Trouser',
        name: 'Regal Fit Pant Pajama',
        price: '$24.00',
        image: '/images/Product Card (7).png',
    },
    {
        id: 6,
        category: 'Footwear',
        name: 'Men\'s Casual Shoe',
        price: '$24.00',
        image: '/images/Product Card (2).png',
    },
    {
        id: 7,
        category: 'Panjabi',
        name: 'Embro Semi Fit Panjabi',
        price: '$24.00',
        image: '/images/Product Card (1).png',
    },
    {
        id: 8,
        category: 'Perfume',
        name: 'Haramain Attar Danah',
        price: '$24.00',
        image: '/images/Product Card.png',
    },
    {
        id: 9,
        category: 'Footwear',
        name: 'Apex Men\'s Back Strong Belt Sandal',
        price: '$24.00',
        image: '/images/Product Card.png',
    },
    {
        id: 10,
        category: 'Trouser',
        name: 'White Cotton Slim-Fitted Pant',
        price: '$24.00',
        image: '/images/Product Card (1).png',
    },
    {
        id: 11,
        category: 'Perfume',
        name: 'Haramain White Neroli Oil',
        price: '$24.00',
        image: '/images/Product Card (2).png',
    },
    {
        id: 12,
        category: 'Panjabi',
        name: 'Taxer Printed Silk Panjabi',
        price: '$24.00',
        image: '/images/Product Card (3).png',
    },
];

const ITEMS_PER_PAGE = 8;

export function RecentProducts() {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(recentProducts.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = recentProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
                        <div key={product.id} className="group cursor-pointer">
                            <div className="relative w-full h-[220px] lg:h-[280px] bg-surface-secondary rounded-lg overflow-hidden mb-2">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <span className="text-[11px] text-text-muted uppercase tracking-wider">
                                {product.category}
                            </span>
                            <h3 className="text-[13px] font-medium text-text-primary mt-0.5 leading-snug line-clamp-2">
                                {product.name}
                            </h3>
                            <p className="text-[13px] font-semibold text-text-primary mt-0.5">
                                {product.price}
                            </p>
                            <button className="mt-2 border border-text-primary text-text-primary px-5 py-2 text-[12px] font-medium hover:bg-surface-inverse hover:text-text-inverse transition-colors rounded-md">
                                Add To Cart
                            </button>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-10">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-[13px] font-medium border border-border rounded-md text-text-secondary hover:bg-surface-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 text-[13px] font-medium rounded-md transition-colors ${
                                    currentPage === page
                                        ? 'bg-surface-inverse text-text-inverse'
                                        : 'border border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
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
