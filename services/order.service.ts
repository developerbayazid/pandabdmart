import {
    getOrderById,
    getOrderByIdWithVerification,
    cancelOrder,
    getAdminOrders as getAdminOrdersRepo,
    getAdminOrderById,
    updateOrderStatusInDb,
    adminEditCustomerInfo,
    adminEditShippingAddress,
    adminAddOrderItemRpc,
    adminRemoveOrderItemRpc,
    adminSearchVariants,
    resetPaymentToPending,
} from '@/repositories/order.repository';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/services/audit.service';
import type { Order, OrderLookupInput } from '@/types/order';
import type { AdminOrderListItem, AdminOrderFilters, AdminOrderDetail, AdminEditCustomerInfo, AdminEditShippingAddress } from '@/types/admin-order';
import type { OrderItemSnapshot, OrderPayment, OrderShipping } from '@/types/order';
import { renderInvoiceBuffer } from '@/lib/pdf/render';
import { ORDER_STATUSES, VALID_TRANSITIONS } from '@/lib/constants/order';
import type { OrderStatus } from '@/lib/constants/order';

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

function isValidTransition(currentStatus: string, newStatus: string): boolean {
    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed) return false;
    return allowed.includes(newStatus);
}

function mapAdminOrderListItem(row: Record<string, unknown>): AdminOrderListItem {
    const userData = row.user as unknown as { full_name: string | null } | null;
    const itemsData = row.order_items as unknown as [{ count: number }] | null;

    return {
        id: row.id as string,
        userId: row.user_id as string,
        customerName: userData?.full_name ?? null,
        customerEmail: (row.customer_email as string) ?? null,
        status: row.status as OrderStatus,
        paymentMethod: row.payment_method as string,
        subtotal: Number(row.subtotal),
        shippingCost: Number(row.shipping_cost),
        discountTotal: Number(row.discount_total),
        grandTotal: Number(row.grand_total),
        itemCount: itemsData?.[0]?.count ?? 0,
        createdAt: row.created_at as string,
    };
}

function mapAdminOrderDetail(data: Record<string, unknown>): AdminOrderDetail {
    const userData = data.user as unknown as { full_name: string | null } | null;

    return {
        id: data.id as string,
        userId: data.user_id as string,
        customerName: userData?.full_name ?? null,
        customerEmail: (data.customer_email as string) ?? null,
        status: data.status as OrderStatus,
        paymentMethod: data.payment_method as string,
        subtotal: Number(data.subtotal),
        shippingCost: Number(data.shipping_cost),
        discountTotal: Number(data.discount_total),
        grandTotal: Number(data.grand_total),
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
        orderItems: (data.order_items ?? []) as OrderItemSnapshot[],
        payments: (data.payments ?? []) as OrderPayment[],
        shippingAddresses: (data.shipping_addresses ?? []) as OrderShipping[],
    };
}

export async function getAdminOrders(
    filters: AdminOrderFilters,
): Promise<{
    success: boolean;
    data?: { orders: AdminOrderListItem[]; total: number; page: number; totalPages: number };
    error?: string;
}> {
    try {
        const result = await getAdminOrdersRepo({
            page: filters.page ?? 1,
            limit: 20,
            search: filters.search,
            status: filters.status,
            paymentMethod: filters.paymentMethod,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
        });

        return {
            success: true,
            data: {
                orders: result.orders.map(mapAdminOrderListItem),
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
            },
        };
    } catch (error) {
        console.error('[services/order] getAdminOrders:', error);
        return { success: false, error: 'Failed to fetch orders' };
    }
}

export async function getAdminOrderDetail(
    orderId: string,
): Promise<{ success: boolean; data?: AdminOrderDetail; error?: string }> {
    try {
        const data = await getAdminOrderById(orderId);

        if (!data) {
            return { success: false, error: 'Order not found' };
        }

        return { success: true, data: mapAdminOrderDetail(data) };
    } catch (error) {
        console.error('[services/order] getAdminOrderDetail:', error);
        return { success: false, error: 'Failed to fetch order detail' };
    }
}

