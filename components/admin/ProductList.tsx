'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { formatCurrency } from '@/lib/utils';
import type { AdminProductListItem, AdminProductFilters, ProductFormOptions } from '@/types/admin-product';

type ProductListProps = {
    initialData: {
        products: AdminProductListItem[];
        total: number;
        page: number;
        totalPages: number;
    } | null;
    filterOptions: ProductFormOptions | null;
    currentFilters: AdminProductFilters;
};

const statusBadge: Record<string, 'neutral' | 'success' | 'warning'> = {
    draft: 'neutral',
    active: 'success',
    archived: 'warning',
};

export function ProductList({ initialData, filterOptions, currentFilters }: ProductListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(currentFilters.search ?? '');

    function updateFilters(updates: Partial<AdminProductFilters>) {
        const params = new URLSearchParams(searchParams.toString());

        const merged = { ...currentFilters, ...updates };

        if (merged.search) params.set('search', merged.search);
        else params.delete('search');

        if (merged.categoryId) params.set('category', merged.categoryId);
        else params.delete('category');

        if (merged.brandId) params.set('brand', merged.brandId);
        else params.delete('brand');

        if (merged.status) params.set('status', merged.status);
        else params.delete('status');

        if (merged.page && merged.page > 1) params.set('page', String(merged.page));
        else params.delete('page');

        router.push(`/admin/products?${params.toString()}`);
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        updateFilters({ search: search || undefined, page: 1 });
    }

    function handlePageChange(page: number) {
        updateFilters({ page });
    }

    const data = initialData;
    const options = filterOptions;

    return (
        <div className="space-y-4">
            {/* Filters bar */}
            <div className="flex flex-wrap items-center gap-3">
                <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-[400px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary"
                    />
                </form>

                {options && (
                    <>
                        <select
                            value={currentFilters.categoryId ?? ''}
                            onChange={(e) => updateFilters({ categoryId: e.target.value || undefined, page: 1 })}
                            className="bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                        >
                            <option value="">All Categories</option>
                            {options.categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.fullPath}</option>
                            ))}
                        </select>

                        <select
                            value={currentFilters.brandId ?? ''}
                            onChange={(e) => updateFilters({ brandId: e.target.value || undefined, page: 1 })}
                            className="bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                        >
                            <option value="">All Brands</option>
                            {options.brands.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>

                        <select
                            value={currentFilters.status ?? ''}
                            onChange={(e) => updateFilters({ status: e.target.value || undefined, page: 1 })}
                            className="bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                        >
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                    </>
                )}
            </div>

            {/* Table */}
            {!data || data.products.length === 0 ? (
                <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                    <p className="text-[14px] text-text-secondary">No products found</p>
                    {currentFilters.search || currentFilters.categoryId || currentFilters.brandId || currentFilters.status ? (
                        <button
                            onClick={() => router.push('/admin/products')}
                            className="mt-2 text-[14px] text-text-secondary underline hover:text-text-primary"
                        >
                            Clear all filters
                        </button>
                    ) : (
                        <a
                            href="/admin/products/new"
                            className="inline-block mt-3 px-4 py-2 bg-surface-inverse text-text-inverse text-[14px] font-medium rounded-md hover:bg-surface-inverse-hover transition-colors"
                        >
                            Create your first product
                        </a>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-10 h-10 rounded-md object-cover border border-border"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-md bg-surface-secondary border border-border flex items-center justify-center">
                                                        <span className="text-text-muted text-xs">N/A</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-[14px] font-medium text-text-primary">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-[12px] text-text-muted">
                                                        {product.variantCount} variant{product.variantCount !== 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[14px] text-text-secondary">{product.categoryName}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[14px] text-text-secondary">{product.brandName}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="neutral">{product.type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusBadge[product.status] ?? 'neutral'}>
                                                {product.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-[14px] font-medium ${product.totalStock <= 5 && product.totalStock > 0 ? 'text-warning-foreground' : product.totalStock === 0 ? 'text-error' : 'text-text-primary'}`}>
                                                {product.totalStock}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[14px] font-medium text-text-primary">
                                                {product.minPrice != null ? formatCurrency(product.minPrice) : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="text-[13px] text-text-secondary hover:text-text-primary transition-colors"
                                                >
                                                    Edit
                                                </a>
                                                <DeleteProductButton productId={product.id} productName={product.name} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-[14px] text-text-secondary">
                            Showing {((data.page - 1) * 20) + 1}-{Math.min(data.page * 20, data.total)} of {data.total} products
                        </div>
                        <Pagination
                            currentPage={data.page}
                            totalPages={data.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
    const [confirming, setConfirming] = useState(false);

    async function handleDelete() {
        const { deleteProductAction } = await import('@/actions/product.actions');
        const result = await deleteProductAction(productId);
        if (result.success) {
            setConfirming(false);
        } else {
            alert(result.error ?? 'Failed to delete product');
        }
    }

    if (confirming) {
        return (
            <span className="inline-flex items-center gap-1 text-[13px]">
                <span className="text-text-muted">Delete?</span>
                <button onClick={handleDelete} className="text-error hover:underline">
                    Yes
                </button>
                <button onClick={() => setConfirming(false)} className="text-text-secondary hover:underline">
                    No
                </button>
            </span>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="text-[13px] text-error hover:text-red-700 transition-colors"
        >
            Delete
        </button>
    );
}
