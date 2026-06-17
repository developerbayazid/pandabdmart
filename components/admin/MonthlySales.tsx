import { MoreHorizontal } from 'lucide-react';

type MonthlySalesProps = {
    monthlyRevenue: number;
};

export function MonthlySales({ monthlyRevenue }: MonthlySalesProps) {
    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-[16px] font-semibold text-text-primary leading-6">
                    Monthly Sales
                </h3>
                <button className="p-1.5 rounded-md hover:bg-surface-secondary transition-colors text-text-muted">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>
            <div className="h-8" />
        </div>
    );
}
