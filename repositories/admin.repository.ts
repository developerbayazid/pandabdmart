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

export type ProfitStats = {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    marginPercent: number;
    orderCount: number;
    todayRevenue: number;
    todayCost: number;
    todayProfit: number;
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
    cost: number;
    profit: number;
};

export type TopProduct = {
    product_id: string;
    product_name: string;
    total_sold: number;
    total_revenue: number;
    total_cost: number;
    total_profit: number;
};

export type TopCustomer = {
    user_id: string;
    name: string;
    email: string | null;
    order_count: number;
    total_spent: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient();

    // Total orders (non-cancelled)
    const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .not('status', 'eq', 'cancelled');

    // Total revenue (paid + delivered)
    const { data: revenueAgg } = await supabase
        .from('orders')
        .select('grand_total')
        .in('status', ['paid', 'delivered']);
    const totalRevenue = revenueAgg?.reduce((sum, o) => sum + Number(o.grand_total), 0) ?? 0;

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

    // Today's orders (paid + delivered, timezone-aware)
    const todayStart = getTodayStart();
    const { count: todayOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart)
        .in('status', ['paid', 'delivered']);

    const { data: todayRevenueData } = await supabase
        .from('orders')
        .select('grand_total')
        .gte('created_at', todayStart)
        .in('status', ['paid', 'delivered']);
    const todayRevenue = todayRevenueData?.reduce((sum, o) => sum + Number(o.grand_total), 0) ?? 0;

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
        .select('id, grand_total, created_at')
        .gte('created_at', startIso)
        .in('status', ['paid', 'delivered'])
        .order('created_at', { ascending: true })
        .limit(5000);

    if (error || !data) {
        console.error('[repositories/admin] getSalesData:', error);
        return [];
    }

    // Fetch cost data from order_items for profit calculation
    const { data: itemsData } = await supabase
        .from('order_items')
        .select('order_id, quantity, purchase_price, order!inner(created_at, status)')
        .gte('order.created_at', startIso)
        .in('order.status', ['paid', 'delivered']);

    const costMap = new Map<string, number>();
    if (itemsData) {
        for (const item of itemsData) {
            const oid = item.order_id as string;
            const cost = (item.quantity as number) * Number(item.purchase_price ?? 0);
            costMap.set(oid, (costMap.get(oid) ?? 0) + cost);
        }
    }

    // Group by date
    const grouped = new Map<string, { revenue: number; orders: number; cost: number }>();

    for (const row of data) {
        const date = (row.created_at as string).split('T')[0];
        const oid = row.id as string;
        const existing = grouped.get(date) ?? { revenue: 0, orders: 0, cost: 0 };
        existing.revenue += Number(row.grand_total);
        existing.orders += 1;
        existing.cost += costMap.get(oid) ?? 0;
        grouped.set(date, existing);
    }

    // Fill in missing dates with 0
    const result: SalesDataPoint[] = [];
    for (let i = days; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const val = grouped.get(dateStr) ?? { revenue: 0, orders: 0, cost: 0 };
        result.push({
            date: dateStr,
            revenue: val.revenue,
            orders: val.orders,
            cost: val.cost,
            profit: val.revenue - val.cost,
        });
    }

    return result;
}

export async function getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    const supabase = await createClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    const startIso = startDate.toISOString();

    const { data, error } = await supabase
        .from('order_items')
        .select('quantity, unit_price, purchase_price, product_snapshot, order!inner(created_at, status)')
        .gte('order.created_at', startIso)
        .in('order.status', ['paid', 'delivered'])
        .order('created_at', { ascending: false });

    if (error || !data) {
        console.error('[repositories/admin] getTopProducts:', error);
        return [];
    }

    // Aggregate by product
    const grouped = new Map<string, { name: string; sold: number; revenue: number; cost: number }>();

    for (const row of data) {
        const snapshot = row.product_snapshot as Record<string, unknown> | null;
        const productId = (snapshot?.id as string) ?? '';
        const productName = (snapshot?.name as string) ?? 'Unknown';
        if (!productId) continue;

        const qty = (row.quantity as number) ?? 0;
        const price = Number(row.unit_price) ?? 0;
        const cost = Number(row.purchase_price ?? 0);

        const existing = grouped.get(productId) ?? { name: productName, sold: 0, revenue: 0, cost: 0 };
        existing.sold += qty;
        existing.revenue += qty * price;
        existing.cost += qty * cost;
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
        total_cost: val.cost,
        total_profit: val.revenue - val.cost,
    }));
}

export async function getProfitStats(): Promise<ProfitStats> {
    const supabase = await createClient();

    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    const startIso = startDate.toISOString();

    const { data, error } = await supabase
        .from('order_items')
        .select('order_id, quantity, unit_price, purchase_price, order!inner(created_at, status)')
        .gte('order.created_at', startIso)
        .in('order.status', ['paid', 'delivered'])
        .not('purchase_price', 'is', null);

    if (error || !data) {
        console.error('[repositories/admin] getProfitStats:', error);
        return { totalRevenue: 0, totalCost: 0, totalProfit: 0, marginPercent: 0, orderCount: 0, todayRevenue: 0, todayCost: 0, todayProfit: 0 };
    }

    const todayStart = getTodayStart();
    let totalRevenue = 0;
    let totalCost = 0;
    let todayRevenue = 0;
    let todayCost = 0;
    const orderIdSet = new Set<string>();

    for (const row of data) {
        const qty = (row.quantity as number) ?? 0;
        const price = Number(row.unit_price) ?? 0;
        const cost = Number(row.purchase_price) ?? 0;
        const orderRow = row.order as unknown as { created_at: string; status: string } | null;
        const createdAt = orderRow?.created_at ?? '';

        totalRevenue += qty * price;
        totalCost += qty * cost;
        orderIdSet.add(row.order_id as string);

        if (createdAt >= todayStart) {
            todayRevenue += qty * price;
            todayCost += qty * cost;
        }
    }

    const totalProfit = Math.round((totalRevenue - totalCost) * 100) / 100;
    const marginPercent = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100 * 100) / 100 : 0;

    return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        totalProfit,
        marginPercent,
        orderCount: orderIdSet.size,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        todayCost: Math.round(todayCost * 100) / 100,
        todayProfit: Math.round((todayRevenue - todayCost) * 100) / 100,
    };
}

export async function getTopCustomers(limit: number = 8): Promise<TopCustomer[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('orders')
        .select('user_id, grand_total, user:users(full_name)')
        .in('status', ['paid', 'delivered', 'completed'])
        .not('user_id', 'is', null);

    if (error || !data) {
        console.error('[repositories/admin] getTopCustomers:', error);
        return [];
    }

    const grouped = new Map<string, { name: string; email: string | null; orderCount: number; totalSpent: number }>();

    for (const row of data) {
        const userId = row.user_id as string;
        const userRow = row.user as unknown as { full_name: string | null; email: string | null } | null;

        const existing = grouped.get(userId) ?? {
            name: userRow?.full_name ?? userRow?.email ?? 'Unknown',
            email: userRow?.email ?? null,
            orderCount: 0,
            totalSpent: 0,
        };
        existing.orderCount += 1;
        existing.totalSpent += Number(row.grand_total) ?? 0;
        grouped.set(userId, existing);
    }

    return Array.from(grouped.entries())
        .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
        .slice(0, limit)
        .map(([userId, val]) => ({
            user_id: userId,
            name: val.name,
            email: val.email,
            order_count: val.orderCount,
            total_spent: val.totalSpent,
        }));
}
