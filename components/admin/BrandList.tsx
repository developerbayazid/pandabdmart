'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import {
    createBrandAction,
    updateBrandAction,
    deleteBrandAction,
} from '@/actions/brand.actions';
import type { AdminBrandListItem, AdminBrandListResult, AdminBrandFormData } from '@/types/admin-catalog';

type BrandListProps = {
    initialData: AdminBrandListResult | null;
    currentSearch: string;
};

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 200);
}

type BrandFormState = {
    mode: 'create' | 'edit';
    brandId?: string;
    name: string;
    slug: string;
};

export function BrandList({ initialData, currentSearch }: BrandListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(currentSearch);
    const [form, setForm] = useState<BrandFormState | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const data = initialData ?? { brands: [], total: 0, page: 1, totalPages: 1 };

    function updateSearch(value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        params.delete('page');
        router.push(`/admin/brands?${params.toString()}`);
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        updateSearch(search);
    }

    function handlePageChange(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        if (search) params.set('search', search);
        params.set('page', page.toString());
        router.push(`/admin/brands?${params.toString()}`);
    }

    function openCreateForm() {
        setForm({ mode: 'create', name: '', slug: '' });
        setError(null);
    }

    function openEditForm(brand: AdminBrandListItem) {
        setForm({
            mode: 'edit',
            brandId: brand.id,
            name: brand.name,
            slug: brand.slug,
        });
        setError(null);
    }

    function closeForm() {
        setForm(null);
        setError(null);
    }

    async function handleSave() {
        if (!form) return;
        const formData: AdminBrandFormData = {
            name: form.name,
            slug: form.slug,
        };

        setSaving(true);
        setError(null);

        let result;
        if (form.mode === 'create') {
            result = await createBrandAction(formData);
        } else if (form.brandId) {
            result = await updateBrandAction(form.brandId, formData);
        }

        if (result?.success) {
            closeForm();
            router.refresh();
        } else {
            setError(result?.error ?? 'Action failed');
        }
        setSaving(false);
    }

    async function handleDelete(brandId: string) {
        setDeleting(brandId);
        const result = await deleteBrandAction(brandId);
        if (result.success) {
            router.refresh();
        } else {
            setError(result.error ?? 'Failed to delete brand');
            setDeleting(null);
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
                        placeholder="Search brands..."
                        className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary"
                    />
                </form>
                <Button variant="primary" size="sm" onClick={openCreateForm}>
                    <Plus className="w-4 h-4" />
                    New Brand
                </Button>
            </div>

            {form && (
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)] space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[16px] font-semibold text-text-primary">
                            {form.mode === 'create' ? 'New Brand' : 'Edit Brand'}
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
                                Name
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    setForm((prev) => ({
                                        ...prev!,
                                        name,
                                        slug:
                                            prev!.mode === 'create' &&
                                            (!prev!.slug || prev!.slug === generateSlug(prev!.name))
                                                ? generateSlug(name)
                                                : prev!.slug,
                                    }));
                                }}
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                placeholder="e.g. Apple"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                Slug
                            </label>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev!, slug: e.target.value }))
                                }
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                placeholder="e.g. apple"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Button variant="primary" onClick={handleSave} disabled={saving}>
                            {saving
                                ? 'Saving...'
                                : form.mode === 'create'
                                  ? 'Create Brand'
                                  : 'Save Changes'}
                        </Button>
                        <Button variant="secondary" onClick={closeForm} disabled={saving}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                {data.brands.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-text-muted" />
                        </div>
                        <p className="text-[14px] text-text-secondary mb-4">No brands yet</p>
                        <Button variant="secondary" onClick={openCreateForm}>
                            <Plus className="w-4 h-4" />
                            Create your first brand
                        </Button>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead className="w-24">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.brands.map((brand) => (
                                    <TableRow key={brand.id}>
                                        <TableCell className="font-medium">
                                            {brand.name}
                                        </TableCell>
                                        <TableCell className="text-text-secondary">
                                            {brand.slug}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="neutral">
                                                {brand.productCount}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditForm(brand)}
                                                    className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-surface-tertiary transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(brand.id)}
                                                    disabled={deleting === brand.id}
                                                    className="p-1.5 text-text-muted hover:text-error rounded hover:bg-error-light transition-colors disabled:opacity-50"
                                                >
                                                    {deleting === brand.id ? (
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
