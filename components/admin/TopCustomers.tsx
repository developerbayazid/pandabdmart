import { Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { TopCustomer } from '@/repositories/admin.repository';

type TopCustomersProps = {
    customers: TopCustomer[];
};

export function TopCustomers({ customers }: TopCustomersProps) {
    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-text-secondary" />
                <h3 className="text-[16px] font-semibold text-text-primary leading-6">
                    Top Customers
                </h3>
            </div>

            {customers.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-[14px] text-text-muted">No customer data yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {customers.map((customer, index) => (
                        <div
                            key={customer.user_id}
                            className="flex items-center gap-3 p-3 bg-surface-secondary rounded-xl border border-border"
                        >
                            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-[13px] font-semibold text-text-secondary shrink-0">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-medium text-text-primary truncate">
                                    {customer.name}
                                </p>
                                <p className="text-[12px] text-text-muted">
                                    {customer.order_count} order{customer.order_count !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="text-[14px] font-semibold text-text-primary shrink-0">
                                {formatCurrency(customer.total_spent)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
