import {
    getPendingMfsPayments,
    getAllPayments,
    approveMfsPaymentRpc,
    rejectMfsPaymentRpc,
    adminUpdatePaymentRefs,
} from '@/repositories/payment.repository';
import { logAuditEvent } from '@/services/audit.service';
import type { AdminPaymentRecord, AdminPendingPayment } from '@/types/admin-payment';

export async function getPendingPayments(): Promise<{
    success: boolean;
    data?: AdminPendingPayment[];
    error?: string;
}> {
    try {
        const payments = await getPendingMfsPayments();
        return { success: true, data: payments };
    } catch (error) {
        console.error('[services/payment] getPendingPayments:', error);
        return { success: false, error: 'Failed to fetch pending payments' };
    }
}

export async function getPayments(): Promise<{
    success: boolean;
    data?: AdminPaymentRecord[];
    error?: string;
}> {
    try {
        const payments = await getAllPayments();
        return { success: true, data: payments };
    } catch (error) {
        console.error('[services/payment] getPayments:', error);
        return { success: false, error: 'Failed to fetch payments' };
    }
}

export async function approvePayment(
    actorId: string,
    orderId: string,
): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
        const result = await approveMfsPaymentRpc(orderId, actorId);

        if (!result.success) {
            return { success: false, error: result.error || 'Approval failed' };
        }

        await logAuditEvent({
            actorId,
            action: 'payment.approve',
            entityType: 'payment',
            entityId: orderId,
            meta: { order_id: orderId, new_status: result.status },
        });

        return { success: true, status: result.status };
    } catch (error) {
        console.error('[services/payment] approvePayment:', error);
        return { success: false, error: 'Failed to approve payment' };
    }
}

export async function rejectPayment(
    actorId: string,
    orderId: string,
): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
        const result = await rejectMfsPaymentRpc(orderId, actorId);

        if (!result.success) {
            return { success: false, error: result.error || 'Rejection failed' };
        }

        await logAuditEvent({
            actorId,
            action: 'payment.reject',
            entityType: 'payment',
            entityId: orderId,
            meta: { order_id: orderId, new_status: result.status },
        });

        return { success: true, status: result.status };
    } catch (error) {
        console.error('[services/payment] rejectPayment:', error);
        return { success: false, error: 'Failed to reject payment' };
    }
}

export async function updatePaymentRefs(
    actorId: string,
    paymentId: string,
    orderId: string,
    data: { gatewayRef?: string; txnId?: string; paymentNumber?: string },
): Promise<{ success: boolean; error?: string }> {
    try {
        await adminUpdatePaymentRefs(paymentId, data);

        await logAuditEvent({
            actorId,
            action: 'payment.update_refs',
            entityType: 'payment',
            entityId: orderId,
            meta: { order_id: orderId, payment_id: paymentId, ...data },
        });

        return { success: true };
    } catch (error) {
        console.error('[services/payment] updatePaymentRefs:', error);
        return { success: false, error: 'Failed to update payment' };
    }
}
