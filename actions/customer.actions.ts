'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth/get-user';
import {
    deactivateCustomerAction as deactivateCustomerSvc,
    reactivateCustomerAction as reactivateCustomerSvc,
    updateCustomerRoleAction as updateCustomerRoleSvc,
    getAdminCustomerOrders,
} from '@/services/customer.service';

async function getActorId(): Promise<string> {
    const user = await getUser();
    if (!user || user.role !== 'admin') {
        return '';
    }
    return user.id;
}

export async function deactivateCustomerAction(
    customerId: string,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await deactivateCustomerSvc(actorId, customerId);
    if (result.success) {
        revalidatePath('/admin/customers');
    }
    return result;
}

export async function reactivateCustomerAction(
    customerId: string,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await reactivateCustomerSvc(actorId, customerId);
    if (result.success) {
        revalidatePath('/admin/customers');
    }
    return result;
}

export async function updateCustomerRoleAction(
    customerId: string,
    role: 'customer' | 'shop_manager',
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await updateCustomerRoleSvc(actorId, customerId, role);
    if (result.success) {
        revalidatePath('/admin/customers');
    }
    return result;
}

export async function getCustomerOrdersAction(
    customerId: string,
    page: number = 1,
): Promise<{ success: boolean; data?: import('@/types/admin-customer').AdminCustomerOrdersResult; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    return getAdminCustomerOrders(customerId, page);
}
