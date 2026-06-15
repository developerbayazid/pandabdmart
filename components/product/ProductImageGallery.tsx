'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductVariant } from '@/types/product';

type ProductImageGalleryProps = {
    variants: ProductVariant[];
    productName: string;
};

export function ProductImageGallery({ variants, productName }: ProductImageGalleryProps) {
    const allImages = variants.flatMap((v) =>
        v.images.map((img) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            variantId: v.id,
        })),
    );

    const uniqueImages = allImages.filter(
        (img, idx, arr) => arr.findIndex((i) => i.url === img.url) === idx,
    );

    const sortedImages = uniqueImages.sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return 0;
    });

    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedImage = sortedImages[selectedIndex]?.url ?? null;

    if (sortedImages.length === 0) {
        return (
            <div className="w-full h-[500px] bg-surface-secondary rounded-lg flex items-center justify-center">
                <span className="text-text-muted text-sm">No Images Available</span>
            </div>
        );
    }

    return (
        <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3 w-[80px] shrink-0">
                {sortedImages.map((img, idx) => (
                    <button
                        key={`${img.url}-${idx}`}
                        onClick={() => setSelectedIndex(idx)}
                        className={`relative w-[80px] h-[100px] rounded-lg overflow-hidden border transition-colors ${
                            idx === selectedIndex
                                ? 'border-text-primary'
                                : 'border-border hover:border-border-strong'
                        }`}
                    >
                        <Image
                            src={img.url}
                            alt={`${productName} - ${idx + 1}`}
                            fill
                            className="object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative h-[500px] bg-surface-secondary rounded-lg overflow-hidden">
                {selectedImage ? (
                    <Image
                        src={selectedImage}
                        alt={productName}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm">
                        No Image
                    </div>
                )}
            </div>
        </div>
    );
}
