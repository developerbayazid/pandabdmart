'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getTodayStart } from '@/lib/utils';
import { StatCard } from './StatCard';
import { ProfitOverview } from './ProfitOverview';
import { SalesChart } from './SalesChart';
import { RecentOrdersTable } from './RecentOrdersTable';
import { LowStockAlert } from './LowStockAlert';
import { TopProducts } from './TopProducts';
import { TopCustomers } from './TopCustomers';
import type { DashboardData } from '@/services/admin.service';

type AdminDashboardProps = {
    initialData: DashboardData;
};

export function AdminDashboard({ initialData }: AdminDashboardProps) {
    const [data, setData] = useState(initialData);

    useEffect(() => {
        const supabase = createClient();
        const todayStart = getTodayStart();

        const channel = supabase
            .channel('admin-dashboard-orders')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    const status = payload.new.status as string;
                    const createdAt = payload.new.created_at as string;
                    const isToday = createdAt >= todayStart;
                    const isPending = status === 'pending';
                    const isPaymentPending = status === 'payment_pending';

                    setData((prev) => {
                        const stats = { ...prev.stats };
                        stats.totalOrders += 1;
                        if (isPending) stats.pendingOrders += 1;
                        if (isPaymentPending) stats.paymentPendingOrders += 1;
                        if (isToday) {
                            stats.todayOrders += 1;
                            stats.todayRevenue += Number(payload.new.grand_total ?? 0);
                        }
                        return { ...prev, stats };
                    });
                },
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                (payload) => {
                    const newStatus = payload.new.status as string;
                    const oldStatus = payload.old.status as string;
                    const createdAt = payload.new.created_at as string;
                    const isToday = createdAt >= todayStart;
                    let changed = false;

                    setData((prev) => {
                        const stats = { ...prev.stats };

                        if (oldStatus === 'pending' && newStatus !== 'pending') {
                            stats.pendingOrders = Math.max(0, stats.pendingOrders - 1);
                            changed = true;
                        }
                        if (oldStatus === 'payment_pending' && newStatus !== 'payment_pending') {
                            stats.paymentPendingOrders = Math.max(
                                0,
                                stats.paymentPendingOrders - 1,
                            );
                            changed = true;
                        }
                        if (newStatus === 'paid' && oldStatus !== 'paid' && isToday) {
                            stats.todayRevenue += Number(payload.new.grand_total ?? 0);
                            changed = true;
                        }

                        return changed ? { ...prev, stats } : prev;
                    });
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const pendingTotal = data.stats.pendingOrders + data.stats.paymentPendingOrders;

    return (
        <div className="space-y-6">
            {/* Row 1: 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Revenue"
                    value={'৳' + data.stats.totalRevenue.toLocaleString()}
                    icon="revenue"
                />
                <StatCard
                    label="Total Orders"
                    value={data.stats.totalOrders}
                    icon="orders"
                />
                <StatCard
                    label="Total Customers"
                    value={data.stats.totalCustomers}
                    icon="users"
                />
                <StatCard
                    label="Pending Orders"
                    value={pendingTotal}
                    icon="pending"
                />
            </div>

            {/* Row 2: Profit Analytics */}
            <ProfitOverview stats={data.profitStats} />

            {/* Row 3: Chart + Side panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <SalesChart data={data.salesData} />
                </div>
                <LowStockAlert items={data.lowStockAlerts} />
            </div>

            {/* Row 4: Recent Orders + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <RecentOrdersTable orders={data.recentOrders} />
                <TopProducts products={data.topProducts} />
            </div>

            {/* Row 5: Top Customers */}
            <TopCustomers customers={data.topCustomers} />
        </div>
    );
}
