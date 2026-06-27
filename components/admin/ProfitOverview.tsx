import { DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { ProfitStats } from '@/repositories/admin.repository';

type ProfitOverviewProps = {
    stats: ProfitStats;
};

export function ProfitOverview({ stats }: ProfitOverviewProps) {
    const todayProfitIsPositive = stats.todayProfit >= 0;

    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-5 h-5 text-text-secondary" />
                <h3 className="text-[16px] font-semibold text-text-primary leading-6">
                    Profit Analytics
                </h3>
                <span className="text-[11px] text-text-muted ml-auto">
                    Inventory-sourced products only
                </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-secondary border border-border rounded-xl p-4">
                    <p className="text-[12px] text-text-secondary mb-1">Total Revenue</p>
                    <p className="text-[20px] font-semibold text-text-primary">
                        {formatCurrency(stats.totalRevenue)}
                    </p>
                    <p className="text-[11px] text-text-muted mt-1">
                        {stats.orderCount} orders
                    </p>
                </div>
                <div className="bg-surface-secondary border border-border rounded-xl p-4">
                    <p className="text-[12px] text-text-secondary mb-1">Total Cost</p>
                    <p className="text-[20px] font-semibold text-text-primary">
                        {formatCurrency(stats.totalCost)}
                    </p>
                </div>
                <div className="bg-surface-secondary border border-border rounded-xl p-4">
                    <p className="text-[12px] text-text-secondary mb-1">Total Profit</p>
                    <p className="text-[20px] font-semibold text-text-primary">
                        {formatCurrency(stats.totalProfit)}
                    </p>
                </div>
                <div className="bg-surface-secondary border border-border rounded-xl p-4">
                    <p className="text-[12px] text-text-secondary mb-1">Profit Margin</p>
                    <div className="flex items-center gap-2">
                        <p className="text-[20px] font-semibold text-text-primary">
                            {stats.marginPercent}%
                        </p>
                        <Percent className="w-4 h-4 text-text-secondary" />
                    </div>
                </div>
            </div>

            {stats.todayRevenue > 0 && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] text-text-secondary">Today:</span>
                        <span className="text-[13px] font-medium text-text-primary">
                            {formatCurrency(stats.todayRevenue)} revenue
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] text-text-secondary">Cost:</span>
                        <span className="text-[13px] font-medium text-text-primary">
                            {formatCurrency(stats.todayCost)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-text-secondary">Profit:</span>
                        <span className={`text-[13px] font-medium ${todayProfitIsPositive ? 'text-success-foreground' : 'text-error'}`}>
                            {formatCurrency(stats.todayProfit)}
                        </span>
                        {todayProfitIsPositive ? (
                            <TrendingUp className="w-3.5 h-3.5 text-success" />
                        ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-error" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
