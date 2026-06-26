'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ArrowRightLeft, Undo2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { formatCurrency } from '@/lib/utils';
import type { InventoryItemListItem, InventoryFilters, InventoryFormOptions } from '@/types/admin-inventory';

type InventoryListProps = {
    initialData: {
        items: InventoryItemListItem[];
        total: number;
        page: number;
        totalPages: number;
    } | null;
    filterOptions: InventoryFormOptions | null;
    currentFilters: InventoryFilters;
};

const statusBadge: Record<string, 'neutral' | 'success'> = {
    draft: 'neutral',
    transferred: 'success',
};

export function InventoryList({ initialData, filterOptions, currentFilters }: InventoryListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(currentFilters.search ?? '');

    function updateFilters(updates: Partial<InventoryFilters>) {
        const params = new URLSearchParams(searchParams.toString());
        const merged = { ...currentFilters, ...updates };

        if (merged.search) params.set('search', merged.search);
        else params.delete('search');

        if (merged.categoryId) params.set('category', merged.categoryId);
        else params.delete('category');

        if (merged.brandId) params.set('brand', merged.brandId);
        else params.delete('brand');

        if (merged.supplier) params.set('supplier', merged.supplier);
        else params.delete('supplier');

        if (merged.status) params.set('status', merged.status);
        else params.delete('status');

        if (merged.page && merged.page > 1) params.set('page', String(merged.page));
        else params.delete('page');

        router.push(`/admin/inventory?${params.toString()}`);
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
            <div className="flex flex-wrap items-center gap-3">
                <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-[400px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search inventory..."
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
                            value={currentFilters.supplier ?? ''}
                            onChange={(e) => updateFilters({ supplier: e.target.value || undefined, page: 1 })}
                            className="bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                        >
                            <option value="">All Suppliers</option>
                            {options.suppliers.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>

                        <select
                            value={currentFilters.status ?? ''}
                            onChange={(e) => updateFilters({ status: e.target.value || undefined, page: 1 })}
                            className="bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                        >
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="transferred">Transferred</option>
                        </select>
                    </>
                )}
            </div>

            {!data || data.items.length === 0 ? (
                <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                    <p className="text-[14px] text-text-secondary">No inventory items found</p>
                    {currentFilters.search || currentFilters.categoryId || currentFilters.brandId || currentFilters.supplier || currentFilters.status ? (
                        <button
                            onClick={() => router.push('/admin/inventory')}
                            className="mt-2 text-[14px] text-text-secondary underline hover:text-text-primary"
                        >
                            Clear all filters
                        </button>
                    ) : (
                        <Link
                            href="/admin/inventory/new"
                            className="inline-block mt-3 px-4 py-2 bg-surface-inverse text-text-inverse text-[14px] font-medium rounded-md hover:bg-surface-inverse-hover transition-colors"
                        >
                            Add your first inventory item
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Purchase</TableHead>
                                    <TableHead>Selling</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div>
                                                <div className="text-[14px] font-medium text-text-primary">
                                                    {item.name}
                                                </div>
                                                <div className="text-[12px] text-text-muted">
                                                    {item.skuPrefix} &middot; {item.variantCount} variant{item.variantCount !== 1 ? 's' : ''} &middot; {item.type}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <span className="text-[14px] text-text-secondary">{item.categoryName}</span>
                                                {item.brandName !== '-' && (
                                                    <div className="text-[12px] text-text-muted">{item.brandName}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[14px] text-text-secondary">{item.supplier || '-'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[14px] text-text-primary">
                                                {formatCurrency(item.purchasePrice)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[14px] font-medium text-text-primary">
                                                {formatCurrency(item.sellingPrice)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-[14px] font-medium ${item.totalStock <= item.reorderPoint && item.totalStock > 0 ? 'text-warning-foreground' : item.totalStock === 0 ? 'text-error' : 'text-text-primary'}`}>
                                                {item.totalStock}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[14px] text-text-secondary">{item.warehouseLocation || '-'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusBadge[item.status] ?? 'neutral'}>
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {item.status === 'draft' && (
                                                    <TransferButton itemId={item.id} itemName={item.name} />
                                                )}
                                                {item.status === 'transferred' && (
                                                    <RevertButton itemId={item.id} itemName={item.name} />
                                                )}
                                                <Link
                                                    href={`/admin/inventory/${item.id}/edit`}
                                                    className={`text-[13px] transition-colors ${item.status === 'transferred' ? 'text-text-muted pointer-events-none cursor-default' : 'text-text-secondary hover:text-text-primary'}`}
                                                    aria-disabled={item.status === 'transferred'}
                                                >
                                                    Edit
                                                </Link>
                                                <DeleteButton itemId={item.id} itemName={item.name} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-[14px] text-text-secondary">
                            Showing {((data.page - 1) * 20) + 1}-{Math.min(data.page * 20, data.total)} of {data.total} items
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

function TransferButton({ itemId, itemName }: { itemId: string; itemName: string }) {
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleTransfer() {
        setLoading(true);
        const { transferToProductsAction } = await import('@/actions/inventory.actions');
        const result = await transferToProductsAction(itemId);
        setLoading(false);
        if (!result.success) {
            alert(result.error ?? 'Failed to transfer item');
        }
        setConfirming(false);
    }

    if (confirming) {
        return (
            <span className="inline-flex items-center gap-1 text-[13px]">
                <span className="text-text-muted">Transfer &quot;{itemName.slice(0, 20)}{itemName.length > 20 ? '...' : ''}&quot; to Products?</span>
                <button onClick={handleTransfer} disabled={loading} className="text-success hover:underline disabled:opacity-50">
                    {loading ? '...' : 'Yes'}
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
            className="inline-flex items-center gap-1 text-[13px] text-success hover:text-green-700 transition-colors"
            title="Transfer to Products"
        >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transfer
        </button>
    );
}

function RevertButton({ itemId, itemName }: { itemId: string; itemName: string }) {
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleRevert() {
        setLoading(true);
        const { revertTransferAction } = await import('@/actions/inventory.actions');
        const result = await revertTransferAction(itemId);
        setLoading(false);
        if (!result.success) {
            alert(result.error ?? 'Failed to revert transfer');
        }
        setConfirming(false);
    }

    if (confirming) {
        return (
            <span className="inline-flex items-center gap-1 text-[13px]">
                <span className="text-text-muted">Revert &quot;{itemName.slice(0, 20)}{itemName.length > 20 ? '...' : ''}&quot;?</span>
                <button onClick={handleRevert} disabled={loading} className="text-warning-foreground hover:underline disabled:opacity-50">
                    {loading ? '...' : 'Yes'}
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
            className="inline-flex items-center gap-1 text-[13px] text-warning-foreground hover:text-orange-700 transition-colors"
            title="Revert transfer"
        >
            <Undo2 className="w-3.5 h-3.5" />
            Revert
        </button>
    );
}

function DeleteButton({ itemId, itemName }: { itemId: string; itemName: string }) {
    const [confirming, setConfirming] = useState(false);

    async function handleDelete() {
        const { deleteInventoryItemAction } = await import('@/actions/inventory.actions');
        const result = await deleteInventoryItemAction(itemId);
        if (!result.success) {
            alert(result.error ?? 'Failed to delete item');
        }
        setConfirming(false);
    }

    if (confirming) {
        return (
            <span className="inline-flex items-center gap-1 text-[13px]">
                <span className="text-text-muted">Delete &quot;{itemName.slice(0, 20)}{itemName.length > 20 ? '...' : ''}&quot;?</span>
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
