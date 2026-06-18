'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { AdminOrderListItem, AdminOrderFilters } from '@/types/admin-order';
import type { OrderStatus } from '@/lib/constants/order';
import { ORDER_STATUSES } from '@/lib/constants/order';

type OrderListProps = {
    initialData: {
        orders: AdminOrderListItem[];
        total: number;
        page: number;
        totalPages: number;
    } | null;
    currentFilters: AdminOrderFilters;
};

const statusBadgeVariant: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
    pending: 'warning',
    payment_pending: 'warning',
    paid: 'info',
    processing: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'error',
    refunded: 'error',
};

const statusLabel: Record<string, string> = {
    pending: 'Pending',
    payment_pending: 'Payment Pending',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
};

const PAYMENT_METHODS = ['sslcommerz', 'bkash', 'nagad', 'cash_on_delivery'] as const;
const paymentMethodLabel: Record<string, string> = {
    sslcommerz: 'SSLCommerz',
    bkash: 'bKash',
    nagad: 'Nagad',
    cash_on_delivery: 'COD',
};

export function OrderList({ initialData, currentFilters }: OrderListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(currentFilters.search ?? '');
    const [orders, setOrders] = useState(initialData?.orders ?? []);
    const [total, setTotal] = useState(initialData?.total ?? 0);
    const [page, setPage] = useState(initialData?.page ?? 1);
    const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1);

    useEffect(() => {
        if (initialData) {
            setOrders(initialData.orders);
            setTotal(initialData.total);
            setPage(initialData.page);
            setTotalPages(initialData.totalPages);
        }
    }, [initialData]);

    const subscribeToRealtime = useCallback(() => {
        const supabase = createClient();
        const channel = supabase
            .channel('admin-orders-list')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                () => {
                    router.refresh();
                },
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                () => {
                    router.refresh();
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);

    useEffect(() => {
        return subscribeToRealtime();
    }, [subscribeToRealtime]);

    function updateFilters(updates: Partial<AdminOrderFilters>) {
        const params = new URLSearchParams(searchParams.toString());
        const merged = { ...currentFilters, ...updates };

        if (merged.search) params.set('search', merged.search);
        else params.delete('search');

        if (merged.status) params.set('status', merged.status);
        else params.delete('status');

        if (merged.paymentMethod) params.set('paymentMethod', merged.paymentMethod);
        else params.delete('paymentMethod');

        if (merged.dateFrom) params.set('dateFrom', merged.dateFrom);
        else params.delete('dateFrom');

        if (merged.dateTo) params.set('dateTo', merged.dateTo);
        else params.delete('dateTo');

        if (merged.page && merged.page > 1) params.set('page', String(merged.page));
        else params.delete('page');

        router.push(`/admin/orders?${params.toString()}`);
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        updateFilters({ search: search || undefined, page: 1 });
    }

    function handlePageChange(newPage: number) {
        updateFilters({ page: newPage });
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-[400px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary"
                    />
                </form>

                <select
                    value={currentFilters.status ?? ''}
                    onChange={(e) => updateFilters({ status: (e.target.value || undefined) as OrderStatus | undefined, page: 1 })}
                    className="bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                >
                    <option value="">All Status</option>
                    {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{statusLabel[s]}</option>
                    ))}
                </select>

                <select
                    value={currentFilters.paymentMethod ?? ''}
                    onChange={(e) => updateFilters({ paymentMethod: e.target.value || undefined, page: 1 })}
                    className="bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                >
                    <option value="">All Payment Methods</option>
                    {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>{paymentMethodLabel[m]}</option>
                    ))}
                </select>

                <input
                    type="date"
                    value={currentFilters.dateFrom ?? ''}
                    onChange={(e) => updateFilters({ dateFrom: e.target.value || undefined, page: 1 })}
                    className="bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                    title="From date"
                />

                <input
                    type="date"
                    value={currentFilters.dateTo ?? ''}
                    onChange={(e) => updateFilters({ dateTo: e.target.value || undefined, page: 1 })}
                    className="bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                    title="To date"
                />
            </div>

            {orders.length === 0 ? (
                <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                    <p className="text-[14px] text-text-secondary">No orders found</p>
                    {(currentFilters.search || currentFilters.status || currentFilters.paymentMethod || currentFilters.dateFrom || currentFilters.dateTo) && (
                        <button
                            onClick={() => router.push('/admin/orders')}
                            className="mt-2 text-[14px] text-text-secondary underline hover:text-text-primary"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <span className="text-[14px] font-mono text-text-primary">
                                                #{order.id.slice(0, 8)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="text-[14px] font-medium text-text-primary">
                                                    {order.customerName || 'Guest'}
                                                </div>
                                                <div className="text-[12px] text-text-muted">
                                                    {order.customerEmail || '-'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusBadgeVariant[order.status] ?? 'warning'}>
                                                {statusLabel[order.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="neutral">
                                                {paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[14px] text-text-secondary">{order.itemCount}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[14px] font-medium text-text-primary">
                                                {formatCurrency(order.grandTotal)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[14px] text-text-secondary">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })} {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="text-[13px] text-text-secondary hover:text-text-primary transition-colors"
                                            >
                                                View
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-[14px] text-text-secondary">
                            Showing {((page - 1) * 20) + 1}-{Math.min(page * 20, total)} of {total} orders
                        </div>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
