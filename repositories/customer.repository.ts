import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ADMIN_PRODUCTS_PER_PAGE } from '@/lib/constants/pagination';
import type {
    AdminCustomerListItem,
    AdminCustomerListResult,
    AdminCustomerDetail,
    AdminCustomerOrder,
    AdminCustomerOrdersResult,
    AdminCustomerFilters,
} from '@/types/admin-customer';

export async function getAdminCustomers(filters: AdminCustomerFilters): Promise<AdminCustomerListResult> {
    const supabase = await createClient();

    let query = supabase
        .from('users')
        .select('id, full_name, phone, role, deactivated_at, created_at', { count: 'exact' })
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

    if (filters.search) {
        query = query.or(
            `full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`,
        );
    }

    const page = filters.page ?? 1;
    const from = (page - 1) * ADMIN_PRODUCTS_PER_PAGE;
    const to = from + ADMIN_PRODUCTS_PER_PAGE - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
        console.error('[repositories/customer] getAdminCustomers:', error);
        return { customers: [], total: 0, page: 1, totalPages: 0 };
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / ADMIN_PRODUCTS_PER_PAGE));

    const userIds = (data ?? []).map((c) => c.id);

    let orderCounts: Record<string, number> = {};
    if (userIds.length > 0) {
        const { data: counts } = await supabase
            .from('orders')
            .select('user_id')
            .in('user_id', userIds);

        if (counts) {
            for (const row of counts) {
                orderCounts[row.user_id] = (orderCounts[row.user_id] ?? 0) + 1;
            }
        }
    }

    const customers: AdminCustomerListItem[] = (data ?? []).map((c) => ({
        id: c.id,
        fullName: c.full_name,
        email: undefined,
        phone: c.phone,
        role: c.role as AdminCustomerListItem['role'],
        deactivatedAt: c.deactivated_at,
        orderCount: orderCounts[c.id] ?? 0,
        createdAt: c.created_at,
    }));

    return { customers, total, page, totalPages };
}

export async function getAdminCustomerById(id: string): Promise<AdminCustomerDetail | null> {
    const supabase = await createClient();

    const { data: customer, error } = await supabase
        .from('users')
        .select('id, full_name, phone, role, avatar_url, deactivated_at, created_at, updated_at')
        .eq('id', id)
        .single();

    if (error || !customer) {
        console.error('[repositories/customer] getAdminCustomerById:', error);
        return null;
    }

    const adminClient = createAdminClient();
    const { data: { user } } = await adminClient.auth.admin.getUserById(id);
    const email = user?.email ?? undefined;

    return {
        id: customer.id,
        fullName: customer.full_name,
        email,
        phone: customer.phone,
        role: customer.role as AdminCustomerDetail['role'],
        avatarUrl: customer.avatar_url,
        deactivatedAt: customer.deactivated_at,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
    };
}

export async function getCustomerOrders(
    customerId: string,
    page: number = 1,
    limit: number = ADMIN_PRODUCTS_PER_PAGE,
): Promise<AdminCustomerOrdersResult> {
    const supabase = await createClient();

    let query = supabase
        .from('orders')
        .select('id, status, payment_method, grand_total, created_at', { count: 'exact' })
        .eq('user_id', customerId)
        .order('created_at', { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
        console.error('[repositories/customer] getCustomerOrders:', error);
        return { orders: [], total: 0, page: 1, totalPages: 0 };
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const orders: AdminCustomerOrder[] = (data ?? []).map((o) => ({
        id: o.id,
        status: o.status,
        paymentMethod: o.payment_method,
        grandTotal: Number(o.grand_total),
        createdAt: o.created_at,
    }));

    return { orders, total, page, totalPages };
}

export async function deactivateCustomer(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('users')
        .update({ deactivated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error('Failed to deactivate customer');
}

export async function reactivateCustomer(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('users')
        .update({ deactivated_at: null })
        .eq('id', id);

    if (error) throw new Error('Failed to reactivate customer');
}

export async function updateCustomerRole(id: string, role: 'customer' | 'shop_manager'): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', id);

    if (error) throw new Error('Failed to update customer role');
}
