import { AlertTriangle, Package } from 'lucide-react';
import Link from 'next/link';
import type { LowStockItem } from '@/repositories/admin.repository';

type LowStockAlertProps = {
    items: LowStockItem[];
};

export function LowStockAlert({ items }: LowStockAlertProps) {
    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="text-[16px] font-semibold text-text-primary leading-6">
                    Low Stock Alerts
                </h3>
                <span className="ml-auto text-[12px] font-medium bg-warning-light text-warning-foreground px-2 py-0.5 rounded-full">
                    {items.length}
                </span>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-3">
                        <Package className="w-8 h-8 text-text-muted" />
                    </div>
                    <p className="text-[14px] text-text-secondary">All products are well stocked</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.slice(0, 6).map((item) => (
                        <div
                            key={item.variant_id}
                            className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl border border-border"
                        >
                            <div className="min-w-0">
                                <Link
                                    href={`/admin/products`}
                                    className="text-[14px] font-medium text-text-primary hover:text-text-secondary transition-colors truncate block"
                                >
                                    {item.product_name}
                                </Link>
                                <div className="text-[12px] text-text-muted">{item.sku}</div>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                                <div className="text-[14px] font-semibold text-warning">
                                    {item.stock} left
                                </div>
                                {item.reserved_stock > 0 && (
                                    <div className="text-[12px] text-text-muted">
                                        {item.reserved_stock} reserved
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {items.length > 6 && (
                        <div className="text-center pt-2">
                            <Link
                                href="/admin/products"
                                className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
                            >
                                + {items.length - 6} more items
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
