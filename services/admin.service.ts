import {
    getDashboardStats,
    getRecentOrders,
    getLowStockAlerts,
    getSalesData,
    getTopProducts,
    getProfitStats,
    getTopCustomers,
    type DashboardStats,
    type ProfitStats,
    type RecentOrder,
    type LowStockItem,
    type SalesDataPoint,
    type TopProduct,
    type TopCustomer,
} from '@/repositories/admin.repository';

export type DashboardData = {
    stats: DashboardStats;
    profitStats: ProfitStats;
    recentOrders: RecentOrder[];
    lowStockAlerts: LowStockItem[];
    salesData: SalesDataPoint[];
    topProducts: TopProduct[];
    topCustomers: TopCustomer[];
};

export async function getDashboardData(): Promise<{ success: boolean; data?: DashboardData; error?: string }> {
    try {
        const [stats, profitStats, recentOrders, lowStockAlerts, salesData, topProducts, topCustomers] = await Promise.all([
            getDashboardStats(),
            getProfitStats(),
            getRecentOrders(10),
            getLowStockAlerts(),
            getSalesData(30),
            getTopProducts(5),
            getTopCustomers(8),
        ]);

        return {
            success: true,
            data: {
                stats,
                profitStats,
                recentOrders,
                lowStockAlerts,
                salesData,
                topProducts,
                topCustomers,
            },
        };
    } catch (error) {
        console.error('[services/admin] getDashboardData:', error);
        return { success: false, error: 'Failed to load dashboard data' };
    }
}
