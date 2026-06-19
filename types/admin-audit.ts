export type AdminAuditLogEntry = {
    id: string;
    actorId: string;
    actorName: string | null;
    action: string;
    entityType: string;
    entityId: string;
    meta: Record<string, unknown> | null;
    createdAt: string;
};

export type AdminAuditFilters = {
    page?: number;
    action?: string;
    entityType?: string;
    actorName?: string;
    dateFrom?: string;
    dateTo?: string;
};

export type AdminAuditResult = {
    logs: AdminAuditLogEntry[];
    total: number;
    page: number;
    totalPages: number;
};
