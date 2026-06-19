'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Ban, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { deactivateCustomerAction, reactivateCustomerAction, updateCustomerRoleAction, getCustomerOrdersAction } from '@/actions/customer.actions';
import type { AdminCustomerDetail, AdminCustomerOrder, AdminCustomerOrdersResult } from '@/types/admin-customer';

type CustomerDetailViewProps = {
    customer: AdminCustomerDetail;
    initialOrders: AdminCustomerOrdersResult | null;
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

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function CustomerDetailView({ customer, initialOrders }: CustomerDetailViewProps) {
    const router = useRouter();
    const [ordersData, setOrdersData] = useState<AdminCustomerOrdersResult>(
        initialOrders ?? { orders: [], total: 0, page: 1, totalPages: 1 },
    );
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleToggleDeactivate() {
        setActionLoading(true);
        setError(null);

        const result = customer.deactivatedAt
            ? await reactivateCustomerAction(customer.id)
            : await deactivateCustomerAction(customer.id);

        if (result.success) {
            router.refresh();
        } else {
            setError(result.error ?? 'Action failed');
        }
        setActionLoading(false);
    }

    async function handlePromoteToManager() {
        setActionLoading(true);
        setError(null);

        const result = await updateCustomerRoleAction(customer.id, 'shop_manager');
        if (result.success) {
            router.refresh();
        } else {
            setError(result.error ?? 'Action failed');
        }
        setActionLoading(false);
    }

    async function handlePageChange(newPage: number) {
        setError(null);
        const result = await getCustomerOrdersAction(customer.id, newPage);
        if (result.success && result.data) {
            setOrdersData(result.data);
        } else {
            setError(result.error ?? 'Failed to load orders');
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href="/admin/customers"
                    className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-surface-secondary transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-[16px] font-semibold text-text-primary">
                        {customer.fullName ?? 'Unknown Customer'}
                    </h1>
                    <p className="text-[14px] text-text-secondary mt-0.5">
                        Customer details and order history
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-error-light border border-error/20 rounded-md px-4 py-3 text-[14px] text-error">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <h2 className="text-[15px] font-semibold text-text-primary mb-4">Profile Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-medium uppercase tracking-wide text-text-muted mb-1">Full Name</label>
                                <p className="text-[14px] text-text-primary">{customer.fullName ?? '-'}</p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium uppercase tracking-wide text-text-muted mb-1">Email</label>
                                <p className="text-[14px] text-text-primary">{customer.email ?? '-'}</p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium uppercase tracking-wide text-text-muted mb-1">Phone</label>
                                <p className="text-[14px] text-text-primary">{customer.phone ?? '-'}</p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium uppercase tracking-wide text-text-muted mb-1">Role</label>
                                <Badge variant="info" className="capitalize">
                                    {customer.role.replace('_', ' ')}
                                </Badge>
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium uppercase tracking-wide text-text-muted mb-1">Joined</label>
                                <p className="text-[14px] text-text-primary">{formatDate(customer.createdAt)}</p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium uppercase tracking-wide text-text-muted mb-1">Status</label>
                                <Badge variant={customer.deactivatedAt ? 'neutral' : 'success'}>
                                    {customer.deactivatedAt ? 'Deactivated' : 'Active'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <h2 className="text-[15px] font-semibold text-text-primary mb-4">Order History</h2>
                        {ordersData.orders.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-[14px] text-text-secondary">No orders yet</p>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ordersData.orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>
                                                    <Link
                                                        href={`/admin/orders/${order.id}`}
                                                        className="text-[14px] font-mono text-text-primary hover:underline"
                                                    >
                                                        {order.id.slice(0, 8)}...
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-text-secondary text-[13px]">
                                                    {formatDate(order.createdAt)}
                                                </TableCell>
                                                <TableCell className="capitalize text-text-secondary">
                                                    {order.paymentMethod.replace(/_/g, ' ')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={statusBadgeVariant[order.status] ?? 'info'}>
                                                        {statusLabel[order.status] ?? order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium tabular-nums">
                                                    ৳{order.grandTotal.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {ordersData.totalPages > 1 && (
                                    <div className="border-t border-border pt-4 mt-4 flex justify-center">
                                        <Pagination
                                            currentPage={ordersData.page}
                                            totalPages={ordersData.totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <h2 className="text-[15px] font-semibold text-text-primary mb-4">Actions</h2>
                        <div className="space-y-3">
                            <Button
                                variant={customer.deactivatedAt ? 'primary' : 'secondary'}
                                className="w-full"
                                onClick={handleToggleDeactivate}
                                disabled={actionLoading}
                            >
                                {customer.deactivatedAt ? (
                                    <><CheckCircle className="w-4 h-4" /> Reactivate Customer</>
                                ) : (
                                    <><Ban className="w-4 h-4" /> Deactivate Customer</>
                                )}
                            </Button>

                            {customer.role === 'customer' && (
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={handlePromoteToManager}
                                    disabled={actionLoading}
                                >
                                    <Shield className="w-4 h-4" /> Promote to Shop Manager
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
