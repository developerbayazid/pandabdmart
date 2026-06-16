'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { removeFromWishlistAction, moveToCartAction } from '@/actions/wishlist.actions';
import type { WishlistItem } from '@/repositories/wishlist.repository';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Trash2, Loader2 } from 'lucide-react';

type WishlistContentProps = {
    items: WishlistItem[];
};

export function WishlistContent({ items }: WishlistContentProps) {
    return (
        <div>
            <h2 className="font-[family-name:var(--font-serif)] text-[28px] font-normal text-text-primary mb-6">
                My Wishlist
            </h2>

            {items.length === 0 ? (
                <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                    <p className="text-sm text-text-secondary mb-4">
                        Your wishlist is empty.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 border border-text-primary text-text-primary px-5 py-2 text-[13px] font-medium rounded-md hover:bg-surface-inverse hover:text-text-inverse transition-colors"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <WishlistCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}

function WishlistCard({ item }: { item: WishlistItem }) {
    const [isRemoving, setIsRemoving] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRemove = async () => {
        setError(null);
        setIsRemoving(true);
        const result = await removeFromWishlistAction(item.id);
        if (!result.success && result.error) {
            setError(result.error);
        }
        setIsRemoving(false);
    };

    const handleMoveToCart = async () => {
        setError(null);
        setIsMoving(true);
        const result = await moveToCartAction(item.id, item.variantId, item.price);
        if (!result.success && result.error) {
            setError(result.error);
        }
        setIsMoving(false);
    };

    return (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden group">
            <Link href={`/products/${item.productSlug}`} className="block relative aspect-square bg-surface-tertiary">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted text-xs">
                        No image
                    </div>
                )}
            </Link>
            <div className="p-4">
                <Link
                    href={`/products/${item.productSlug}`}
                    className="text-sm font-medium text-text-primary hover:text-text-secondary transition-colors line-clamp-1"
                >
                    {item.productName}
                </Link>
                {item.attributeNames && (
                    <p className="text-xs text-text-muted mt-0.5">{item.attributeNames}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-semibold text-text-primary">
                        {formatCurrency(item.price)}
                    </span>
                    {item.comparePrice && item.comparePrice > item.price && (
                        <span className="text-xs text-text-muted line-through">
                            {formatCurrency(item.comparePrice)}
                        </span>
                    )}
                </div>
                {item.stock <= 0 && (
                    <p className="text-xs text-error mt-1">Out of Stock</p>
                )}
                {error && (
                    <p className="text-xs text-error mt-2">{error}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                    <Button type="button" size="sm" disabled={item.stock <= 0 || isMoving} onClick={handleMoveToCart}>
                        {isMoving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <ShoppingCart className="w-3.5 h-3.5" />
                        )}
                        {isMoving ? 'Moving...' : 'Move to Cart'}
                    </Button>
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={isRemoving}
                        className="p-2 text-text-muted hover:text-error rounded-md hover:bg-error-light transition-colors disabled:opacity-50"
                        aria-label="Remove from wishlist"
                    >
                        {isRemoving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
