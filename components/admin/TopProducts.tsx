import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { TopProduct } from '@/repositories/admin.repository';

type TopProductsProps = {
    products: TopProduct[];
};

export function TopProducts({ products }: TopProductsProps) {
    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-text-secondary" />
                <h3 className="text-[16px] font-semibold text-text-primary leading-6">
                    Top Products
                </h3>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-[14px] text-text-muted">No sales data yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {products.map((product, index) => (
                        <div
                            key={product.product_id}
                            className="flex items-center gap-3 p-3 bg-surface-secondary rounded-xl border border-border"
                        >
                            <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-[13px] font-semibold text-text-secondary shrink-0">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link
                                    href={`/admin/products`}
                                    className="text-[14px] font-medium text-text-primary hover:text-text-secondary transition-colors truncate block"
                                >
                                    {product.product_name}
                                </Link>
                                <div className="text-[12px] text-text-muted">
                                    {product.total_sold} sold
                                </div>
                            </div>
                            <div className="text-[14px] font-semibold text-text-primary shrink-0">
                                {formatCurrency(product.total_revenue)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
