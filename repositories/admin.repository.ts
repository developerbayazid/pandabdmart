import { createClient } from '@/lib/supabase/server';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants/inventory';
import { getTodayStart } from '@/lib/utils';

export type DashboardStats = {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    pendingOrders: number;
    paymentPendingOrders: number;
    todayRevenue: number;
    todayOrders: number;
};

export type RecentOrder = {
    id: string;
    status: string;
    payment_method: string;
    grand_total: number;
    created_at: string;
    customer_name: string | null;
    customer_email: string | null;
    item_count: number;
};

export type LowStockItem = {
    variant_id: string;
    sku: string;
    stock: number;
    reserved_stock: number;
    product_name: string;
};

export type SalesDataPoint = {
    date: string;
    revenue: number;
    orders: number;
};

export type TopProduct = {
    product_id: string;
    product_name: string;
    total_sold: number;
    total_revenue: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient();

    // Total orders (non-cancelled)
    const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .not('status', 'eq', 'cancelled');

    // Total revenue (non-cancelled)
    const { data: revenueAgg } = await supabase
        .from('orders')
        .select('sum(grand_total)')
        .not('status', 'eq', 'cancelled')
        .single();
    const totalRevenue = Number((revenueAgg as unknown as { sum: { grand_total: number } }[])?.[0]?.sum?.grand_total ?? 0);

    // Pending orders
    const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    // Payment pending orders
    const { count: paymentPendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'payment_pending');

    // Customers
    const { count: totalCustomers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

    // Today's orders (non-cancelled, timezone-aware)
    const todayStart = getTodayStart();
    const { count: todayOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart)
        .not('status', 'eq', 'cancelled');

    const { data: todayRevenueAgg } = await supabase
        .from('orders')
        .select('sum(grand_total)')
        .gte('created_at', todayStart)
        .not('status', 'eq', 'cancelled')
        .single();
    const todayRevenue = Number((todayRevenueAgg as unknown as { sum: { grand_total: number } }[])?.[0]?.sum?.grand_total ?? 0);

    return {
        totalOrders: totalOrders ?? 0,
        totalRevenue,
        totalCustomers: totalCustomers ?? 0,
        pendingOrders: pendingOrders ?? 0,
        paymentPendingOrders: paymentPendingOrders ?? 0,
        todayRevenue,
        todayOrders: todayOrders ?? 0,
    };
}

export async function getRecentOrders(limit: number = 10): Promise<RecentOrder[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('orders')
        .select(
            `id, status, payment_method, grand_total, created_at, customer_email,
            user:users(full_name),
            order_items(count)`,
        )
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error || !data) {
        console.error('[repositories/admin] getRecentOrders:', error);
        return [];
    }

    return data.map((row) => {
        const userArray = row.user as unknown as { full_name: string | null }[] | null;
        const user = userArray?.[0] ?? null;
        return {
            id: row.id as string,
            status: row.status as string,
            payment_method: row.payment_method as string,
            grand_total: Number(row.grand_total),
            created_at: row.created_at as string,
            customer_name: user?.full_name ?? null,
            customer_email: (row.customer_email as string) ?? null,
            item_count: (row.order_items as unknown as { count: number })?.count ?? 0,
        };
    });
}

export async function getLowStockAlerts(): Promise<LowStockItem[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('product_variants')
        .select(
            `id, sku, stock, reserved_stock,
            product:products!inner(id, name)`,
        )
        .lte('stock', LOW_STOCK_THRESHOLD)
        .gt('stock', 0)
        .eq('is_active', true);

    if (error || !data) {
        console.error('[repositories/admin] getLowStockAlerts:', error);
        return [];
    }

    return data.map((row) => {
        const productArray = row.product as unknown as { id: string; name: string }[] | null;
        const product = productArray?.[0] ?? { id: '', name: 'Unknown' };
        return {
            variant_id: row.id as string,
            sku: row.sku as string,
            stock: row.stock as number,
            reserved_stock: row.reserved_stock as number,
            product_name: product.name,
        };
    });
}

export async function getSalesData(days: number = 30): Promise<SalesDataPoint[]> {
    const supabase = await createClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startIso = startDate.toISOString();

    const { data, error } = await supabase
        .from('orders')
        .select('grand_total, created_at')
        .gte('created_at', startIso)
        .not('status', 'eq', 'cancelled')
        .order('created_at', { ascending: true })
        .limit(5000);

    if (error || !data) {
        console.error('[repositories/admin] getSalesData:', error);
        return [];
    }

    // Group by date
    const grouped = new Map<string, { revenue: number; orders: number }>();

    for (const row of data) {
        const date = (row.created_at as string).split('T')[0];
        const existing = grouped.get(date) ?? { revenue: 0, orders: 0 };
        existing.revenue += Number(row.grand_total);
        existing.orders += 1;
        grouped.set(date, existing);
    }

    // Fill in missing dates with 0
    const result: SalesDataPoint[] = [];
    for (let i = days; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const val = grouped.get(dateStr) ?? { revenue: 0, orders: 0 };
        result.push({ date: dateStr, revenue: val.revenue, orders: val.orders });
    }

    return result;
}

export async function getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('order_items')
        .select('quantity, unit_price, product_snapshot')
        .not('order.status', 'eq', 'cancelled')
        .order('created_at', { ascending: false });

    if (error || !data) {
        console.error('[repositories/admin] getTopProducts:', error);
        return [];
    }

    // Aggregate by product
    const grouped = new Map<string, { name: string; sold: number; revenue: number }>();

    for (const row of data) {
        const snapshot = row.product_snapshot as Record<string, unknown> | null;
        const productId = (snapshot?.id as string) ?? '';
        const productName = (snapshot?.name as string) ?? 'Unknown';
        if (!productId) continue;

        const existing = grouped.get(productId) ?? { name: productName, sold: 0, revenue: 0 };
        existing.sold += (row.quantity as number) ?? 0;
        existing.revenue += (row.quantity as number) * Number(row.unit_price);
        grouped.set(productId, existing);
    }

    const sorted = Array.from(grouped.entries())
        .sort((a, b) => b[1].sold - a[1].sold)
        .slice(0, limit);

    return sorted.map(([productId, val]) => ({
        product_id: productId,
        product_name: val.name,
        total_sold: val.sold,
        total_revenue: val.revenue,
    }));
}
