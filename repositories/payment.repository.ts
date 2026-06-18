import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { AdminPaymentRecord, AdminPendingPayment } from '@/types/admin-payment';

export async function getPendingMfsPayments(): Promise<AdminPendingPayment[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('payments')
        .select(
            'id, order_id, amount, txn_id, payment_number, created_at, orders!inner(id, payment_method, status, created_at, user:users(full_name))',
        )
        .eq('status', 'pending')
        .in('orders.payment_method', ['bkash', 'nagad'])
        .eq('orders.status', 'payment_pending')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('[repositories/payment] getPendingMfsPayments:', error);
        return [];
    }

    const rawData = data as unknown as Record<string, unknown>[] | null;

    return (rawData ?? []).map((row) => {
        const order = row.orders as unknown as {
            id: string;
            payment_method: string;
            status: string;
            created_at: string;
            user: [{ full_name: string | null }] | null;
        } | null;

        return {
            paymentId: row.id as string,
            orderId: row.order_id as string,
            customerName: order?.user?.[0]?.full_name ?? null,
            customerEmail: null,
            paymentMethod: order?.payment_method ?? 'unknown',
            amount: Number(row.amount),
            txnId: (row.txn_id as string) ?? null,
            paymentNumber: (row.payment_number as string) ?? null,
            orderCreatedAt: order?.created_at as string ?? '',
        };
    });
}

export async function getAllPayments(): Promise<AdminPaymentRecord[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('payments')
        .select(`
            id,
            order_id,
            amount,
            txn_id,
            payment_number,
            gateway_ref,
            status,
            verified_by,
            verified_at,
            created_at,
            orders!inner(
                id,
                payment_method,
                status,
                created_at,
                customer_email,
                user:users!left(full_name)
            ),
            verifier:users!verified_by!left(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) {
        console.error('[repositories/payment] getAllPayments:', error);
        return [];
    }

    const rawData = data as unknown as Record<string, unknown>[] | null;

    return (rawData ?? []).map((row) => {
        const order = row.orders as unknown as {
            id: string;
            payment_method: string;
            status: string;
            created_at: string;
            customer_email: string | null;
            user: [{ full_name: string | null }] | null;
        } | null;

        const verifier = row.verifier as unknown as
            | [{ full_name: string | null }]
            | null;

        return {
            paymentId: row.id as string,
            orderId: row.order_id as string,
            orderStatus: order?.status ?? 'unknown',
            customerName: order?.user?.[0]?.full_name ?? null,
            customerEmail: order?.customer_email ?? null,
            paymentMethod: order?.payment_method ?? 'unknown',
            amount: Number(row.amount),
            txnId: (row.txn_id as string) ?? null,
            paymentNumber: (row.payment_number as string) ?? null,
            gatewayRef: (row.gateway_ref as string) ?? null,
            status: (row.status as 'pending' | 'verified' | 'failed') ?? 'pending',
            verifiedBy: (row.verified_by as string) ?? null,
            verifiedByName: verifier?.[0]?.full_name ?? null,
            verifiedAt: (row.verified_at as string) ?? null,
            createdAt: row.created_at as string,
        };
    });
}

export async function approveMfsPaymentRpc(
    orderId: string,
    verifiedBy: string,
): Promise<{ success: boolean; orderId: string; status: string; error?: string }> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient.rpc('approve_manual_payment', {
        p_order_id: orderId,
        p_verified_by: verifiedBy,
    });

    if (error) {
        return { success: false, orderId, status: '', error: error.message };
    }

    return {
        success: data.success as boolean,
        orderId: data.order_id as string,
        status: data.status as string,
    };
}

export async function rejectMfsPaymentRpc(
    orderId: string,
    verifiedBy: string,
): Promise<{ success: boolean; orderId: string; status: string; error?: string }> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient.rpc('reject_manual_payment', {
        p_order_id: orderId,
        p_verified_by: verifiedBy,
    });

    if (error) {
        return { success: false, orderId, status: '', error: error.message };
    }

    return {
        success: data.success as boolean,
        orderId: data.order_id as string,
        status: data.status as string,
    };
}

export async function adminUpdatePaymentRefs(
    paymentId: string,
    data: { gatewayRef?: string; txnId?: string; paymentNumber?: string },
): Promise<void> {
    const adminClient = createAdminClient();

    const updates: Record<string, unknown> = {};
    if (data.gatewayRef !== undefined) updates.gateway_ref = data.gatewayRef;
    if (data.txnId !== undefined) updates.txn_id = data.txnId;
    if (data.paymentNumber !== undefined) updates.payment_number = data.paymentNumber;

    if (Object.keys(updates).length === 0) return;

    const { error } = await adminClient
        .from('payments')
        .update(updates)
        .eq('id', paymentId);

    if (error) throw new Error(`Failed to update payment: ${error.message}`);
}
