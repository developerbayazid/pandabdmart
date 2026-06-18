'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth/get-user';
import { approvePayment, rejectPayment } from '@/services/payment.service';

async function getActorId(): Promise<string> {
    const user = await getUser();
    if (!user || !['admin', 'shop_manager'].includes(user.role)) {
        return '';
    }
    return user.id;
}

export async function approvePaymentAction(
    orderId: string,
): Promise<{ success: boolean; status?: string; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await approvePayment(actorId, orderId);
    if (result.success) {
        revalidatePath('/admin/payments');
        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/dashboard');
    }
    return result;
}

export async function rejectPaymentAction(
    orderId: string,
): Promise<{ success: boolean; status?: string; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await rejectPayment(actorId, orderId);
    if (result.success) {
        revalidatePath('/admin/payments');
        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/dashboard');
    }
    return result;
}

export async function updatePaymentRefsAction(
    paymentId: string,
    orderId: string,
    data: { gatewayRef?: string; txnId?: string; paymentNumber?: string },
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const { updatePaymentRefs } = await import('@/services/payment.service');
    const result = await updatePaymentRefs(actorId, paymentId, orderId, data);
    if (result.success) {
        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/payments');
    }
    return result;
}
