import Link from 'next/link';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { RecentOrder } from '@/repositories/admin.repository';

type RecentOrdersTableProps = {
    orders: RecentOrder[];
};

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[16px] font-semibold text-text-primary leading-6">
                    Recent Orders
                </h3>
                <Link
                    href="/admin/orders"
                    className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1"
                >
                    See all
                    <ArrowUpRight className="w-4 h-4" />
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-[14px] text-text-muted">No orders yet</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left text-[12px] font-medium uppercase tracking-wide text-text-secondary px-3 py-3">
                                    Order
                                </th>
                                <th className="text-left text-[12px] font-medium uppercase tracking-wide text-text-secondary px-3 py-3">
                                    Customer
                                </th>
                                <th className="text-left text-[12px] font-medium uppercase tracking-wide text-text-secondary px-3 py-3">
                                    Date
                                </th>
                                <th className="text-left text-[12px] font-medium uppercase tracking-wide text-text-secondary px-3 py-3">
                                    Status
                                </th>
                                <th className="text-right text-[12px] font-medium uppercase tracking-wide text-text-secondary px-3 py-3">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="border-b border-border last:border-0 hover:bg-surface-secondary transition-colors"
                                >
                                    <td className="px-3 py-3">
                                        <Link
                                            href={`/admin/orders?orderId=${order.id}`}
                                            className="text-[14px] font-medium text-text-primary hover:text-text-secondary transition-colors"
                                        >
                                            #{order.id.slice(0, 8)}
                                        </Link>
                                        <div className="text-[12px] text-text-muted">
                                            {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="text-[14px] text-text-primary">
                                            {order.customer_name || 'Guest'}
                                        </div>
                                        <div className="text-[12px] text-text-muted truncate max-w-[160px]">
                                            {order.customer_email || '—'}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-[14px] text-text-secondary">
                                        {formatDate(order.created_at, { includeYear: true })}
                                    </td>
                                    <td className="px-3 py-3">
                                        <OrderStatusBadge status={order.status as never} />
                                    </td>
                                    <td className="px-3 py-3 text-right text-[14px] font-medium text-text-primary">
                                        {formatCurrency(order.grand_total)}
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
