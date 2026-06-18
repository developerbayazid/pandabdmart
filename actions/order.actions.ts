'use server';

import { revalidatePath } from 'next/cache';
import { getOrder, guestLookup, cancelUserOrder, generateInvoice } from '@/services/order.service';
import { getUser } from '@/lib/auth/get-user';
import type { OrderLookupInput } from '@/types/order';

export async function getOrderAction(orderId: string) {
    const user = await getUser();

    if (!user) {
        const result = await getOrder(orderId);
        return result;
    }

    const result = await getOrder(orderId, user.id);
    return result;
}

export async function guestLookupAction(input: OrderLookupInput) {
    const result = await guestLookup(input);
    return result;
}

export async function cancelOrderAction(orderId: string) {
    const user = await getUser();

    if (!user) {
        return { success: false, error: 'You must be logged in to cancel an order' };
    }

    const result = await cancelUserOrder(orderId, user.id);

    if (result.success) {
        revalidatePath(`/track/${orderId}`);
    }

    return result;
}

export async function downloadInvoiceAction(orderId: string) {
    const user = await getUser();

    const result = await generateInvoice(orderId, user?.id);

    return result;
}

async function getAdminActorId(): Promise<string> {
    const user = await getUser();
    if (!user || !['admin', 'shop_manager'].includes(user.role)) {
        return '';
    }
    return user.id;
}

/** Admin — update order status */
export async function updateOrderStatusAction(
    orderId: string,
    currentStatus: string,
    newStatus: string,
): Promise<{ success: boolean; status?: string; error?: string }> {
    const user = await getUser();
    if (!user || !['admin', 'shop_manager'].includes(user.role)) {
        return { success: false, error: 'Not authenticated' };
    }

    const { updateOrderStatus } = await import('@/services/order.service');
    const result = await updateOrderStatus(user.id, orderId, currentStatus, newStatus);
    if (result.success) {
        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath(`/track/${orderId}`);
        revalidatePath('/admin/dashboard');
    }
    return result;
}

export async function editCustomerInfoAction(
    orderId: string,
    data: { customerEmail?: string },
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getAdminActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const { editCustomerInfo } = await import('@/services/order.service');
    const result = await editCustomerInfo(actorId, orderId, data);
    if (result.success) {
        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${orderId}`);
    }
    return result;
}

export async function editShippingAddressAction(
    addressId: string,
    orderId: string,
    data: { name?: string; phone?: string; address?: string; city?: string; district?: string; postalCode?: string },
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getAdminActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const { editShippingAddress } = await import('@/services/order.service');
    const result = await editShippingAddress(actorId, addressId, orderId, data);
    if (result.success) {
        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${orderId}`);
    }
    return result;
}

export async function addOrderItemAction(
    orderId: string,
    variantId: string,
    quantity: number,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getAdminActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const { addOrderItem } = await import('@/services/order.service');
    const result = await addOrderItem(actorId, orderId, variantId, quantity);
    if (result.success) {
        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/dashboard');
    }
    return result;
}

export async function removeOrderItemAction(
    orderItemId: string,
    orderId: string,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getAdminActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const { removeOrderItem } = await import('@/services/order.service');
    const result = await removeOrderItem(actorId, orderItemId, orderId);
    if (result.success) {
        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/dashboard');
    }
    return result;
}

export async function searchVariantsAction(
    query: string,
): Promise<{ success: boolean; data?: { id: string; sku: string; price: number; stock: number; productName: string }[]; error?: string }> {
    const actorId = await getAdminActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const { searchVariants } = await import('@/services/order.service');
    return searchVariants(query);
}
