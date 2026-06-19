import { createClient } from '@/lib/supabase/server';
import type { AdminAuditLogEntry } from '@/types/admin-audit';

type AuditEntry = {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    meta?: Record<string, unknown>;
};

export async function insertAuditLog(entry: AuditEntry): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('audit_logs').insert({
        actor_id: entry.actorId,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        meta: entry.meta ?? null,
    });

    if (error) {
        console.error('[repositories/audit] insertAuditLog:', error);
    }
}

export async function getAuditLogs({
    page = 1,
    limit = 20,
    action,
    entityType,
    actorName,
    dateFrom,
    dateTo,
}: {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    actorName?: string;
    dateFrom?: string;
    dateTo?: string;
}): Promise<{ logs: AdminAuditLogEntry[]; total: number; page: number; totalPages: number }> {
    const supabase = await createClient();

    let query = supabase
        .from('audit_logs')
        .select(
            'id, actor_id, action, entity_type, entity_id, meta, created_at, user:users!inner(full_name)',
            { count: 'exact' },
        )
        .order('created_at', { ascending: false });

    if (action) {
        query = query.eq('action', action);
    }
    if (entityType) {
        query = query.eq('entity_type', entityType);
    }
    if (actorName) {
        query = query.ilike('user.full_name', `%${actorName}%`);
    }
    if (dateFrom) {
        query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
        query = query.lte('created_at', dateTo);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error('[repositories/audit] getAuditLogs:', error);
        return { logs: [], total: 0, page: 1, totalPages: 0 };
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const logs: AdminAuditLogEntry[] = (data ?? []).map((row) => {
        const userData = row.user as unknown as { full_name: string | null }[] | null;
        const actorName = userData?.[0]?.full_name ?? null;
        return {
            id: row.id as string,
            actorId: row.actor_id as string,
            actorName,
            action: row.action as string,
            entityType: row.entity_type as string,
            entityId: row.entity_id as string,
            meta: row.meta as Record<string, unknown> | null,
            createdAt: row.created_at as string,
        };
    });

    return { logs, total, page, totalPages };
}
