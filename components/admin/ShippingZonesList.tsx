'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import {
    createShippingZoneAction,
    updateShippingZoneAction,
    deleteShippingZoneAction,
} from '@/actions/shipping.actions';
import type { AdminShippingZoneListItem, AdminShippingZoneFormData } from '@/types/admin-shipping';

type ShippingZonesListProps = {
    initialData: AdminShippingZoneListItem[] | null;
};

type ZoneFormState = {
    mode: 'create' | 'edit';
    zoneId?: string;
    name: string;
    cost: string;
    description: string;
};

export function ShippingZonesList({ initialData }: ShippingZonesListProps) {
    const router = useRouter();
    const zones = initialData ?? [];

    const [form, setForm] = useState<ZoneFormState | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    function openCreateForm() {
        setForm({
            mode: 'create',
            name: '',
            cost: '',
            description: '',
        });
        setError(null);
    }

    function openEditForm(zone: AdminShippingZoneListItem) {
        setForm({
            mode: 'edit',
            zoneId: zone.id,
            name: zone.name,
            cost: zone.cost.toString(),
            description: zone.description ?? '',
        });
        setError(null);
    }

    function closeForm() {
        setForm(null);
        setError(null);
    }

    async function handleSave() {
        if (!form) return;

        const formData: AdminShippingZoneFormData = {
            name: form.name,
            cost: parseFloat(form.cost) || 0,
            description: form.description || null,
        };

        setSaving(true);
        setError(null);

        let result;
        if (form.mode === 'create') {
            result = await createShippingZoneAction(formData);
        } else if (form.zoneId) {
            result = await updateShippingZoneAction(form.zoneId, formData);
        }

        if (result?.success) {
            closeForm();
            router.refresh();
        } else {
            setError(result?.error ?? 'Action failed');
        }
        setSaving(false);
    }

    async function handleDelete(zoneId: string) {
        setDeleting(zoneId);
        const result = await deleteShippingZoneAction(zoneId);
        if (result.success) {
            router.refresh();
        } else {
            setError(result.error ?? 'Failed to delete shipping zone');
            setDeleting(null);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-end">
                <Button variant="primary" size="sm" onClick={openCreateForm}>
                    <Plus className="w-4 h-4" />
                    New Zone
                </Button>
            </div>

            {form && (
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)] space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[16px] font-semibold text-text-primary">
                            {form.mode === 'create' ? 'New Shipping Zone' : 'Edit Shipping Zone'}
                        </h2>
                        <button
                            onClick={closeForm}
                            className="p-1 text-text-muted hover:text-text-primary transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-error-light border border-error/20 rounded-md px-4 py-3 text-[14px] text-error">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                Zone Name
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev!, name: e.target.value }))
                                }
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                placeholder="e.g. Inside Dhaka"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                Cost (৳)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.cost}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev!, cost: e.target.value }))
                                }
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                placeholder="e.g. 5"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                Description
                            </label>
                            <input
                                type="text"
                                value={form.description}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev!, description: e.target.value }))
                                }
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                placeholder="e.g. Standard delivery within Dhaka metropolitan area"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Button variant="primary" onClick={handleSave} disabled={saving}>
                            {saving
                                ? 'Saving...'
                                : form.mode === 'create'
                                  ? 'Create Zone'
                                  : 'Save Changes'}
                        </Button>
                        <Button variant="secondary" onClick={closeForm} disabled={saving}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                {zones.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-4">
                            <TruckIcon />
                        </div>
                        <p className="text-[14px] text-text-secondary mb-4">No shipping zones yet</p>
                        <Button variant="secondary" onClick={openCreateForm}>
                            <Plus className="w-4 h-4" />
                            Create your first zone
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-24">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {zones.map((zone) => (
                                <TableRow key={zone.id}>
                                    <TableCell className="font-medium">
                                        {zone.name}
                                    </TableCell>
                                    <TableCell className="text-text-secondary">
                                        ৳{zone.cost.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-text-secondary">
                                        {zone.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openEditForm(zone)}
                                                className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-surface-tertiary transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(zone.id)}
                                                disabled={deleting === zone.id}
                                                className="p-1.5 text-text-muted hover:text-error rounded hover:bg-error-light transition-colors disabled:opacity-50"
                                            >
                                                {deleting === zone.id ? (
                                                    <span className="text-[11px]">...</span>
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}

function TruckIcon() {
    return (
        <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
    );
}
