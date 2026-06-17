import {
    getDashboardStats,
    getRecentOrders,
    getLowStockAlerts,
    getSalesData,
    getTopProducts,
    type DashboardStats,
    type RecentOrder,
    type LowStockItem,
    type SalesDataPoint,
    type TopProduct,
} from '@/repositories/admin.repository';

export type DashboardData = {
    stats: DashboardStats;
    recentOrders: RecentOrder[];
    lowStockAlerts: LowStockItem[];
    salesData: SalesDataPoint[];
    topProducts: TopProduct[];
};

export async function getDashboardData(): Promise<{ success: boolean; data?: DashboardData; error?: string }> {
    try {
        const [stats, recentOrders, lowStockAlerts, salesData, topProducts] = await Promise.all([
            getDashboardStats(),
            getRecentOrders(10),
            getLowStockAlerts(),
            getSalesData(30),
            getTopProducts(5),
        ]);

        return {
            success: true,
            data: {
                stats,
                recentOrders,
                lowStockAlerts,
                salesData,
                topProducts,
            },
        };
    } catch (error) {
        console.error('[services/admin] getDashboardData:', error);
        return { success: false, error: 'Failed to load dashboard data' };
    }
}
