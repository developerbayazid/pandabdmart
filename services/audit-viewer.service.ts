import { getAuditLogs } from '@/repositories/audit.repository';
import type { AdminAuditFilters, AdminAuditResult } from '@/types/admin-audit';

export async function getAdminAuditLogs(
    filters: AdminAuditFilters,
): Promise<{ success: boolean; data?: AdminAuditResult; error?: string }> {
    try {
        const result = await getAuditLogs({
            page: filters.page ?? 1,
            action: filters.action,
            entityType: filters.entityType,
            actorName: filters.actorName,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
        });
        return { success: true, data: result };
    } catch (error) {
        console.error('[services/audit-viewer] getAdminAuditLogs:', error);
        return { success: false, error: 'Failed to load audit logs' };
    }
}
