import {
    getAdminCoupons,
    createCoupon as createCouponInDb,
    updateCoupon as updateCouponInDb,
    softDeleteCoupon,
} from '@/repositories/coupon.repository';
import { logAuditEvent } from '@/services/audit.service';
import type {
    AdminCouponListResult,
    AdminCouponFormData,
    AdminCouponFilters,
} from '@/types/admin-coupon';

export async function getAdminCouponList(
    filters: AdminCouponFilters,
): Promise<{ success: boolean; data?: AdminCouponListResult; error?: string }> {
    try {
        const result = await getAdminCoupons(filters);
        return { success: true, data: result };
    } catch (error) {
        console.error('[services/coupon] getAdminCouponList:', error);
        return { success: false, error: 'Failed to load coupons' };
    }
}

export async function createCoupon(
    actorId: string,
    data: AdminCouponFormData,
): Promise<{ success: boolean; couponId?: string; error?: string }> {
    try {
        if (!data.code.trim()) {
            return { success: false, error: 'Coupon code is required' };
        }
        if (data.value < 0) {
            return { success: false, error: 'Value must be 0 or greater' };
        }
        if (data.type === 'free_shipping') {
            data.value = 0;
        }

        const couponId = await createCouponInDb(data);

        await logAuditEvent({
            actorId,
            action: 'coupon.create',
            entityType: 'coupon',
            entityId: couponId,
            meta: { code: data.code, type: data.type },
        });

        return { success: true, couponId };
    } catch (error) {
        console.error('[services/coupon] createCoupon:', error);
        return { success: false, error: 'Failed to create coupon' };
    }
}

export async function updateCoupon(
    actorId: string,
    couponId: string,
    data: Partial<AdminCouponFormData>,
): Promise<{ success: boolean; error?: string }> {
    try {
        if (data.code !== undefined && !data.code.trim()) {
            return { success: false, error: 'Coupon code is required' };
        }
        if (data.value !== undefined && data.value < 0) {
            return { success: false, error: 'Value must be 0 or greater' };
        }
        if (data.value !== undefined && data.type === 'free_shipping') {
            data.value = 0;
        }

        await updateCouponInDb(couponId, data);

        await logAuditEvent({
            actorId,
            action: 'coupon.update',
            entityType: 'coupon',
            entityId: couponId,
            meta: data as Record<string, unknown>,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/coupon] updateCoupon:', error);
        return { success: false, error: 'Failed to update coupon' };
    }
}

export async function deleteCoupon(
    actorId: string,
    couponId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        await softDeleteCoupon(couponId);

        await logAuditEvent({
            actorId,
            action: 'coupon.delete',
            entityType: 'coupon',
            entityId: couponId,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/coupon] deleteCoupon:', error);
        return { success: false, error: 'Failed to delete coupon' };
    }
}
