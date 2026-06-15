import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/constants/order';
import { Check, Clock, Package, Truck, XCircle } from 'lucide-react';

type OrderTimelineProps = {
    status: OrderStatus;
    paymentMethod: string;
    className?: string;
};

type TimelineStep = {
    key: string;
    label: string;
    icon: typeof Check;
};

const steps: TimelineStep[] = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'payment_pending', label: 'Payment Pending', icon: Clock },
    { key: 'paid', label: 'Payment Confirmed', icon: Check },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Check },
];

const stepOrder: Record<string, number> = {
    pending: 0,
    payment_pending: 1,
    paid: 2,
    processing: 3,
    shipped: 4,
    delivered: 5,
};

const isActiveStep = (stepKey: string, currentStatus: OrderStatus): boolean => {
    if (currentStatus === 'cancelled' || currentStatus === 'refunded') {
        const cancelledAt =
            currentStatus === 'cancelled'
                ? stepOrder.pending
                : stepOrder.delivered;
        return stepOrder[stepKey] <= cancelledAt;
    }

    if (currentStatus === 'payment_pending') {
        return stepOrder[stepKey] <= 1;
    }

    return stepOrder[stepKey] <= (stepOrder[currentStatus] ?? 0);
};

const isCurrentStep = (stepKey: string, currentStatus: OrderStatus): boolean => {
    if (currentStatus === 'cancelled' || currentStatus === 'refunded') {
        return stepKey === currentStatus;
    }
    return stepKey === currentStatus;
};

export function OrderTimeline({ status, paymentMethod, className }: OrderTimelineProps) {
    const filteredSteps =
        paymentMethod === 'cash_on_delivery'
            ? steps.filter((s) => s.key !== 'payment_pending')
            : steps;

    return (
        <div className={cn('space-y-0', className)}>
            {status === 'cancelled' && (
                <div className="flex items-start gap-3 pb-4">
                    <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-error-light">
                            <XCircle className="w-3.5 h-3.5 text-error-foreground" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-text-primary">
                            Order Cancelled
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                            This order has been cancelled
                        </p>
                    </div>
                </div>
            )}

            {filteredSteps.map((step, index) => {
                const active = isActiveStep(step.key, status);
                const current = isCurrentStep(step.key, status);
                const isLast = index === filteredSteps.length - 1;
                const Icon = step.icon;

                return (
                    <div key={step.key} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                                    active && !current && 'bg-success-light',
                                    current && 'bg-surface-inverse',
                                    !active && 'bg-surface-tertiary',
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'w-3.5 h-3.5',
                                        active && !current && 'text-success-foreground',
                                        current && 'text-text-inverse',
                                        !active && 'text-text-muted',
                                    )}
                                />
                            </div>
                            {!isLast && (
                                <div
                                    className={cn(
                                        'w-px h-8 my-0.5',
                                        active && !current
                                            ? 'bg-success'
                                            : 'bg-border',
                                    )}
                                />
                            )}
                        </div>
                        <div className="pb-6">
                            <p
                                className={cn(
                                    'text-sm',
                                    active
                                        ? 'font-medium text-text-primary'
                                        : 'text-text-muted',
                                )}
                            >
                                {step.label}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
