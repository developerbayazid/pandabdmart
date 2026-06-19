'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Eye, Ban, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { deactivateCustomerAction, reactivateCustomerAction } from '@/actions/customer.actions';
import type { AdminCustomerListItem, AdminCustomerListResult } from '@/types/admin-customer';

type CustomerListProps = {
    initialData: AdminCustomerListResult | null;
    currentSearch: string;
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function CustomerList({ initialData, currentSearch }: CustomerListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(currentSearch);
    const [deactivating, setDeactivating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const data = initialData ?? { customers: [], total: 0, page: 1, totalPages: 1 };

    function updateSearch(value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        params.delete('page');
        router.push(`/admin/customers?${params.toString()}`);
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        updateSearch(search);
    }

    function handlePageChange(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        if (search) params.set('search', search);
        params.set('page', page.toString());
        router.push(`/admin/customers?${params.toString()}`);
    }

    async function handleToggleDeactivate(customer: AdminCustomerListItem) {
        setDeactivating(customer.id);
        setError(null);

        const result = customer.deactivatedAt
            ? await reactivateCustomerAction(customer.id)
            : await deactivateCustomerAction(customer.id);

        if (result.success) {
            router.refresh();
        } else {
            setError(result.error ?? 'Action failed');
        }
        setDeactivating(null);
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
                        placeholder="Search by name or phone..."
                        className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary"
                    />
                </form>
            </div>

            {error && (
                <div className="bg-error-light border border-error/20 rounded-md px-4 py-3 text-[14px] text-error">
                    {error}
                </div>
            )}

            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                {data.customers.length === 0 && !currentSearch ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-text-muted" />
                        </div>
                        <p className="text-[14px] text-text-secondary mb-4">No customers yet</p>
                    </div>
                ) : data.customers.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-[14px] text-text-secondary">
                            No customers match your search
                        </p>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Orders</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-28">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center text-[13px] font-medium text-text-secondary shrink-0">
                                                    {customer.fullName
                                                        ? customer.fullName.charAt(0).toUpperCase()
                                                        : '?'}
                                                </div>
                                                <span className="font-medium text-text-primary">
                                                    {customer.fullName ?? 'Unknown'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-text-secondary">
                                            {customer.phone ?? '-'}
                                        </TableCell>
                                        <TableCell className="text-text-secondary">
                                            {customer.orderCount}
                                        </TableCell>
                                        <TableCell className="text-text-secondary">
                                            {formatDate(customer.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={customer.deactivatedAt ? 'neutral' : 'success'}>
                                                {customer.deactivatedAt ? 'Deactivated' : 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Link
                                                    href={`/admin/customers/${customer.id}`}
                                                    className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-surface-tertiary transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleDeactivate(customer)}
                                                    disabled={deactivating === customer.id}
                                                    className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
                                                        customer.deactivatedAt
                                                            ? 'text-text-muted hover:text-success hover:bg-success/10'
                                                            : 'text-text-muted hover:text-error hover:bg-error-light'
                                                    }`}
                                                    title={customer.deactivatedAt ? 'Reactivate' : 'Deactivate'}
                                                >
                                                    {deactivating === customer.id ? (
                                                        <span className="text-[11px]">...</span>
                                                    ) : customer.deactivatedAt ? (
                                                        <CheckCircle className="w-4 h-4" />
                                                    ) : (
                                                        <Ban className="w-4 h-4" />
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
