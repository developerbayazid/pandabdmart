import { cn } from '@/lib/utils';
import type { OrderShipping } from '@/types/order';

type ShippingAddressDisplayProps = {
    shipping: OrderShipping;
    className?: string;
};

export function ShippingAddressDisplay({
    shipping,
    className,
}: ShippingAddressDisplayProps) {
    return (
        <div className={cn('space-y-1', className)}>
            <p className="text-sm font-medium text-text-primary">
                {shipping.name}
            </p>
            <p className="text-sm text-text-secondary">{shipping.phone}</p>
            <p className="text-sm text-text-secondary">{shipping.address}</p>
            <p className="text-sm text-text-secondary">
                {shipping.city}, {shipping.district} {shipping.postal_code}
            </p>
        </div>
    );
}
