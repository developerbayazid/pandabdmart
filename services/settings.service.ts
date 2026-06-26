import { getAdminSettings, updateSettings } from '@/repositories/settings.repository';
import { logAuditEvent } from '@/services/audit.service';
import type { AdminSettingsData, AdminSettingsFormData } from '@/types/admin-settings';

export async function getAdminSettingsData(): Promise<{
    success: boolean;
    data?: AdminSettingsData;
    error?: string;
}> {
    try {
        const result = await getAdminSettings();
        if (!result) {
            return { success: false, error: 'Store settings not found' };
        }
        return { success: true, data: result };
    } catch (error) {
        console.error('[services/settings] getAdminSettingsData:', error);
        return { success: false, error: 'Failed to load store settings' };
    }
}

export async function updateAdminSettings(
    actorId: string,
    settingsId: string,
    data: Partial<AdminSettingsFormData>,
): Promise<{ success: boolean; error?: string }> {
    try {
        if (data.storeName !== undefined && !data.storeName.trim()) {
            return { success: false, error: 'Store name is required' };
        }
        if (data.lowStockThreshold !== undefined && data.lowStockThreshold < 1) {
            return { success: false, error: 'Low stock threshold must be at least 1' };
        }
        if (data.stockReservationMinutes !== undefined && data.stockReservationMinutes < 1) {
            return { success: false, error: 'Stock reservation minutes must be at least 1' };
        }

        await updateSettings(settingsId, data);

        await logAuditEvent({
            actorId,
            action: 'store_settings.update',
            entityType: 'store_settings',
            entityId: settingsId,
            meta: data as Record<string, unknown>,
        });

        return { success: true };
    } catch (error) {
        console.error('[services/settings] updateAdminSettings:', error);
        return { success: false, error: 'Failed to update store settings' };
    }
}
