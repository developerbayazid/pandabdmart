'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth/get-user';
import {
    createCoupon,
    updateCoupon,
    deleteCoupon,
} from '@/services/coupon.service';
import type { AdminCouponFormData } from '@/types/admin-coupon';

async function getActorId(): Promise<string> {
    const user = await getUser();
    if (!user || !['admin', 'shop_manager'].includes(user.role)) {
        return '';
    }
    return user.id;
}

export async function createCouponAction(
    data: AdminCouponFormData,
): Promise<{ success: boolean; couponId?: string; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await createCoupon(actorId, data);
    if (result.success) {
        revalidatePath('/admin/coupons');
    }
    return result;
}

export async function updateCouponAction(
    couponId: string,
    data: Partial<AdminCouponFormData>,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await updateCoupon(actorId, couponId, data);
    if (result.success) {
        revalidatePath('/admin/coupons');
    }
    return result;
}

export async function deleteCouponAction(
    couponId: string,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await deleteCoupon(actorId, couponId);
    if (result.success) {
        revalidatePath('/admin/coupons');
    }
    return result;
}
