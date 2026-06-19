'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import {
    createCouponAction,
    updateCouponAction,
    deleteCouponAction,
} from '@/actions/coupon.actions';
import type { AdminCouponListItem, AdminCouponListResult, AdminCouponFormData } from '@/types/admin-coupon';

type CouponListProps = {
    initialData: AdminCouponListResult | null;
    currentSearch: string;
};

type CouponFormState = {
    mode: 'create' | 'edit';
    couponId?: string;
    code: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: string;
    minOrder: string;
    usageLimit: string;
    expiresAt: string;
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function toDateInputValue(dateStr: string | null): string {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().slice(0, 10);
}

const TYPE_LABELS: Record<string, string> = {
    percentage: 'Percentage',
    fixed: 'Fixed',
    free_shipping: 'Free Shipping',
};

export function CouponList({ initialData, currentSearch }: CouponListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(currentSearch);
    const [form, setForm] = useState<CouponFormState | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const data = initialData ?? { coupons: [], total: 0, page: 1, totalPages: 1 };

    function updateSearch(value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        params.delete('page');
        router.push(`/admin/coupons?${params.toString()}`);
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        updateSearch(search);
    }

    function handlePageChange(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        if (search) params.set('search', search);
        params.set('page', page.toString());
        router.push(`/admin/coupons?${params.toString()}`);
    }

    function openCreateForm() {
        setForm({
            mode: 'create',
            code: '',
            type: 'percentage',
            value: '',
            minOrder: '0',
            usageLimit: '0',
            expiresAt: '',
        });
        setError(null);
    }

    function openEditForm(coupon: AdminCouponListItem) {
        setForm({
            mode: 'edit',
            couponId: coupon.id,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value.toString(),
            minOrder: coupon.minOrder.toString(),
            usageLimit: coupon.usageLimit.toString(),
            expiresAt: toDateInputValue(coupon.expiresAt),
        });
        setError(null);
    }

    function closeForm() {
        setForm(null);
        setError(null);
    }

    async function handleSave() {
        if (!form) return;

        const formData: AdminCouponFormData = {
            code: form.code,
            type: form.type,
            value: parseFloat(form.value) || 0,
            minOrder: parseFloat(form.minOrder) || 0,
            usageLimit: parseInt(form.usageLimit) || 0,
            expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        };

        setSaving(true);
        setError(null);

        let result;
        if (form.mode === 'create') {
            result = await createCouponAction(formData);
        } else if (form.couponId) {
            result = await updateCouponAction(form.couponId, formData);
        }

        if (result?.success) {
            closeForm();
            router.refresh();
        } else {
            setError(result?.error ?? 'Action failed');
        }
        setSaving(false);
    }

    async function handleDelete(couponId: string) {
        setDeleting(couponId);
        const result = await deleteCouponAction(couponId);
        if (result.success) {
            router.refresh();
        } else {
            setError(result.error ?? 'Failed to delete coupon');
            setDeleting(null);
        }
    }

    function formatValueDisplay(coupon: AdminCouponListItem): string {
        if (coupon.type === 'free_shipping') return 'Free Shipping';
        if (coupon.type === 'percentage') return `${coupon.value}%`;
        return `৳${coupon.value.toFixed(2)}`;
    }

    function getTypeBadgeVariant(type: string): 'info' | 'success' | 'warning' {
        switch (type) {
            case 'percentage': return 'info';
            case 'fixed': return 'success';
            case 'free_shipping': return 'warning';
            default: return 'info';
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search coupons by code..."
                        className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary"
                    />
                </form>
                <Button variant="primary" size="sm" onClick={openCreateForm}>
                    <Plus className="w-4 h-4" />
                    New Coupon
                </Button>
            </div>

            {form && (
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)] space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[16px] font-semibold text-text-primary">
                            {form.mode === 'create' ? 'New Coupon' : 'Edit Coupon'}
                        </h2>
                        <button
                            onClick={closeForm}
                            className="p-1 text-text-muted hover:text-text-primary transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-error-light border border-error/20 rounded-md px-4 py-3 text-[14px] text-error">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                Code
                            </label>
                            <input
                                type="text"
                                value={form.code}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev!, code: e.target.value.toUpperCase() }))
                                }
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                placeholder="e.g. SUMMER10"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                Type
                            </label>
                            <select
                                value={form.type}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev!, type: e.target.value as CouponFormState['type'] }))
                                }
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed (৳)</option>
                                <option value="free_shipping">Free Shipping</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                {form.type === 'percentage' ? 'Discount %' : form.type === 'fixed' ? 'Discount Amount (৳)' : 'Value'}
                            </label>
                            <input
                                type="number"
                                min="0"
                                step={form.type === 'percentage' ? '1' : '0.01'}
                                value={form.value}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev!, value: e.target.value }))
                                }
                                disabled={form.type === 'free_shipping'}
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary disabled:opacity-50"
                                placeholder={form.type === 'percentage' ? 'e.g. 10' : 'e.g. 100'}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                Min Order (৳)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.minOrder}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev!, minOrder: e.target.value }))
                                }
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                Usage Limit (0 = unlimited)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.usageLimit}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev!, usageLimit: e.target.value }))
                                }
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                Expiry Date
                            </label>
                            <input
                                type="date"
                                value={form.expiresAt}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev!, expiresAt: e.target.value }))
                                }
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Button variant="primary" onClick={handleSave} disabled={saving}>
                            {saving
                                ? 'Saving...'
                                : form.mode === 'create'
                                  ? 'Create Coupon'
                                  : 'Save Changes'}
                        </Button>
                        <Button variant="secondary" onClick={closeForm} disabled={saving}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                {data.coupons.length === 0 && !currentSearch ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-text-muted" />
                        </div>
                        <p className="text-[14px] text-text-secondary mb-4">No coupons yet</p>
                        <Button variant="secondary" onClick={openCreateForm}>
                            <Plus className="w-4 h-4" />
                            Create your first coupon
                        </Button>
                    </div>
                ) : data.coupons.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-[14px] text-text-secondary">
                            No coupons match your search
                        </p>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Min Order</TableHead>
                                    <TableHead>Uses</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-24">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.coupons.map((coupon) => (
                                    <TableRow key={coupon.id}>
                                        <TableCell className="font-medium">
                                            {coupon.code}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getTypeBadgeVariant(coupon.type)}>
                                                {TYPE_LABELS[coupon.type]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-text-secondary">
                                            {formatValueDisplay(coupon)}
                                        </TableCell>
                                        <TableCell className="text-text-secondary">
                                            {coupon.minOrder > 0 ? `৳${coupon.minOrder.toFixed(2)}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-text-secondary">
                                            {coupon.usedCount}{coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : ''}
                                        </TableCell>
                                        <TableCell className="text-text-secondary">
                                            {formatDate(coupon.expiresAt)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={coupon.isActive ? 'success' : 'neutral'}>
                                                {coupon.isActive ? 'Active' : 'Disabled'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditForm(coupon)}
                                                    className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-surface-tertiary transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    disabled={deleting === coupon.id}
                                                    className="p-1.5 text-text-muted hover:text-error rounded hover:bg-error-light transition-colors disabled:opacity-50"
                                                >
                                                    {deleting === coupon.id ? (
                                                        <span className="text-[11px]">...</span>
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {data.totalPages > 1 && (
                            <div className="border-t border-border px-6 py-3 flex justify-center">
                                <Pagination
                                    currentPage={data.page}
                                    totalPages={data.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
