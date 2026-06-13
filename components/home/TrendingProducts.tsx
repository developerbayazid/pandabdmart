'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

const tabs = ['All', 'Footwear', 'Trouser', 'Perfume'];

const trendingProducts = [
    {
        id: 1,
        category: 'Panjabi',
        name: 'Embro Semi Fit Panjabi',
        price: '$24.00',
        image: '/images/Product Card (3).png',
        tab: 'All',
    },
    {
        id: 2,
        category: 'Perfume',
        name: 'Al Haramain Hayati Gold',
        price: '$24.00',
        image: '/images/Product Card (4).png',
        tab: 'All',
    },
    {
        id: 3,
        category: 'Trouser',
        name: 'Elite Comfort Pajama',
        price: '$24.00',
        image: '/images/Product Card (5).png',
        tab: 'All',
    },
    {
        id: 4,
        category: 'Panjabi',
        name: 'Semi Fit Panjabi - Charcoal',
        price: '$24.00',
        image: '/images/Product Card (6).png',
        tab: 'All',
    },
    {
        id: 5,
        category: 'Trouser',
        name: 'Regal Fit Pant Pajama',
        price: '$24.00',
        image: '/images/Product Card (7).png',
        tab: 'All',
    },
    {
        id: 6,
        category: 'Footwear',
        name: 'Men\'s Casual Shoe',
        price: '$24.00',
        image: '/images/Product Card (2).png',
        tab: 'All',
    },
    {
        id: 7,
        category: 'Panjabi',
        name: 'Embro Semi Fit Panjabi',
        price: '$24.00',
        image: '/images/Product Card (1).png',
        tab: 'All',
    },
    {
        id: 8,
        category: 'Perfume',
        name: 'Haramain Attar Danah',
        price: '$24.00',
        image: '/images/Product Card.png',
        tab: 'All',
    },
];

export function TrendingProducts() {
    const [activeTab, setActiveTab] = useState('All');
    const [animationKey, setAnimationKey] = useState(0);

    const handleTabChange = useCallback((tab: string) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        setAnimationKey((prev) => prev + 1);
    }, [activeTab]);

    const filteredProducts =
        activeTab === 'All'
            ? trendingProducts
            : trendingProducts.filter((p) => p.category === activeTab);

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

                {/* Tabs */}
                <div className="flex justify-center gap-6 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`text-[13px] font-medium pb-1 border-b-2 transition-colors ${
                                activeTab === tab
                                    ? 'text-text-primary border-text-primary'
                                    : 'text-text-secondary border-transparent hover:text-text-primary'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Grid with smooth transition */}
                <div
                    key={animationKey}
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 min-h-[500px] lg:min-h-[600px] transition-all duration-700 ease-in-out animate-in fade-in slide-in-from-bottom-6"
                >
                    {filteredProducts.map((product) => (
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
            </div>
        </section>
    );
}
