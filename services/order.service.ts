import { getOrderById, getOrderByIdWithVerification, cancelOrder } from '@/repositories/order.repository';
import type { Order, OrderLookupInput } from '@/types/order';
import { renderInvoiceBuffer } from '@/lib/pdf/render';

function mapDbRowToOrder(data: Record<string, unknown>): Order {
    return {
        id: data.id as string,
        user_id: data.user_id as string,
        status: data.status as Order['status'],
        payment_method: data.payment_method as string,
        subtotal: Number(data.subtotal),
        shipping_cost: Number(data.shipping_cost),
        discount_total: Number(data.discount_total),
        grand_total: Number(data.grand_total),
        created_at: data.created_at as string,
        updated_at: data.updated_at as string,
        order_items: (data.order_items ?? []) as Order['order_items'],
        payments: (data.payments ?? []) as Order['payments'],
        shipping_addresses: (data.shipping_addresses ?? []) as Order['shipping_addresses'],
    };
}

export async function getOrder(
    orderId: string,
    userId?: string,
): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
        const data = await getOrderById(orderId);

        if (!data) {
            return { success: false, error: 'Order not found' };
        }

        if (userId && data.user_id !== userId) {
            return { success: false, error: 'Order not found' };
        }

        return { success: true, order: mapDbRowToOrder(data) };
    } catch (error) {
        console.error('[services/order.getOrder]', error);
        return { success: false, error: 'Failed to fetch order' };
    }
}

export async function guestLookup(
    input: OrderLookupInput,
): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
        const data = await getOrderByIdWithVerification(
            input.orderId,
            input.email,
            input.phone,
        );

        if (!data) {
            return {
                success: false,
                error: 'Order not found or verification failed. Please check your Order ID and email/phone.',
            };
        }

        return { success: true, order: mapDbRowToOrder(data) };
    } catch (error) {
        console.error('[services/order.guestLookup]', error);
        return { success: false, error: 'Failed to look up order' };
    }
}

export async function cancelUserOrder(
    orderId: string,
    userId: string,
): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
        const data = await getOrderById(orderId);

        if (!data) {
            return { success: false, error: 'Order not found' };
        }

        if (data.user_id !== userId) {
            return { success: false, error: 'Order not found' };
        }

        const result = await cancelOrder(orderId, userId);
        return { success: true, status: result.status };
    } catch (error) {
        console.error('[services/order.cancelUserOrder]', error);
        return { success: false, error: 'Failed to cancel order' };
    }
}

export async function generateInvoice(
    orderId: string,
    userId?: string,
): Promise<{ success: boolean; buffer?: Uint8Array; error?: string }> {
    try {
        const data = await getOrderById(orderId);

        if (!data) {
            return { success: false, error: 'Order not found' };
        }

        if (userId && data.user_id !== userId) {
            return { success: false, error: 'Order not found' };
        }

        const order = mapDbRowToOrder(data);
        const buffer = await renderInvoiceBuffer(order);

        return { success: true, buffer: new Uint8Array(buffer) };
    } catch (error) {
        console.error('[services/order.generateInvoice]', error);
        return { success: false, error: 'Failed to generate invoice' };
    }
}
