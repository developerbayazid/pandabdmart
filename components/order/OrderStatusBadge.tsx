import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/lib/constants/order';

type OrderStatusBadgeProps = {
    status: OrderStatus;
    className?: string;
};

const statusConfig: Record<
    OrderStatus,
    { label: string; variant: 'success' | 'warning' | 'error' | 'info' }
> = {
    pending: { label: 'Pending', variant: 'warning' },
    payment_pending: { label: 'Payment Pending', variant: 'warning' },
    paid: { label: 'Paid', variant: 'info' },
    processing: { label: 'Processing', variant: 'info' },
    shipped: { label: 'Shipped', variant: 'info' },
    delivered: { label: 'Delivered', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'error' },
    refunded: { label: 'Refunded', variant: 'error' },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} className={cn(className)}>
            {config.label}
        </Badge>
    );
}
