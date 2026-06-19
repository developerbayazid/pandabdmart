'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import type { AdminAuditLogEntry, AdminAuditResult } from '@/types/admin-audit';

type AuditLogListProps = {
    initialData: AdminAuditResult | null;
    currentAction: string;
    currentEntityType: string;
    currentActorName: string;
    currentDateFrom: string;
    currentDateTo: string;
};

function formatDateTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const ENTITY_TYPES = [
    { value: '', label: 'All entities' },
    { value: 'product', label: 'Product' },
    { value: 'category', label: 'Category' },
    { value: 'brand', label: 'Brand' },
    { value: 'order', label: 'Order' },
    { value: 'user', label: 'User' },
    { value: 'coupon', label: 'Coupon' },
    { value: 'shipping_zone', label: 'Shipping Zone' },
    { value: 'payment', label: 'Payment' },
];

const ACTION_TYPES = [
    { value: '', label: 'All actions' },
    { value: 'product.create', label: 'Product Created' },
    { value: 'product.update', label: 'Product Updated' },
    { value: 'product.delete', label: 'Product Deleted' },
    { value: 'category.create', label: 'Category Created' },
    { value: 'category.update', label: 'Category Updated' },
    { value: 'category.delete', label: 'Category Deleted' },
    { value: 'brand.create', label: 'Brand Created' },
    { value: 'brand.update', label: 'Brand Updated' },
    { value: 'brand.delete', label: 'Brand Deleted' },
    { value: 'order.status_update', label: 'Order Status Updated' },
    { value: 'order.payment_reset', label: 'Order Payment Reset' },
    { value: 'payment.verify', label: 'Payment Verified' },
    { value: 'payment.fail', label: 'Payment Failed' },
    { value: 'coupon.create', label: 'Coupon Created' },
    { value: 'coupon.update', label: 'Coupon Updated' },
    { value: 'coupon.delete', label: 'Coupon Deleted' },
    { value: 'shipping_zone.create', label: 'Shipping Zone Created' },
    { value: 'shipping_zone.update', label: 'Shipping Zone Updated' },
    { value: 'shipping_zone.delete', label: 'Shipping Zone Deleted' },
    { value: 'customer.deactivate', label: 'Customer Deactivated' },
    { value: 'customer.reactivate', label: 'Customer Reactivated' },
    { value: 'customer.role_update', label: 'Customer Role Updated' },
];

export function AuditLogList({
    initialData,
    currentAction,
    currentEntityType,
    currentActorName,
    currentDateFrom,
    currentDateTo,
}: AuditLogListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [action, setAction] = useState(currentAction);
    const [entityType, setEntityType] = useState(currentEntityType);
    const [actorName, setActorName] = useState(currentActorName);
    const [dateFrom, setDateFrom] = useState(currentDateFrom);
    const [dateTo, setDateTo] = useState(currentDateTo);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const data = initialData ?? { logs: [], total: 0, page: 1, totalPages: 1 };

    function applyFilters() {
        const params = new URLSearchParams();
        if (action) params.set('action', action);
        if (entityType) params.set('entityType', entityType);
        if (actorName) params.set('actorName', actorName);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);
        setLoading(true);
        router.push(`/admin/audit-logs?${params.toString()}`);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    }

    function handlePageChange(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        setLoading(true);
        router.push(`/admin/audit-logs?${params.toString()}`);
    }

    function toggleExpand(id: string) {
        setExpandedId(expandedId === id ? null : id);
    }

    function getActionBadgeVariant(actionType: string): 'neutral' | 'success' | 'warning' | 'error' | 'info' {
        if (actionType.includes('.create')) return 'success';
        if (actionType.includes('.delete')) return 'error';
        if (actionType.includes('.update') || actionType.includes('.status_update')) return 'warning';
        if (actionType.includes('.verify')) return 'success';
        if (actionType.includes('.fail')) return 'error';
        if (actionType.includes('.deactivate')) return 'error';
        if (actionType.includes('.reactivate')) return 'success';
        return 'neutral';
    }

    return (
        <div className="space-y-4">
            <div className="bg-surface border border-border rounded-2xl p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[160px]">
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Action
                        </label>
                        <select
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-text-primary"
                        >
                            {ACTION_TYPES.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Entity
                        </label>
                        <select
                            value={entityType}
                            onChange={(e) => setEntityType(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-text-primary"
                        >
                            {ENTITY_TYPES.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[160px]">
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Actor
                        </label>
                        <input
                            type="text"
                            value={actorName}
                            onChange={(e) => setActorName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search by name..."
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary"
                        />
                    </div>

                    <div className="w-[160px]">
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            From
                        </label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                        />
                    </div>

                    <div className="w-[160px]">
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            To
                        </label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                        />
                    </div>

                    <button
                        onClick={applyFilters}
                        disabled={loading}
                        className="px-4 py-2 bg-surface-inverse text-text-inverse text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Filtering...' : 'Apply'}
                    </button>
                </div>
            </div>

            {loading && (
                <div className="text-center py-4">
                    <span className="text-[14px] text-text-secondary">Loading...</span>
                </div>
            )}

            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                {data.logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-text-muted" />
                        </div>
                        <p className="text-[14px] text-text-secondary">
                            {initialData === null
                                ? 'Could not load audit logs'
                                : 'No audit logs match your filters'}
                        </p>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10"></TableHead>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Actor</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Entity ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <button
                                                onClick={() => toggleExpand(log.id)}
                                                className="p-0.5 text-text-muted hover:text-text-primary transition-colors"
                                                title={log.meta ? 'View meta' : 'No meta'}
                                            >
                                                {log.meta ? (
                                                    expandedId === log.id ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )
                                                ) : (
                                                    <span className="w-4 h-4 block" />
                                                )}
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-text-secondary whitespace-nowrap text-[13px]">
                                            {formatDateTime(log.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-text-primary">
                                            {log.actorName ?? (
                                                <span className="text-text-muted text-[13px]">
                                                    {log.actorId.slice(0, 8)}...
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getActionBadgeVariant(log.action)}>
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-text-secondary">
                                            {log.entityType}
                                        </TableCell>
                                        <TableCell className="text-text-muted font-mono text-[13px]">
                                            {log.entityId.slice(0, 8)}...
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {expandedId && (() => {
                            const log = data.logs.find((l) => l.id === expandedId);
                            if (!log?.meta) return null;
                            return (
                                <div className="border-t border-border px-6 py-4 bg-surface-secondary">
                                    <div className="text-[13px] font-medium text-text-primary mb-2">
                                        Meta Payload
                                    </div>
                                    <pre className="text-[13px] text-text-secondary font-mono whitespace-pre-wrap overflow-x-auto max-h-[300px] overflow-y-auto">
                                        {JSON.stringify(log.meta, null, 2)}
                                    </pre>
                                </div>
                            );
                        })()}

                        {data.totalPages > 1 && (
                            <div className="border-t border-border px-6 py-3 flex justify-center">
                                <Pagination
                                    currentPage={data.page}
                                    totalPages={data.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
