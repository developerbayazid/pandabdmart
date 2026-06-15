import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import type { OrderItemSnapshot } from '@/types/order';

type OrderItemsListProps = {
    items: OrderItemSnapshot[];
    className?: string;
};

export function OrderItemsList({ items, className }: OrderItemsListProps) {
    return (
        <div className={cn('space-y-3', className)}>
            {items.map((item) => {
                const productName =
                    (item.product_snapshot as Record<string, unknown> | null)
                        ?.name ?? 'Product';
                const imageUrl =
                    (item.product_snapshot as Record<string, unknown> | null)
                        ?.image_url ?? null;
                const sku = item.sku_snapshot;

                return (
                    <div
                        key={item.id}
                        className="flex gap-4 p-3 bg-surface-secondary rounded-lg"
                    >
                        <div className="shrink-0 w-16 h-16 rounded-md overflow-hidden bg-surface-tertiary">
                            {imageUrl ? (
                                <img
                                    src={String(imageUrl)}
                                    alt={String(productName)}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                                    No image
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                                {String(productName)}
                            </p>
                            {sku && (
                                <p className="text-xs text-text-muted mt-0.5">
                                    SKU: {sku}
                                </p>
                            )}
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-sm text-text-secondary">
                                    Qty: {item.quantity}
                                </span>
                                <span className="text-sm text-text-muted">
                                    x {formatCurrency(item.unit_price)}
                                </span>
                            </div>
                        </div>
                        <div className="text-sm font-semibold text-text-primary shrink-0">
                            {formatCurrency(item.unit_price * item.quantity)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
