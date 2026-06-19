import { Suspense } from 'react';
import { getAdminAuditLogs } from '@/services/audit-viewer.service';
import { AuditLogList } from '@/components/admin/AuditLogList';
import { requireRole } from '@/lib/auth/require-role';
import { PageSpinner } from '@/components/ui/PageSpinner';
import type { AdminAuditFilters } from '@/types/admin-audit';

type SearchParams = Promise<Record<string, string | undefined>>;

export default function AdminAuditLogsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    return (
        <Suspense fallback={<PageSpinner />}>
            <AuditLogsContent searchParams={searchParams} />
        </Suspense>
    );
}

async function AuditLogsContent({ searchParams }: { searchParams: SearchParams }) {
    await requireRole('admin');

    const params = await searchParams;

    const filters: AdminAuditFilters = {
        page: params.page ? parseInt(params.page) : 1,
        action: params.action,
        entityType: params.entityType,
        actorName: params.actorName,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
    };

    const result = await getAdminAuditLogs(filters);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[16px] font-semibold text-text-primary">Audit Logs</h1>
                <p className="text-[14px] text-text-secondary mt-1">
                    Track all administrative actions across the platform
                </p>
            </div>

            <AuditLogList
                initialData={result.success && result.data ? result.data : null}
                currentAction={filters.action ?? ''}
                currentEntityType={filters.entityType ?? ''}
                currentActorName={filters.actorName ?? ''}
                currentDateFrom={filters.dateFrom ?? ''}
                currentDateTo={filters.dateTo ?? ''}
            />
        </div>
    );
}
