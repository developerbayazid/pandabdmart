'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type {
    InventoryItemFormData,
    InventoryVariantFormData,
    InventoryFormOptions,
} from '@/types/admin-inventory';

type InventoryFormProps = {
    initialItem?: Record<string, unknown> | null;
    options: InventoryFormOptions;
    mode: 'create' | 'edit';
    itemId?: string;
};

const emptyVariant: InventoryVariantFormData = {
    sku: '',
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
    isActive: true,
};

export function InventoryForm({ initialItem, options, mode, itemId }: InventoryFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const existingVariants = initialItem
        ? ((initialItem.variants as Record<string, unknown>[]) ?? []).map((v) => ({
              id: v.id as string,
              sku: v.sku as string,
              purchasePrice: (v.purchase_price as number) ?? 0,
              sellingPrice: (v.selling_price as number) ?? 0,
              stock: (v.stock as number) ?? 0,
              isActive: (v.is_active as boolean) ?? true,
          }))
        : [];

    const [form, setForm] = useState<InventoryItemFormData>({
        name: (initialItem?.name as string) ?? '',
        skuPrefix: (initialItem?.sku_prefix as string) ?? '',
        type: (initialItem?.type as 'simple' | 'variable') ?? 'simple',
        categoryId: (initialItem?.category_id as string) ?? '',
        brandId: (initialItem?.brand_id as string) ?? '',
        supplier: (initialItem?.supplier as string) ?? '',
        purchasePrice: (initialItem?.purchase_price as number) ?? 0,
        sellingPrice: (initialItem?.selling_price as number) ?? 0,
        reorderPoint: (initialItem?.reorder_point as number) ?? 5,
        warehouseLocation: (initialItem?.warehouse_location as string) ?? '',
        notes: (initialItem?.notes as string) ?? '',
    });

    const [variants, setVariants] = useState<InventoryVariantFormData[]>(
        existingVariants.length > 0 ? existingVariants : [emptyVariant],
    );
    const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);

    function updateField(field: keyof InventoryItemFormData, value: string | number) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function updateVariant(index: number, field: keyof InventoryVariantFormData, value: string | number | boolean) {
        setVariants((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    }

    function addVariant() {
        setVariants((prev) => [...prev, { ...emptyVariant }]);
    }

    function removeVariant(index: number) {
        const variant = variants[index];
        if (variant.id) {
            setDeletedVariantIds((prev) => [...prev, variant.id!]);
        }
        setVariants((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!form.name.trim()) {
            setError('Item name is required');
            return;
        }
        if (!form.skuPrefix.trim()) {
            setError('SKU prefix is required');
            return;
        }
        if (variants.length === 0) {
            setError('At least one variant is required');
            return;
        }

        setSaving(true);

        try {
            if (mode === 'create') {
                const { createInventoryItemAction, createInventoryVariantAction } = await import(
                    '@/actions/inventory.actions'
                );

                const itemResult = await createInventoryItemAction(form);
                if (!itemResult.success || !itemResult.itemId) {
                    setError(itemResult.error ?? 'Failed to create item');
                    setSaving(false);
                    return;
                }

                const variantResults = await Promise.all(
                    variants.map((v) => createInventoryVariantAction(itemResult.itemId!, v)),
                );
                const failedVariant = variantResults.find((r) => !r.success);
                if (failedVariant) {
                    setError(failedVariant.error ?? 'Failed to create variant');
                    setSaving(false);
                    return;
                }

                router.push('/admin/inventory');
            } else if (mode === 'edit' && itemId) {
                const { updateInventoryItemAction, createInventoryVariantAction, updateInventoryVariantAction, deleteInventoryVariantAction } =
                    await import('@/actions/inventory.actions');

                const itemResult = await updateInventoryItemAction(itemId, form);
                if (!itemResult.success) {
                    setError(itemResult.error ?? 'Failed to update item');
                    setSaving(false);
                    return;
                }

                await Promise.all(
                    deletedVariantIds.map((vId) => deleteInventoryVariantAction(vId)),
                );

                const variantResults = await Promise.all(
                    variants.map((v) =>
                        v.id
                            ? updateInventoryVariantAction(v.id, v)
                            : createInventoryVariantAction(itemId, v),
                    ),
                );
                const failedVariant = variantResults.find((r) => !r.success);
                if (failedVariant) {
                    setError(failedVariant.error ?? 'Failed to update variant');
                    setSaving(false);
                    return;
                }

                router.push('/admin/inventory');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        }

        setSaving(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-error/10 border border-error/30 text-error text-[14px] rounded-md px-4 py-3">
                    {error}
                </div>
            )}

            {/* Basic Information */}
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                <h2 className="text-[15px] font-semibold text-text-primary">Basic Information</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-text-primary">Name</label>
                        <Input
                            value={form.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="Item name"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-text-primary">SKU Prefix</label>
                        <Input
                            value={form.skuPrefix}
                            onChange={(e) => updateField('skuPrefix', e.target.value)}
                            placeholder="e.g. INV-TSH"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-text-primary">Type</label>
                        <select
                            value={form.type}
                            onChange={(e) => updateField('type', e.target.value)}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                        >
                            <option value="simple">Simple</option>
                            <option value="variable">Variable</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-text-primary">Category</label>
                        <select
                            value={form.categoryId}
                            onChange={(e) => updateField('categoryId', e.target.value)}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                        >
                            <option value="">Select category</option>
                            {options.categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.fullPath}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-text-primary">Brand</label>
                        <select
                            value={form.brandId}
                            onChange={(e) => updateField('brandId', e.target.value)}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                        >
                            <option value="">Select brand</option>
                            {options.brands.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Supply Chain Information */}
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                <h2 className="text-[15px] font-semibold text-text-primary">Supply Chain</h2>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-text-primary">Supplier</label>
                        <Input
                            value={form.supplier}
                            onChange={(e) => updateField('supplier', e.target.value)}
                            placeholder="Supplier name"
                            list="supplier-list"
                        />
                        <datalist id="supplier-list">
                            {options.suppliers.map((s) => (
                                <option key={s} value={s} />
                            ))}
                        </datalist>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-text-primary">Purchase Price</label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.purchasePrice}
                            onChange={(e) => updateField('purchasePrice', parseFloat(e.target.value) || 0)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-text-primary">Selling Price</label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.sellingPrice}
                            onChange={(e) => updateField('sellingPrice', parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-text-primary">Reorder Point</label>
                        <Input
                            type="number"
                            min="0"
                            value={form.reorderPoint}
                            onChange={(e) => updateField('reorderPoint', parseInt(e.target.value) || 0)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-text-primary">Warehouse Location</label>
                        <Input
                            value={form.warehouseLocation}
                            onChange={(e) => updateField('warehouseLocation', e.target.value)}
                            placeholder="e.g. WH-01, Dhaka"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-text-primary">Notes</label>
                    <textarea
                        value={form.notes}
                        onChange={(e) => updateField('notes', e.target.value)}
                        rows={3}
                        className="w-full bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary resize-none"
                        placeholder="Internal notes..."
                    />
                </div>
            </div>

            {/* Variants */}
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-[15px] font-semibold text-text-primary">
                        Variants ({variants.length})
                    </h2>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={addVariant}
                    >
                        <Plus className="w-4 h-4" />
                        Add Variant
                    </Button>
                </div>

                <div className="space-y-3">
                    {variants.map((variant, index) => (
                        <div
                            key={index}
                            className="bg-surface-secondary border border-border rounded-xl p-4"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Badge variant="neutral">Variant {index + 1}</Badge>
                                    {variant.id && (
                                        <span className="text-[12px] text-text-muted">SKU: {variant.sku}</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    className="text-text-muted hover:text-error transition-colors"
                                    title="Remove variant"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-5 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-[12px] font-medium text-text-secondary">SKU</label>
                                    <Input
                                        value={variant.sku}
                                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                        placeholder={`${form.skuPrefix}-001`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[12px] font-medium text-text-secondary">Purchase Price</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={variant.purchasePrice}
                                        onChange={(e) => updateVariant(index, 'purchasePrice', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[12px] font-medium text-text-secondary">Selling Price</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={variant.sellingPrice}
                                        onChange={(e) => updateVariant(index, 'sellingPrice', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[12px] font-medium text-text-secondary">Stock</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={variant.stock}
                                        onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-1 flex items-end">
                                    <label className="flex items-center gap-2 text-[13px] text-text-primary cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={variant.isActive}
                                            onChange={(e) => updateVariant(index, 'isActive', e.target.checked)}
                                            className="rounded border-border"
                                        />
                                        Active
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : mode === 'create' ? 'Create Inventory Item' : 'Save Changes'}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push('/admin/inventory')}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
