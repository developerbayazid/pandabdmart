import {
    getAdminCustomers,
    getAdminCustomerById,
    getCustomerOrders,
    deactivateCustomer,
    reactivateCustomer,
    updateCustomerRole,
} from '@/repositories/customer.repository';
import { logAuditEvent } from '@/services/audit.service';
import type {
    AdminCustomerListResult,
    AdminCustomerDetail,
    AdminCustomerOrdersResult,
    AdminCustomerFilters,
} from '@/types/admin-customer';

export async function getAdminCustomerList(
    filters: AdminCustomerFilters,
): Promise<{ success: boolean; data?: AdminCustomerListResult; error?: string }> {
    try {
        const result = await getAdminCustomers(filters);
        return { success: true, data: result };
    } catch (error) {
        console.error('[services/customer] getAdminCustomerList:', error);
        return { success: false, error: 'Failed to load customers' };
    }
}

export async function getAdminCustomerDetail(
    id: string,
): Promise<{ success: boolean; data?: AdminCustomerDetail; error?: string }> {
    try {
        const result = await getAdminCustomerById(id);
        if (!result) return { success: false, error: 'Customer not found' };
        return { success: true, data: result };
    } catch (error) {
        console.error('[services/customer] getAdminCustomerDetail:', error);
        return { success: false, error: 'Failed to load customer details' };
    }
}

export async function getAdminCustomerOrders(
    customerId: string,
    page: number = 1,
): Promise<{ success: boolean; data?: AdminCustomerOrdersResult; error?: string }> {
    try {
        const result = await getCustomerOrders(customerId, page);
        return { success: true, data: result };
    } catch (error) {
        console.error('[services/customer] getAdminCustomerOrders:', error);
        return { success: false, error: 'Failed to load customer orders' };
    }
}

export async function deactivateCustomerAction(
    actorId: string,
    customerId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        await deactivateCustomer(customerId);

        await logAuditEvent({
            actorId,
            action: 'customer.deactivate',
            entityType: 'user',
            entityId: customerId,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/customer] deactivateCustomerAction:', error);
        return { success: false, error: 'Failed to deactivate customer' };
    }
}

export async function reactivateCustomerAction(
    actorId: string,
    customerId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        await reactivateCustomer(customerId);

        await logAuditEvent({
            actorId,
            action: 'customer.reactivate',
            entityType: 'user',
            entityId: customerId,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/customer] reactivateCustomerAction:', error);
        return { success: false, error: 'Failed to reactivate customer' };
    }
}

export async function updateCustomerRoleAction(
    actorId: string,
    customerId: string,
    role: 'customer' | 'shop_manager',
): Promise<{ success: boolean; error?: string }> {
    try {
        await updateCustomerRole(customerId, role);

        await logAuditEvent({
            actorId,
            action: 'customer.role_update',
            entityType: 'user',
            entityId: customerId,
            meta: { newRole: role },
        });

        return { success: true };
    } catch (error) {
        console.error('[services/customer] updateCustomerRoleAction:', error);
        return { success: false, error: 'Failed to update customer role' };
    }
}
