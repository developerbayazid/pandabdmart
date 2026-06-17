'use client';

import { useState, useRef } from 'react';
import { Upload, X, Star } from 'lucide-react';

type ImageUploadProps = {
    images: { url: string; isPrimary: boolean; sortOrder: number }[];
    onChange: (images: { url: string; isPrimary: boolean; sortOrder: number }[]) => void;
    productId?: string;
    variantId?: string;
};

export function ImageUpload({ images, onChange, productId, variantId }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        try {
            const { uploadProductImage } = await import('@/lib/upload');
            const newImages = [...images];

            for (const file of Array.from(files)) {
                const tempId = variantId ?? 'new';
                const pid = productId ?? 'new';
                const url = await uploadProductImage(file, pid, tempId);
                const isFirst = newImages.length === 0;
                newImages.push({
                    url,
                    isPrimary: isFirst,
                    sortOrder: newImages.length,
                });
            }

            onChange(newImages);
        } catch (error) {
            console.error('[ImageUpload] Upload failed:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }

    function setPrimary(index: number) {
        const updated = images.map((img, i) => ({
            ...img,
            isPrimary: i === index,
        }));
        onChange(updated);
    }

    function removeImage(index: number) {
        const updated = images.filter((_, i) => i !== index);
        if (images[index]?.isPrimary && updated.length > 0) {
            updated[0].isPrimary = true;
        }
        onChange(updated);
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-3">
                {images.map((img, index) => (
                    <div key={index} className="relative group w-20 h-20 rounded-md border border-border overflow-hidden bg-surface-secondary">
                        <img
                            src={img.url}
                            alt={`Variant image ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        {img.isPrimary && (
                            <div className="absolute top-1 left-1 bg-text-primary text-text-inverse rounded-full p-0.5">
                                <Star className="w-3 h-3" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                            {!img.isPrimary && (
                                <button
                                    type="button"
                                    onClick={() => setPrimary(index)}
                                    className="p-1 bg-surface rounded-md hover:bg-surface-secondary"
                                    title="Set as primary"
                                >
                                    <Star className="w-3.5 h-3.5 text-text-secondary" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="p-1 bg-surface rounded-md hover:bg-error-light"
                                title="Remove"
                            >
                                <X className="w-3.5 h-3.5 text-error" />
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-20 h-20 rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-text-muted hover:text-text-secondary hover:border-border-strong transition-colors disabled:opacity-50"
                >
                    <Upload className="w-4 h-4" />
                    <span className="text-[10px]">{uploading ? 'Uploading...' : 'Upload'}</span>
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
            />

            {images.length > 0 && (
                <p className="text-[11px] text-text-muted">
                    Click the star to set as primary image. Hover to remove.
                </p>
            )}
        </div>
    );
}
