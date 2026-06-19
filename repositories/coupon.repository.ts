import { createClient } from '@/lib/supabase/server';
import { ADMIN_PRODUCTS_PER_PAGE } from '@/lib/constants/pagination';
import type {
    AdminCouponListItem,
    AdminCouponListResult,
    AdminCouponFormData,
    AdminCouponFilters,
} from '@/types/admin-coupon';

export async function getAdminCoupons(
    filters: AdminCouponFilters,
): Promise<AdminCouponListResult> {
    const supabase = await createClient();

    let query = supabase
        .from('coupons')
        .select('id, code, type, value, min_order, usage_limit, used_count, expires_at, is_active, created_at', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (filters.search) {
        query = query.ilike('code', `%${filters.search}%`);
    }

    const page = filters.page ?? 1;
    const from = (page - 1) * ADMIN_PRODUCTS_PER_PAGE;
    const to = from + ADMIN_PRODUCTS_PER_PAGE - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
        console.error('[repositories/coupon] getAdminCoupons:', error);
        return { coupons: [], total: 0, page: 1, totalPages: 0 };
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / ADMIN_PRODUCTS_PER_PAGE));

    const coupons: AdminCouponListItem[] = (data ?? []).map((c) => ({
        id: c.id,
        code: c.code,
        type: c.type as AdminCouponListItem['type'],
        value: Number(c.value),
        minOrder: Number(c.min_order ?? 0),
        usageLimit: c.usage_limit ?? 0,
        usedCount: c.used_count ?? 0,
        expiresAt: c.expires_at,
        isActive: c.is_active,
        createdAt: c.created_at,
    }));

    return { coupons, total, page, totalPages };
}

export async function createCoupon(
    data: AdminCouponFormData,
): Promise<string> {
    const supabase = await createClient();

    const { data: created, error } = await supabase
        .from('coupons')
        .insert({
            code: data.code,
            type: data.type,
            value: data.value,
            min_order: data.minOrder,
            usage_limit: data.usageLimit,
            expires_at: data.expiresAt || null,
        })
        .select('id')
        .single();

    if (error) throw error;
    return created.id;
}

export async function updateCoupon(
    id: string,
    data: Partial<AdminCouponFormData>,
): Promise<void> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (data.code !== undefined) updateData.code = data.code;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.minOrder !== undefined) updateData.min_order = data.minOrder;
    if (data.usageLimit !== undefined) updateData.usage_limit = data.usageLimit;
    if (data.expiresAt !== undefined) updateData.expires_at = data.expiresAt || null;

    if (Object.keys(updateData).length === 0) return;

    const { error } = await supabase
        .from('coupons')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
}

export async function softDeleteCoupon(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('coupons')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw error;
}
