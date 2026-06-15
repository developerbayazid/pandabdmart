'use client';

import { useState } from 'react';
import type { ProductDetail } from '@/types/product';
import { ReviewSummary } from './ReviewSummary';
import { ReviewList } from './ReviewList';
import { ReviewForm } from './ReviewForm';

type ProductTabsProps = {
    product: ProductDetail;
};

type Tab = 'description' | 'info' | 'reviews';

export function ProductTabs({ product }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState<Tab>('description');

    const specs = product.specs ?? {};
    const specEntries = Object.entries(specs).filter(
        ([, value]) => value !== null && value !== undefined,
    );

    const tabButtons: { id: Tab; label: string; badge?: string }[] = [
        { id: 'description', label: 'Product description' },
        { id: 'info', label: 'Product info' },
        {
            id: 'reviews',
            label: 'Reviews',
            badge: product.reviewCount > 0 ? `(${product.reviewCount})` : undefined,
        },
    ];

    return (
        <div>
            {/* Tab Headers */}
            <div className="flex border-b border-border">
                {tabButtons.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 text-[14px] font-medium transition-colors relative ${
                            activeTab === tab.id
                                ? 'text-text-primary'
                                : 'text-text-secondary hover:text-text-primary'
                        } ${tab.id !== 'description' ? 'ml-8' : ''}`}
                    >
                        {tab.label}
                        {tab.badge && (
                            <span className="ml-1 text-text-muted text-[12px]">{tab.badge}</span>
                        )}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="pt-6">
                {activeTab === 'description' && (
                    <div className="space-y-3">
                        {specEntries.length > 0 ? (
                            specEntries.map(([key, value]) => (
                                <p key={key} className="text-[14px] text-text-primary">
                                    <span className="font-semibold capitalize">{key}:</span>{' '}
                                    <span className="text-text-secondary">
                                        {String(value)}
                                    </span>
                                </p>
                            ))
                        ) : (
                            <p className="text-[14px] text-text-secondary">
                                {product.description ?? 'No description available.'}
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="space-y-3">
                        <p className="text-[14px] text-text-primary">
                            <span className="font-semibold">Brand:</span>{' '}
                            <span className="text-text-secondary">{product.brandName}</span>
                        </p>
                        <p className="text-[14px] text-text-primary">
                            <span className="font-semibold">Category:</span>{' '}
                            <span className="text-text-secondary">{product.categoryName}</span>
                        </p>
                        <p className="text-[14px] text-text-primary">
                            <span className="font-semibold">Product Type:</span>{' '}
                            <span className="text-text-secondary capitalize">{product.type}</span>
                        </p>
                        <p className="text-[14px] text-text-primary">
                            <span className="font-semibold">SKU:</span>{' '}
                            <span className="text-text-secondary">
                                {product.variants[0]?.sku ?? 'N/A'}
                            </span>
                        </p>
                        {product.variants.length > 1 && (
                            <p className="text-[14px] text-text-primary">
                                <span className="font-semibold">Variants:</span>{' '}
                                <span className="text-text-secondary">
                                    {product.variants.length} options available
                                </span>
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div>
                        <ReviewSummary
                            rating={product.rating}
                            reviewCount={product.reviewCount}
                            reviews={product.reviews}
                        />
                        <ReviewList reviews={product.reviews} />
                        <div className="mt-6">
                            <ReviewForm
                                productSlug={product.slug}
                                productId={product.id}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
