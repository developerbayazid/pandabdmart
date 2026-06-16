'use client';

import { useState, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addAddressAction, updateAddressAction, deleteAddressAction } from '@/actions/address.actions';
import type { Address } from '@/repositories/address.repository';
import { Trash2, Edit2, Plus, Loader2 } from 'lucide-react';

type AddressBookProps = {
    addresses: Address[];
};

export function AddressBook({ addresses }: AddressBookProps) {
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [addState, addFormAction] = useActionState(addAddressAction, null);
    const [editState, editFormAction] = useActionState(updateAddressAction, null);

    const handleAddClose = () => {
        setShowForm(false);
    };

    const handleEditClose = () => {
        setEditingAddress(null);
    };

    const handleDelete = async (addrId: string) => {
        setDeletingId(addrId);
        await deleteAddressAction(addrId);
        setDeletingId(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-text-primary">Address Book</h3>
                {!showForm && !editingAddress && (
                    <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4" />
                        Add Address
                    </Button>
                )}
            </div>

            {showForm && (
                <div className="bg-surface-secondary border border-border rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-text-primary mb-3">New Address</h4>
                    <AddressFormContents
                        formAction={addFormAction}
                        state={addState}
                        onClose={handleAddClose}
                        submitLabel="Save Address"
                    />
                </div>
            )}

            {editingAddress && (
                <div className="bg-surface-secondary border border-border rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-text-primary mb-3">Edit Address</h4>
                    <AddressFormContents
                        formAction={editFormAction}
                        state={editState}
                        onClose={handleEditClose}
                        addressId={editingAddress.id}
                        initialValues={{
                            name: editingAddress.name,
                            phone: editingAddress.phone,
                            address: editingAddress.address,
                            city: editingAddress.city,
                            district: editingAddress.district,
                            postalCode: editingAddress.postalCode ?? '',
                            isDefault: editingAddress.isDefault,
                        }}
                        submitLabel="Update Address"
                    />
                </div>
            )}

            {addresses.length === 0 && !showForm && !editingAddress ? (
                <p className="text-sm text-text-secondary py-3">No saved addresses.</p>
            ) : (
                <div className="space-y-3">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className="bg-surface border border-border rounded-xl p-4 flex items-start justify-between gap-4"
                        >
                            <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-text-primary">{addr.name}</span>
                                    {addr.isDefault && (
                                        <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded-full bg-surface-inverse text-text-inverse">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-text-secondary">{addr.phone}</p>
                                <p className="text-sm text-text-secondary truncate">
                                    {addr.address}, {addr.city}, {addr.district}{addr.postalCode ? ` - ${addr.postalCode}` : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setEditingAddress(addr)}
                                    className="p-1.5 text-text-muted hover:text-text-primary rounded-md hover:bg-surface-secondary transition-colors"
                                    aria-label="Edit address"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(addr.id)}
                                    disabled={deletingId === addr.id}
                                    className="p-1.5 text-text-muted hover:text-error rounded-md hover:bg-error-light transition-colors disabled:opacity-50"
                                    aria-label="Delete address"
                                >
                                    {deletingId === addr.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

type AddressFormContentsProps = {
    formAction: (formData: FormData) => void;
    state: { success: boolean; error?: string } | null;
    onClose: () => void;
    addressId?: string;
    initialValues?: {
        name: string;
        phone: string;
        address: string;
        city: string;
        district: string;
        postalCode: string;
        isDefault: boolean;
    };
    submitLabel: string;
};

function AddressFormContents({ formAction, state, onClose, addressId, initialValues, submitLabel }: AddressFormContentsProps) {
    return (
        <form action={formAction} className="space-y-3">
            {addressId && <input type="hidden" name="addressId" value={addressId} />}
            {state?.error && (
                <div className="bg-error-light text-error-foreground text-xs p-2 rounded-md">{state.error}</div>
            )}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="address-name" className="block text-xs text-text-secondary uppercase tracking-wide mb-1">
                        Name
                    </label>
                    <Input id="address-name" name="name" required defaultValue={initialValues?.name ?? ''} placeholder="Full name" />
                </div>
                <div>
                    <label htmlFor="address-phone" className="block text-xs text-text-secondary uppercase tracking-wide mb-1">
                        Phone
                    </label>
                    <Input id="address-phone" name="phone" type="tel" required defaultValue={initialValues?.phone ?? ''} placeholder="Phone number" />
                </div>
            </div>
            <div>
                <label htmlFor="address-line" className="block text-xs text-text-secondary uppercase tracking-wide mb-1">
                    Address
                </label>
                <Input id="address-line" name="address" required defaultValue={initialValues?.address ?? ''} placeholder="Street address" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="address-city" className="block text-xs text-text-secondary uppercase tracking-wide mb-1">
                        City
                    </label>
                    <Input id="address-city" name="city" required defaultValue={initialValues?.city ?? ''} placeholder="City" />
                </div>
                <div>
                    <label htmlFor="address-district" className="block text-xs text-text-secondary uppercase tracking-wide mb-1">
                        District
                    </label>
                    <Input id="address-district" name="district" required defaultValue={initialValues?.district ?? ''} placeholder="District" />
                </div>
            </div>
            <div>
                <label htmlFor="address-postal" className="block text-xs text-text-secondary uppercase tracking-wide mb-1">
                    Postal Code
                </label>
                <Input id="address-postal" name="postalCode" defaultValue={initialValues?.postalCode ?? ''} placeholder="Postal code" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    name="isDefault"
                    defaultChecked={initialValues?.isDefault ?? false}
                    className="w-4 h-4 rounded border-border text-text-primary focus:ring-text-primary"
                />
                <span className="text-sm text-text-secondary">Set as default address</span>
            </label>
            <div className="flex items-center gap-2">
                <Button type="submit" size="sm">{submitLabel}</Button>
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            </div>
        </form>
    );
}
