import { TrendingUp, TrendingDown, Users, Package, DollarSign, AlertTriangle } from 'lucide-react';

type StatCardProps = {
    label: string;
    value: string | number;
    trend?: number;
    icon: 'users' | 'orders' | 'revenue' | 'pending';
};

const iconMap = {
    users: Users,
    orders: Package,
    revenue: DollarSign,
    pending: AlertTriangle,
};

export function StatCard({ label, value, trend, icon }: StatCardProps) {
    const Icon = iconMap[icon];
    const isPositive = trend !== undefined && trend >= 0;

    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-surface-secondary border border-border flex items-center justify-center">
                    <Icon className="w-5 h-5 text-text-secondary" />
                </div>
                {trend !== undefined && (
                    <div
                        className={`inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full ${
                            isPositive
                                ? 'bg-success-light text-success-foreground'
                                : 'bg-error-light text-error-foreground'
                        }`}
                    >
                        {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                        ) : (
                            <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="mt-4">
                <div className="text-[14px] text-text-secondary font-medium mb-1">{label}</div>
                <div className="text-[30px] font-semibold text-text-primary leading-[36px]">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
            </div>
        </div>
    );
}
