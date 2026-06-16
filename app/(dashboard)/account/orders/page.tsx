import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/get-user';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { formatCurrency } from '@/lib/utils';
import type { OrderStatus } from '@/lib/constants/order';
import { ArrowRight } from 'lucide-react';
import { PageSpinner } from '@/components/ui/PageSpinner';

export default async function OrdersPage() {
    const user = await getUser();
    if (!user) redirect('/signin');

    return (
        <Suspense fallback={<PageSpinner />}>
            <OrdersContent userId={user.id} />
        </Suspense>
    );
}

async function OrdersContent({ userId }: { userId: string }) {
    const supabase = await createClient();
    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, status, payment_method, grand_total, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    return (
        <div>
            <h2 className="font-[family-name:var(--font-serif)] text-[28px] font-normal text-text-primary mb-6">
                My Orders
            </h2>

            {error && (
                <div className="bg-error-light text-error-foreground text-sm p-4 rounded-md mb-6">
                    Failed to load orders. Please try again.
                </div>
            )}

            {orders && orders.length === 0 ? (
                <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                    <p className="text-sm text-text-secondary mb-4">
                        You haven&apos;t placed any orders yet.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 border border-text-primary text-text-primary px-5 py-2 text-[13px] font-medium rounded-md hover:bg-surface-inverse hover:text-text-inverse transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-surface-tertiary">
                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary text-left">
                                    Order ID
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary text-left">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary text-left">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary text-right">
                                    Total
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary text-right">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {orders?.map((order) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-surface-secondary transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm font-mono text-text-primary">
                                        <Link
                                            href={`/track/${order.id}`}
                                            className="hover:text-text-secondary transition-colors"
                                        >
                                            {order.id}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-secondary">
                                        {new Date(order.created_at).toLocaleDateString(
                                            'en-US',
                                            {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            },
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <OrderStatusBadge
                                            status={order.status as OrderStatus}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-text-primary text-right">
                                        {formatCurrency(order.grand_total)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/track/${order.id}`}
                                            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
                                        >
                                            View
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
