import {
    getAdminShippingZones,
    createShippingZone as createShippingZoneInDb,
    updateShippingZone as updateShippingZoneInDb,
    deleteShippingZone as deleteShippingZoneInDb,
} from '@/repositories/shipping.repository';
import { logAuditEvent } from '@/services/audit.service';
import type { AdminShippingZoneListItem, AdminShippingZoneFormData } from '@/types/admin-shipping';

export async function getAdminShippingZoneList(): Promise<{
    success: boolean;
    data?: AdminShippingZoneListItem[];
    error?: string;
}> {
    try {
        const result = await getAdminShippingZones();
        return { success: true, data: result };
    } catch (error) {
        console.error('[services/shipping] getAdminShippingZoneList:', error);
        return { success: false, error: 'Failed to load shipping zones' };
    }
}

export async function createShippingZone(
    actorId: string,
    data: AdminShippingZoneFormData,
): Promise<{ success: boolean; zoneId?: string; error?: string }> {
    try {
        if (!data.name.trim()) {
            return { success: false, error: 'Zone name is required' };
        }
        if (data.cost < 0) {
            return { success: false, error: 'Cost must be 0 or greater' };
        }

        const zoneId = await createShippingZoneInDb(data);

        await logAuditEvent({
            actorId,
            action: 'shipping_zone.create',
            entityType: 'shipping_zone',
            entityId: zoneId,
            meta: { name: data.name },
        });

        return { success: true, zoneId };
    } catch (error) {
        console.error('[services/shipping] createShippingZone:', error);
        return { success: false, error: 'Failed to create shipping zone' };
    }
}

export async function updateShippingZone(
    actorId: string,
    zoneId: string,
    data: Partial<AdminShippingZoneFormData>,
): Promise<{ success: boolean; error?: string }> {
    try {
        if (data.name !== undefined && !data.name.trim()) {
            return { success: false, error: 'Zone name is required' };
        }
        if (data.cost !== undefined && data.cost < 0) {
            return { success: false, error: 'Cost must be 0 or greater' };
        }

        await updateShippingZoneInDb(zoneId, data);

        await logAuditEvent({
            actorId,
            action: 'shipping_zone.update',
            entityType: 'shipping_zone',
            entityId: zoneId,
            meta: data as Record<string, unknown>,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/shipping] updateShippingZone:', error);
        return { success: false, error: 'Failed to update shipping zone' };
    }
}

export async function deleteShippingZone(
    actorId: string,
    zoneId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteShippingZoneInDb(zoneId);

        await logAuditEvent({
            actorId,
            action: 'shipping_zone.delete',
            entityType: 'shipping_zone',
            entityId: zoneId,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/shipping] deleteShippingZone:', error);
        return { success: false, error: 'Failed to delete shipping zone' };
    }
}
