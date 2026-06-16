'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { OrderTimeline } from '@/components/order/OrderTimeline';
import { OrderItemsList } from '@/components/order/OrderItemsList';
import { ShippingAddressDisplay } from '@/components/order/ShippingAddressDisplay';
import { CancelOrderButton } from '@/components/order/CancelOrderButton';
import { InvoiceDownloadButton } from '@/components/order/InvoiceDownloadButton';
import { GuestOrderLookup } from '@/components/order/GuestOrderLookup';
import { getOrderAction } from '@/actions/order.actions';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types/order';
import type { OrderStatus } from '@/lib/constants/order';
import { Package, MapPin, CreditCard, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

interface OrderTrackPageProps {
    initialOrder?: Order | null;
    initialError?: string | null;
    orderIdOverride?: string;
}

export function OrderTrackPage({ initialOrder, initialError, orderIdOverride }: OrderTrackPageProps = {}) {
    const params = useParams();
    const router = useRouter();
    const orderId = orderIdOverride ?? (params.orderId as string);

    const hasInitialData = initialOrder !== undefined || initialError !== undefined;

    const [order, setOrder] = useState<Order | null>(initialOrder ?? null);
    const [loading, setLoading] = useState(!hasInitialData);
    const [error, setError] = useState<string | null>(initialError ?? null);
    const [needsLookup, setNeedsLookup] = useState(false);

    useEffect(() => {
        if (hasInitialData) return;

        let cancelled = false;

        const fetchOrder = async () => {
            const result = await getOrderAction(orderId);

            if (cancelled) return;

            if (result.success && result.order) {
                setOrder(result.order);
            } else {
                const errorMsg = result.error ?? 'Order not found';
                if (
                    errorMsg.includes('not found') ||
                    errorMsg.includes('verification failed')
                ) {
                    setNeedsLookup(true);
                } else {
                    setError(errorMsg);
                }
            }
            setLoading(false);
        };

        fetchOrder();

        return () => {
            cancelled = true;
        };
    }, [orderId, hasInitialData]);

    useEffect(() => {
        if (!order) return;

        const supabase = createClient();
        const channel = supabase
            .channel(`order-${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${orderId}`,
                },
                (payload) => {
                    const newStatus = payload.new.status as OrderStatus;
                    setOrder((prev) =>
                        prev ? { ...prev, status: newStatus } : prev,
                    );
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId, order]);

    const handleGuestOrderFound = (foundOrder: Order) => {
        setOrder(foundOrder);
        setNeedsLookup(false);
        setError(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
            </div>
        );
    }

    if (needsLookup) {
        return (
            <div className="max-w-[800px] mx-auto px-4 py-12">
                <GuestOrderLookup onOrderFound={handleGuestOrderFound} />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-[800px] mx-auto px-4 py-12">
                <div className="bg-surface border border-border rounded-2xl p-8 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)] text-center">
                    <div className="w-16 h-16 rounded-full bg-error-light flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-error" />
                    </div>
                    <h2 className="text-base font-semibold text-text-primary mb-2">
                        {error ?? 'Order not found'}
                    </h2>
                    <p className="text-sm text-text-secondary mb-6">
                        Please check your Order ID and try again, or contact
                        support for assistance.
                    </p>
                    <button
                        onClick={() => router.push('/track')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-text-primary underline underline-offset-4 hover:text-text-secondary"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Try another order
                    </button>
                </div>
            </div>
        );
    }

    const shipping = order.shipping_addresses[0];
    const payment = order.payments[0];
    const canCancel =
        order.status === 'pending' || order.status === 'payment_pending';

    const paymentMethodLabel =
        order.payment_method === 'sslcommerz'
            ? 'SSLCommerz'
            : order.payment_method === 'bkash'
              ? 'bKash'
              : order.payment_method === 'nagad'
                ? 'Nagad'
                : 'Cash on Delivery';

    return (
        <div className="max-w-[800px] mx-auto px-4 py-8">
            <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Store
            </button>

            <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)] mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div>
                        <p className="text-xs text-text-muted mb-1">
                            Order ID
                        </p>
                        <p className="text-sm font-mono font-medium text-text-primary">
                            {order.id}
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                            {formatDate(order.created_at)}
                        </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                </div>

                <div className="flex flex-wrap gap-4">
                    <CancelOrderButton
                        orderId={order.id}
                        canCancel={canCancel}
                    />
                    <InvoiceDownloadButton orderId={order.id} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-4 h-4 text-text-secondary" />
                            <h3 className="text-base font-semibold text-text-primary leading-6">
                                Order Timeline
                            </h3>
                        </div>
                        <OrderTimeline
                            status={order.status}
                            paymentMethod={order.payment_method}
                        />
                    </div>

                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-4 h-4 text-text-secondary" />
                            <h3 className="text-base font-semibold text-text-primary leading-6">
                                Order Items
                            </h3>
                        </div>
                        <OrderItemsList items={order.order_items} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <h3 className="text-base font-semibold text-text-primary leading-6 mb-4">
                            Order Summary
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">
                                    Subtotal
                                </span>
                                <span className="font-medium text-text-primary">
                                    {formatCurrency(order.subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">
                                    Shipping
                                </span>
                                <span className="font-medium text-text-primary">
                                    {formatCurrency(order.shipping_cost)}
                                </span>
                            </div>
                            {order.discount_total > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">
                                        Discount
                                    </span>
                                    <span className="font-medium text-success-foreground">
                                        -{formatCurrency(order.discount_total)}
                                    </span>
                                </div>
                            )}
                            <div className="pt-3 border-t border-border flex justify-between">
                                <span className="text-sm font-semibold text-text-primary">
                                    Grand Total
                                </span>
                                <span className="text-lg font-semibold text-text-primary">
                                    {formatCurrency(order.grand_total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {shipping && (
                        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-4 h-4 text-text-secondary" />
                                <h3 className="text-base font-semibold text-text-primary leading-6">
                                    Shipping Address
                                </h3>
                            </div>
                            <ShippingAddressDisplay shipping={shipping} />
                        </div>
                    )}

                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-4 h-4 text-text-secondary" />
                            <h3 className="text-base font-semibold text-text-primary leading-6">
                                Payment Info
                            </h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">
                                    Method
                                </span>
                                <span className="font-medium text-text-primary">
                                    {paymentMethodLabel}
                                </span>
                            </div>
                            {payment && (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">
                                            Status
                                        </span>
                                        <span className="font-medium text-text-primary capitalize">
                                            {payment.status}
                                        </span>
                                    </div>
                                    {payment.txn_id && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">
                                                TxnID
                                            </span>
                                            <span className="font-mono text-xs text-text-primary">
                                                {payment.txn_id}
                                            </span>
                                        </div>
                                    )}
                                    {payment.payment_number && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">
                                                Payment Number
                                            </span>
                                            <span className="font-mono text-xs text-text-primary">
                                                {payment.payment_number}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
