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
