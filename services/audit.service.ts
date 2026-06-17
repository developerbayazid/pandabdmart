import { insertAuditLog } from '@/repositories/audit.repository';

type AuditInput = {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    meta?: Record<string, unknown>;
};

export async function logAuditEvent(input: AuditInput): Promise<void> {
    try {
        await insertAuditLog({
            actorId: input.actorId,
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId,
            meta: input.meta,
        });
    } catch (error) {
        console.error('[services/audit] logAuditEvent:', error);
    }
}
