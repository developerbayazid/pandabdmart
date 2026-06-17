import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type MonthlyTargetProps = {
    todayRevenue: number;
    monthlyRevenue: number;
};

export function MonthlyTarget({ todayRevenue, monthlyRevenue }: MonthlyTargetProps) {
    // Compute a mock target (30x today as a simple heuristic)
    const target = Math.max(monthlyRevenue * 1.2, todayRevenue * 30);
    const progress = target > 0 ? Math.round((monthlyRevenue / target) * 100) : 0;
    const isOnTrack = progress >= 100;

    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-[16px] font-semibold text-text-primary leading-6">
                    Monthly Target
                </h3>
                <span className="text-[12px] font-medium bg-success-light text-success-foreground px-2 py-0.5 rounded-full">
                    +{Math.max(0, progress - 100)}%
                </span>
            </div>
            <p className="text-[12px] text-text-secondary mb-4">
                Target you&apos;ve set for each month
            </p>

            <div className="text-center py-2 mb-4">
                <p className="text-[14px] text-text-secondary leading-relaxed">
                    You earn {formatCurrency(todayRevenue)} today, it&apos;s{' '}
                    {isOnTrack ? 'higher' : 'lower'} than last month.
                </p>
                <p className="text-[14px] text-text-secondary">Keep up your good work!</p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                <div className="text-center">
                    <div className="text-[12px] text-text-secondary mb-1">Target</div>
                    <div className="text-[14px] font-semibold text-text-primary inline-flex items-center gap-1">
                        {formatCurrency(target)}
                        <TrendingDown className="w-3 h-3 text-error" />
                    </div>
                </div>
                <div className="text-center border-l border-border">
                    <div className="text-[12px] text-text-secondary mb-1">Revenue</div>
                    <div className="text-[14px] font-semibold text-text-primary inline-flex items-center gap-1">
                        {formatCurrency(monthlyRevenue)}
                        <TrendingUp className="w-3 h-3 text-success" />
                    </div>
                </div>
                <div className="text-center border-l border-border">
                    <div className="text-[12px] text-text-secondary mb-1">Today</div>
                    <div className="text-[14px] font-semibold text-text-primary inline-flex items-center gap-1">
                        {formatCurrency(todayRevenue)}
                        <TrendingUp className="w-3 h-3 text-success" />
                    </div>
                </div>
            </div>
        </div>
    );
}
