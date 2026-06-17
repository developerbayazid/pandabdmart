'use client';

import { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Calendar } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { SalesDataPoint } from '@/repositories/admin.repository';

type SalesChartProps = {
    data: SalesDataPoint[];
};

type Period = 'Monthly' | 'Quarterly' | 'Annually';

export function SalesChart({ data }: SalesChartProps) {
    const [period, setPeriod] = useState<Period>('Monthly');

    // Compute date range label
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const rangeLabel = `${formatDate(start.toISOString())} to ${formatDate(end.toISOString())}`;

    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-[16px] font-semibold text-text-primary leading-6">
                        Statistics
                    </h3>
                    <p className="text-[12px] text-text-secondary mt-0.5">
                        Target you&apos;ve set for each month
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="inline-flex items-center bg-surface-secondary rounded-lg border border-border p-0.5">
                        {(['Monthly', 'Quarterly', 'Annually'] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`text-[13px] font-medium px-3 py-1.5 rounded-md transition-colors ${
                                    period === p
                                        ? 'bg-surface text-text-primary shadow-sm'
                                        : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <div className="inline-flex items-center gap-2 text-[13px] text-text-secondary bg-surface-secondary border border-border rounded-lg px-3 py-1.5">
                        <Calendar className="w-4 h-4" />
                        {rangeLabel}
                    </div>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.06} />
                                <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => formatDate(value as string)}
                            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                            axisLine={{ stroke: 'var(--color-border)' }}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={(v) => '৳' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)}
                            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                            axisLine={false}
                            tickLine={false}
                            width={50}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (!active || !payload || !payload.length) return null;
                                return (
                                    <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-lg">
                                        <div className="text-[12px] text-text-secondary mb-1">
                                            {formatDate(String(label ?? ''))}
                                        </div>
                                        <div className="text-[14px] font-medium text-text-primary">
                                            {formatCurrency(payload[0].value as number)}
                                        </div>
                                        <div className="text-[12px] text-text-secondary">
                                            {payload[0].payload.orders} orders
                                        </div>
                                    </div>
                                );
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#0a0a0a"
                            strokeWidth={3}
                            fill="url(#salesGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
