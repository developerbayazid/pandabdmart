'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { cn } from '@/lib/utils';
import type { AdminProductFormData, AdminVariantFormData, ProductFormOptions } from '@/types/admin-product';

type ProductFormProps = {
    initialProduct?: Record<string, unknown> | null;
    options: ProductFormOptions;
    mode: 'create' | 'edit';
    productId?: string;
};

type LocalVariant = AdminVariantFormData & {
    localId: string;
};

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 200);
}

export function ProductForm({ initialProduct, options, mode, productId }: ProductFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parseInitialVariants = (): LocalVariant[] => {
        if (!initialProduct?.variants) return [];
        const variants = initialProduct.variants as Record<string, unknown>[];

        return variants.map((v, i) => {
            const images = (v.variant_images as Record<string, unknown>[]) ?? [];
            const attrValues = (v.variant_attribute_values as Record<string, unknown>[]) ?? [];

            return {
                localId: v.id as string ?? `local-${i}`,
                id: v.id as string,
                sku: v.sku as string,
                price: (v.price as number) ?? 0,
                comparePrice: (v.compare_price as number) ?? null,
                stock: (v.stock as number) ?? 0,
                isActive: (v.is_active as boolean) ?? true,
                attributeValueIds: attrValues.map((av) => av.attribute_value_id as string),
                images: images.map((img, idx) => ({
                    url: img.url as string,
                    isPrimary: (img.is_primary as boolean) ?? false,
                    sortOrder: (img.sort_order as number) ?? idx,
                })),
            };
        });
    };

    const [name, setName] = useState((initialProduct?.name as string) ?? '');
    const [slug, setSlug] = useState((initialProduct?.slug as string) ?? '');
    const [type, setType] = useState<'simple' | 'variable'>(
        (initialProduct?.type as 'simple' | 'variable') ?? 'simple',
    );
    const [status, setStatus] = useState<'draft' | 'active' | 'archived'>(
        (initialProduct?.status as 'draft' | 'active' | 'archived') ?? 'draft',
    );
    const [categoryId, setCategoryId] = useState((initialProduct?.category_id as string) ?? '');
    const [brandId, setBrandId] = useState((initialProduct?.brand_id as string) ?? '');
    const [description, setDescription] = useState((initialProduct?.description as string) ?? '');
    const [specsJson, setSpecsJson] = useState(
        initialProduct?.specs ? JSON.stringify(initialProduct.specs, null, 2) : '',
    );
    const [variants, setVariants] = useState<LocalVariant[]>(parseInitialVariants());
    const [expandedVariant, setExpandedVariant] = useState<string | null>(null);

    const handleNameChange = useCallback((value: string) => {
        setName(value);
        if (!slug || slug === generateSlug(name)) {
            setSlug(generateSlug(value));
        }
    }, [slug, name]);

    function addVariant() {
        const localId = `new-${Date.now()}`;
        const newVariant: LocalVariant = {
            localId,
            sku: `${slug || 'product'}-${variants.length + 1}`,
            price: 0,
            comparePrice: null,
            stock: 0,
            isActive: true,
            attributeValueIds: [],
            images: [],
        };
        setVariants([...variants, newVariant]);
        setExpandedVariant(localId);
    }

    function updateVariant(localId: string, updates: Partial<LocalVariant>) {
        setVariants(variants.map((v) => (v.localId === localId ? { ...v, ...updates } : v)));
    }

    function removeVariant(localId: string) {
        setVariants(variants.filter((v) => v.localId !== localId));
        if (expandedVariant === localId) setExpandedVariant(null);
    }

    function onAttributeValueToggle(variantLocalId: string, valueId: string) {
        const variant = variants.find((v) => v.localId === variantLocalId);
        if (!variant) return;

        const hasValue = variant.attributeValueIds.includes(valueId);
        const updatedIds = hasValue
            ? variant.attributeValueIds.filter((id) => id !== valueId)
            : [...variant.attributeValueIds, valueId];

        updateVariant(variantLocalId, { attributeValueIds: updatedIds });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Product name is required');
            return;
        }
        if (!categoryId) {
            setError('Please select a category');
            return;
        }
        if (variants.length === 0) {
            setError('At least one variant is required');
            return;
        }

        let specsObj: Record<string, unknown> = {};
        if (specsJson.trim()) {
            try {
                specsObj = JSON.parse(specsJson);
            } catch {
                setError('Specs JSON is invalid');
                return;
            }
        }

        setSaving(true);

        try {
            const { createProductAction, updateProductAction, createVariantAction, updateVariantAction, deleteVariantAction } =
                await import('@/actions/product.actions');

            if (mode === 'create') {
                const result = await createProductAction({
                    name: name.trim(),
                    slug: slug.trim(),
                    type,
                    status,
                    categoryId,
                    brandId,
                    description: description.trim(),
                    specs: specsObj,
                });

                if (!result.success || !result.productId) {
                    setError(result.error ?? 'Failed to create product');
                    setSaving(false);
                    return;
                }

                const newProductId = result.productId;

                for (const variant of variants) {
                    const variantResult = await createVariantAction(newProductId, {
                        sku: variant.sku,
                        price: variant.price,
                        comparePrice: variant.comparePrice,
                        stock: variant.stock,
                        isActive: variant.isActive,
                        attributeValueIds: variant.attributeValueIds,
                        images: variant.images,
                    });
                    if (!variantResult.success) {
                        setError(variantResult.error ?? 'Failed to create variant');
                        setSaving(false);
                        return;
                    }
                }

                router.push('/admin/products');
            } else if (mode === 'edit' && productId) {
                const productResult = await updateProductAction(productId, {
                    name: name.trim(),
                    slug: slug.trim(),
                    type,
                    status,
                    categoryId,
                    brandId,
                    description: description.trim(),
                    specs: specsObj,
                });

                if (!productResult.success) {
                    setError(productResult.error ?? 'Failed to update product');
                    setSaving(false);
                    return;
                }

                const existingVariantIds = new Set(
                    initialProduct?.variants
                        ? (initialProduct.variants as Record<string, unknown>[]).map((v) => v.id as string)
                        : [],
                );

                const currentVariantIds = new Set<string>();

                for (const variant of variants) {
                    if (variant.id) {
                        currentVariantIds.add(variant.id);
                        const vr = await updateVariantAction(variant.id, {
                            sku: variant.sku,
                            price: variant.price,
                            comparePrice: variant.comparePrice,
                            stock: variant.stock,
                            isActive: variant.isActive,
                            attributeValueIds: variant.attributeValueIds,
                            images: variant.images,
                        });
                        if (!vr.success) {
                            setError(vr.error ?? 'Failed to update variant');
                            setSaving(false);
                            return;
                        }
                    } else {
                        const vr = await createVariantAction(productId, {
                            sku: variant.sku,
                            price: variant.price,
                            comparePrice: variant.comparePrice,
                            stock: variant.stock,
                            isActive: variant.isActive,
                            attributeValueIds: variant.attributeValueIds,
                            images: variant.images,
                        });
                        if (!vr.success) {
                            setError(vr.error ?? 'Failed to create variant');
                            setSaving(false);
                            return;
                        }
                        if (vr.variantId) {
                            currentVariantIds.add(vr.variantId);
                        }
                    }
                }

                for (const existingId of existingVariantIds) {
                    if (!currentVariantIds.has(existingId)) {
                        await deleteVariantAction(existingId);
                    }
                }

                router.push('/admin/products');
            }
        } catch (err) {
            console.error('[ProductForm] submit error:', err);
            setError('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-error-light border border-error/20 rounded-md px-4 py-3 text-[14px] text-error">
                    {error}
                </div>
            )}

            {/* Basic Information */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                <h2 className="text-[16px] font-semibold text-text-primary mb-4">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                            placeholder="Product name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Slug
                        </label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                            placeholder="product-slug"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Type
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as 'simple' | 'variable')}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                        >
                            <option value="simple">Simple</option>
                            <option value="variable">Variable</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'draft' | 'active' | 'archived')}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                        >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Category
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                        >
                            <option value="">Select category</option>
                            {options.categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.fullPath}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Brand
                        </label>
                        <select
                            value={brandId}
                            onChange={(e) => setBrandId(e.target.value)}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                        >
                            <option value="">Select brand (optional)</option>
                            {options.brands.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary resize-y"
                            placeholder="Product description"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Specifications (JSON)
                        </label>
                        <textarea
                            value={specsJson}
                            onChange={(e) => setSpecsJson(e.target.value)}
                            rows={5}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary resize-y font-mono"
                            placeholder='{"weight": "500g", "dimensions": "10x5x3cm"}'
                        />
                    </div>
                </div>
            </div>

            {/* Variants */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-[16px] font-semibold text-text-primary">Variants</h2>
                        <p className="text-[13px] text-text-muted mt-0.5">
                            {type === 'simple' ? 'Simple products have one variant' : 'Add variants with different attribute combinations'}
                        </p>
                    </div>
                    {(type === 'variable' || variants.length === 0) && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={addVariant}
                        >
                            <Plus className="w-4 h-4" />
                            Add Variant
                        </Button>
                    )}
                </div>

                {variants.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-[14px] text-text-muted">No variants yet</p>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={addVariant}
                            className="mt-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Variant
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {variants.map((variant, index) => (
                            <VariantCard
                                key={variant.localId}
                                variant={variant}
                                index={index}
                                isExpanded={expandedVariant === variant.localId}
                                onToggle={() =>
                                    setExpandedVariant(
                                        expandedVariant === variant.localId ? null : variant.localId,
                                    )
                                }
                                onUpdate={(updates) => updateVariant(variant.localId, updates)}
                                onRemove={() => removeVariant(variant.localId)}
                                onAttributeToggle={(valueId) => onAttributeValueToggle(variant.localId, valueId)}
                                attributes={options.attributes}
                                productId={productId}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push('/admin/products')}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}

type VariantCardProps = {
    variant: LocalVariant;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (updates: Partial<LocalVariant>) => void;
    onRemove: () => void;
    onAttributeToggle: (valueId: string) => void;
    attributes: ProductFormOptions['attributes'];
    productId?: string;
};

function VariantCard({
    variant,
    index,
    isExpanded,
    onToggle,
    onUpdate,
    onRemove,
    onAttributeToggle,
    attributes,
    productId,
}: VariantCardProps) {
    const [imageProductId] = useState(productId ?? 'new');
    const [imageVariantId] = useState(variant.id ?? variant.localId);

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-surface-secondary cursor-pointer" onClick={onToggle}>
                <div className="flex items-center gap-3">
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-text-muted" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                    )}
                    <span className="text-[14px] font-medium text-text-primary">
                        Variant {index + 1}
                    </span>
                    <Badge variant={variant.isActive ? 'success' : 'neutral'}>
                        {variant.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {variant.sku && (
                        <span className="text-[12px] text-text-muted">SKU: {variant.sku}</span>
                    )}
                    <span className="text-[12px] text-text-secondary">
                        Stock: {variant.stock}
                    </span>
                    {variant.price > 0 && (
                        <span className="text-[12px] text-text-secondary">
                            ৳{variant.price.toLocaleString()}
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="p-1 text-text-muted hover:text-error transition-colors"
                    title="Remove variant"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {isExpanded && (
                <div className="p-4 space-y-4 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">SKU</label>
                            <input
                                type="text"
                                value={variant.sku}
                                onChange={(e) => onUpdate({ sku: e.target.value })}
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                                placeholder="SKU-001"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">Price</label>
                            <input
                                type="number"
                                value={variant.price || ''}
                                onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                                placeholder="0"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">Compare Price</label>
                            <input
                                type="number"
                                value={variant.comparePrice ?? ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    onUpdate({ comparePrice: val ? parseFloat(val) : null });
                                }}
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                                placeholder="Optional"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">Stock</label>
                            <input
                                type="number"
                                value={variant.stock || ''}
                                onChange={(e) => onUpdate({ stock: parseInt(e.target.value) || 0 })}
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={variant.isActive}
                                    onChange={(e) => onUpdate({ isActive: e.target.checked })}
                                    className="w-4 h-4 rounded border-border text-text-primary focus:ring-text-primary"
                                />
                                <span className="text-sm text-text-primary">Active</span>
                            </label>
                        </div>
                    </div>

                    {/* Attribute selectors */}
                    {attributes.length > 0 && (
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-2">
                                Attributes
                            </label>
                            <div className="space-y-2">
                                {attributes.map((attr) => (
                                    <div key={attr.id}>
                                        <span className="text-[12px] font-medium text-text-secondary block mb-1">
                                            {attr.name}
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {attr.values.map((val) => {
                                                const isSelected = variant.attributeValueIds.includes(val.id);
                                                return (
                                                    <button
                                                        key={val.id}
                                                        type="button"
                                                        onClick={() => onAttributeToggle(val.id)}
                                                        className={cn(
                                                            'px-2.5 py-1 text-[12px] font-medium rounded-full border transition-colors',
                                                            isSelected
                                                                ? 'bg-text-primary text-text-inverse border-text-primary'
                                                                : 'bg-surface text-text-secondary border-border hover:bg-surface-secondary',
                                                        )}
                                                    >
                                                        {val.value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Images */}
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-2">
                            Images
                        </label>
                        <ImageUpload
                            images={variant.images}
                            onChange={(images) => onUpdate({ images })}
                            productId={imageProductId}
                            variantId={imageVariantId}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
