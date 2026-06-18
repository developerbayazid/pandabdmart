'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { approvePaymentAction, rejectPaymentAction } from '@/actions/payment.actions';
import type { AdminPaymentRecord } from '@/types/admin-payment';

type PaymentQueueProps = {
    initialPayments: AdminPaymentRecord[];
};

type Tab = 'all' | 'pending' | 'verified' | 'failed';

const TABS: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'verified', label: 'Verified' },
    { key: 'failed', label: 'Failed' },
];

const paymentMethodLabel: Record<string, string> = {
    bkash: 'bKash',
    nagad: 'Nagad',
};

const statusBadgeVariant: Record<string, 'warning' | 'success' | 'error' | 'neutral'> = {
    pending: 'warning',
    verified: 'success',
    failed: 'error',
};

const statusLabel: Record<string, string> = {
    pending: 'Pending',
    verified: 'Verified',
    failed: 'Failed',
};

export function PaymentQueue({ initialPayments }: PaymentQueueProps) {
    const router = useRouter();
    const [payments, setPayments] = useState(initialPayments);
    const [activeTab, setActiveTab] = useState<Tab>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setPayments(initialPayments);
    }, [initialPayments]);

    const subscribeToRealtime = useCallback(() => {
        const supabase = createClient();
        const channel = supabase
            .channel('admin-payments-queue')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'payments',
                },
                () => {
                    router.refresh();
                },
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'payments',
                },
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

    const filteredPayments = useMemo(
        () => (activeTab === 'all' ? payments : payments.filter((p) => p.status === activeTab)),
        [payments, activeTab],
    );

    async function handleApprove(orderId: string) {
        if (processingId) return;
        setProcessingId(orderId);
        setError(null);

        const result = await approvePaymentAction(orderId);

        if (!result.success) {
            setError(result.error ?? 'Approval failed');
        }

        setProcessingId(null);
    }

    async function handleReject(orderId: string) {
        if (processingId) return;
        setProcessingId(orderId);
        setError(null);

        const result = await rejectPaymentAction(orderId);

        if (!result.success) {
            setError(result.error ?? 'Rejection failed');
        }

        setProcessingId(null);
    }

    const isEmpty = filteredPayments.length === 0;

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-error-light border border-error rounded-md p-3 text-[14px] text-error">
                    {error}
                </div>
            )}

            {/* Tab bar */}
            <div className="flex gap-1 border-b border-border">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 text-[14px] font-medium border-b-2 transition-colors ${
                            activeTab === tab.key
                                ? 'border-text-primary text-text-primary'
                                : 'border-transparent text-text-muted hover:text-text-secondary'
                        }`}
                    >
                        {tab.label}
                        {tab.key !== 'all' && (
                            <span className="ml-1.5 text-[12px] text-text-muted">
                                ({payments.filter((p) => p.status === tab.key).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {isEmpty ? (
                <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-3">
                        <span className="text-text-muted text-xl">
                            {activeTab === 'all' ? '📋' : activeTab === 'pending' ? '⏳' : activeTab === 'verified' ? '✓' : '✗'}
                        </span>
                    </div>
                    <h3 className="text-[16px] font-semibold text-text-primary mb-1">
                        {activeTab === 'all'
                            ? 'No MFS payments yet'
                            : `No ${statusLabel[activeTab].toLowerCase()} payments`}
                    </h3>
                    <p className="text-[14px] text-text-secondary">
                        {activeTab === 'pending'
                            ? 'All bKash/Nagad payments have been processed.'
                            : 'No payments in this status.'}
                    </p>
                    <Link
                        href="/admin/orders"
                        className="inline-block mt-3 text-[14px] text-text-secondary underline hover:text-text-primary"
                    >
                        View all orders
                    </Link>
                </div>
            ) : (
                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>TxnID / Ref</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>{activeTab === 'pending' ? 'Actions' : 'Verifier'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.map((payment) => (
                                <TableRow key={payment.paymentId}>
                                    <TableCell>
                                        <Link
                                            href={`/admin/orders/${payment.orderId}`}
                                            className="text-[14px] font-mono text-text-primary hover:underline"
                                        >
                                            #{payment.orderId.slice(0, 8)}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="text-[14px] font-medium text-text-primary">
                                                {payment.customerName || 'Guest'}
                                            </div>
                                            <div className="text-[12px] text-text-muted">
                                                {payment.customerEmail || '-'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">
                                            {paymentMethodLabel[payment.paymentMethod] ?? payment.paymentMethod}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-[14px] font-medium text-text-primary">
                                            {formatCurrency(payment.amount)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-0.5">
                                            {payment.txnId && (
                                                <span className="text-[12px] font-mono text-text-secondary block">
                                                    TxnID: {payment.txnId}
                                                </span>
                                            )}
                                            {payment.paymentNumber && (
                                                <span className="text-[12px] font-mono text-text-muted block">
                                                    #{payment.paymentNumber}
                                                </span>
                                            )}
                                            {payment.gatewayRef && (
                                                <span className="text-[12px] font-mono text-text-muted block">
                                                    Ref: {payment.gatewayRef}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusBadgeVariant[payment.status] ?? 'neutral'}>
                                            {statusLabel[payment.status] ?? payment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-[14px] text-text-secondary">
                                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {payment.status === 'pending' ? (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() => handleApprove(payment.orderId)}
                                                    disabled={processingId === payment.orderId}
                                                    variant="primary"
                                                    size="sm"
                                                >
                                                    {processingId === payment.orderId ? '...' : 'Approve'}
                                                </Button>
                                                <Button
                                                    onClick={() => handleReject(payment.orderId)}
                                                    disabled={processingId === payment.orderId}
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    {processingId === payment.orderId ? '...' : 'Reject'}
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-[13px] text-text-secondary">
                                                {payment.verifiedByName ? (
                                                    <>
                                                        <span className="font-medium text-text-primary">
                                                            {payment.verifiedByName}
                                                        </span>
                                                        {payment.verifiedAt && (
                                                            <span className="block text-[12px] text-text-muted">
                                                                {new Date(payment.verifiedAt).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-text-muted">-</span>
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {filteredPayments.length > 0 && (
                <div className="text-[14px] text-text-secondary">
                    {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
                    {activeTab !== 'all' ? ` (${activeTab})` : ''}
                </div>
            )}
        </div>
    );
}