export async function updateOrderStatus(
    actorId: string,
    orderId: string,
    _clientSuppliedStatus: string,
    newStatus: string,
): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
        if (!ORDER_STATUSES.includes(newStatus as typeof ORDER_STATUSES[number])) {
            return { success: false, error: `Invalid order status: ${newStatus}` };
        }

        const orderData = await getOrderById(orderId);
        if (!orderData) {
            return { success: false, error: 'Order not found' };
        }

        const currentStatus = orderData.status as string;

        if (currentStatus === newStatus) {
            return { success: false, error: 'Order is already in this status' };
        }

        // Cancellation must reconcile stock — route through the dedicated
        // cancelOrder function which handles reserved_stock release (MFS)
        // and stock restoration (COD). The generic status update path
        // only flips the status column and would leak stock.
        if (newStatus === 'cancelled') {
            const result = await cancelOrder(orderId);
            await logAuditEvent({
                actorId,
                action: 'order.status_update',
                entityType: 'order',
                entityId: orderId,
                meta: {
                    order_id: orderId,
                    previous_status: currentStatus,
                    new_status: newStatus,
                    stock_reconciled: true,
                },
            });
            return { success: true, status: result.status };
        }

        // Transitioning to payment_pending resets the payment record to
        // 'pending' (clearing verified_by/at) so the admin can re-verify
        // or reject via the Verify/Fail buttons. Only restore stock when
        // coming from 'paid' (approval previously decremented it).
        if (newStatus === 'payment_pending') {
            if (currentStatus === 'paid') {
                const items = (orderData.order_items ?? []).map((i: { variant_id: string; quantity: number }) => ({
                    variantId: i.variant_id,
                    quantity: i.quantity,
                }));
                await resetPaymentToPending(orderId, items);
            } else {
                const adminClient = createAdminClient();
                await adminClient
                    .from('payments')
                    .update({
                        status: 'pending',
                        verified_by: null,
                        verified_at: null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('order_id', orderId);
            }

            await logAuditEvent({
                actorId,
                action: 'order.status_update',
                entityType: 'order',
                entityId: orderId,
                meta: {
                    order_id: orderId,
                    previous_status: currentStatus,
                    new_status: newStatus,
                    payment_reset: true,
                },
            });

            const result = await updateOrderStatusInDb(orderId, currentStatus, newStatus);
            return { success: true, status: result.status };
        }

        // Transitioning to paid — also update the payment record to verified
        if (newStatus === 'paid') {
            const adminClient = createAdminClient();
            await adminClient
                .from('payments')
                .update({
                    status: 'verified',
                    verified_by: actorId,
                    verified_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('order_id', orderId);

            await logAuditEvent({
                actorId,
                action: 'order.status_update',
                entityType: 'order',
                entityId: orderId,
                meta: {
                    order_id: orderId,
                    previous_status: currentStatus,
                    new_status: newStatus,
                    payment_verified: true,
                },
            });

            const result = await updateOrderStatusInDb(orderId, currentStatus, newStatus);
            return { success: true, status: result.status };
        }

        const result = await updateOrderStatusInDb(orderId, currentStatus, newStatus);

        await logAuditEvent({
            actorId,
            action: 'order.status_update',
            entityType: 'order',
            entityId: orderId,
            meta: {
                order_id: orderId,
                previous_status: currentStatus,
                new_status: newStatus,
            },
        });

        return { success: true, status: result.status };
    } catch (error) {
        console.error('[services/order] updateOrderStatus:', error);
        return { success: false, error: 'Failed to update order status' };
    }
}

export async function editCustomerInfo(
    actorId: string,
    orderId: string,
    data: AdminEditCustomerInfo,
): Promise<{ success: boolean; error?: string }> {
    try {
        await adminEditCustomerInfo(orderId, data);

        await logAuditEvent({
            actorId,
            action: 'order.update_customer',
            entityType: 'order',
            entityId: orderId,
            meta: { order_id: orderId, ...data },
        });

        return { success: true };
    } catch (error) {
        console.error('[services/order] editCustomerInfo:', error);
        return { success: false, error: 'Failed to update customer info' };
    }
}

export async function editShippingAddress(
    actorId: string,
    addressId: string,
    orderId: string,
    data: AdminEditShippingAddress,
): Promise<{ success: boolean; error?: string }> {
    try {
        await adminEditShippingAddress(addressId, data);

        await logAuditEvent({
            actorId,
            action: 'order.update_shipping',
            entityType: 'order',
            entityId: orderId,
            meta: { order_id: orderId, ...data },
        });

        return { success: true };
    } catch (error) {
        console.error('[services/order] editShippingAddress:', error);
        return { success: false, error: 'Failed to update shipping address' };
    }
}

export async function addOrderItem(
    actorId: string,
    orderId: string,
    variantId: string,
    quantity: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        if (quantity < 1) {
            return { success: false, error: 'Quantity must be at least 1' };
        }

        const result = await adminAddOrderItemRpc(orderId, variantId, quantity);

        if (!result.success) {
            return { success: false, error: result.error || 'Failed to add item' };
        }

        await logAuditEvent({
            actorId,
            action: 'order.add_item',
            entityType: 'order',
            entityId: orderId,
            meta: { order_id: orderId, variant_id: variantId, quantity },
        });

        return { success: true };
    } catch (error) {
        console.error('[services/order] addOrderItem:', error);
        return { success: false, error: 'Failed to add item to order' };
    }
}

export async function removeOrderItem(
    actorId: string,
    orderItemId: string,
    orderId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await adminRemoveOrderItemRpc(orderItemId);

        if (!result.success) {
            return { success: false, error: result.error || 'Failed to remove item' };
        }

        await logAuditEvent({
            actorId,
            action: 'order.remove_item',
            entityType: 'order',
            entityId: orderId,
            meta: { order_id: orderId, order_item_id: orderItemId },
        });

        return { success: true };
    } catch (error) {
        console.error('[services/order] removeOrderItem:', error);
        return { success: false, error: 'Failed to remove item from order' };
    }
}

export async function searchVariants(
    search: string,
): Promise<{ success: boolean; data?: { id: string; sku: string; price: number; stock: number; productName: string }[]; error?: string }> {
    try {
        if (!search || search.length < 2) {
            return { success: true, data: [] };
        }

        const variants = await adminSearchVariants(search);
        return { success: true, data: variants };
    } catch (error) {
        console.error('[services/order] searchVariants:', error);
        return { success: false, error: 'Failed to search variants' };
    }
}
