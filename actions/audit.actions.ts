'use server';

import { getUser } from '@/lib/auth/get-user';
import { getAdminAuditLogs } from '@/services/audit-viewer.service';
import type { AdminAuditFilters, AdminAuditResult } from '@/types/admin-audit';

export async function getAuditLogsAction(
    filters: AdminAuditFilters,
): Promise<{ success: boolean; data?: AdminAuditResult; error?: string }> {
    const user = await getUser();
    if (!user || user.role !== 'admin') {
        return { success: false, error: 'Not authenticated' };
    }

    return getAdminAuditLogs(filters);
}
