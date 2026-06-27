'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
    updateOrderStatusAction,
    editCustomerInfoAction,
    editShippingAddressAction,
    addOrderItemAction,
    removeOrderItemAction,
    searchVariantsAction,
} from '@/actions/order.actions';
import { updatePaymentRefsAction, approvePaymentAction, rejectPaymentAction } from '@/actions/payment.actions';
import { VALID_TRANSITIONS, ORDER_STATUSES } from '@/lib/constants/order';
import type { AdminOrderDetail } from '@/types/admin-order';

type OrderDetailViewProps = {
    order: AdminOrderDetail;
};

const statusBadgeVariant: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
    pending: 'warning',
    payment_pending: 'warning',
    paid: 'info',
    processing: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'error',
    refunded: 'error',
};

const statusLabel: Record<string, string> = {
    pending: 'Pending',
    payment_pending: 'Payment Pending',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
};

const paymentMethodLabel: Record<string, string> = {
    sslcommerz: 'SSLCommerz',
    bkash: 'bKash',
    nagad: 'Nagad',
    cash_on_delivery: 'Cash on Delivery',
};

const paymentStatusLabel: Record<string, string> = {
    pending: 'Pending',
    verified: 'Verified',
    failed: 'Failed',
    refunded: 'Refunded',
};

const paymentStatusVariant: Record<string, 'warning' | 'success' | 'error'> = {
    pending: 'warning',
    verified: 'success',
    failed: 'error',
    refunded: 'error',
};

const NON_EDITABLE_STATUSES = ['delivered', 'cancelled', 'refunded'];

export function OrderDetailView({ order }: OrderDetailViewProps) {
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState<string>(order.status);
    const [editMode, setEditMode] = useState(false);
    const canEdit = !NON_EDITABLE_STATUSES.includes(currentStatus);

    const availableTransitions = VALID_TRANSITIONS[currentStatus] ?? [];

    async function handleStatusChange(newStatus: string) {
        if (updating) return;
        setUpdating(true);
        setError(null);
        const result = await updateOrderStatusAction(order.id, currentStatus, newStatus);
        if (result.success) {
            setCurrentStatus(newStatus);
            setEditMode(false);
        } else {
            setError(result.error ?? 'Failed to update status');
        }
        setUpdating(false);
    }

    async function handleDeleteOrder() {
        if (!confirm('Delete this order? This will set status to Cancelled and release stock.')) return;
        await handleStatusChange('cancelled');
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Link
                    href="/admin/orders"
                    className="flex items-center gap-1 text-[14px] text-text-secondary hover:text-text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                </Link>
                <div className="flex items-center gap-2">
                    {!editMode ? (
                        <Button
                            onClick={() => canEdit && setEditMode(true)}
                            disabled={!canEdit}
                            variant="secondary"
                            size="sm"
                            title={canEdit ? 'Enable editing' : `Cannot edit ${currentStatus} orders`}
                        >
                            <Pencil className="w-4 h-4" />
                            Edit Order
                        </Button>
                    ) : (
                        <Button onClick={() => setEditMode(false)} variant="ghost" size="sm">
                            <X className="w-4 h-4" />
                            Cancel Edit
                        </Button>
                    )}
                    {availableTransitions.includes('cancelled') && (
                        <Button onClick={handleDeleteOrder} variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </Button>
                    )}
                </div>
            </div>

            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-[16px] font-semibold text-text-primary">
                        Order #{order.id.slice(0, 8)}
                    </h1>
                    <Badge variant={statusBadgeVariant[currentStatus] ?? 'warning'}>
                        {statusLabel[currentStatus]}
                    </Badge>
                </div>
                <p className="text-[14px] text-text-secondary mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>
            </div>

            {error && (
                <div className="bg-error-light border border-error rounded-md p-3 text-[14px] text-error">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[16px] font-semibold text-text-primary">Order Items</h2>
                            {editMode && (
                                <AddProductSection orderId={order.id} onError={setError} />
                            )}
                        </div>
                        {order.orderItems.length === 0 ? (
                            <p className="text-[14px] text-text-secondary py-4 text-center">No items in this order</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>Total</TableHead>
                                        {editMode && <TableHead></TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.orderItems.map((item) => {
                                        const productName = (item.product_snapshot as Record<string, unknown>)?.name ?? 'Product';
                                        const variantName = (item.variant_snapshot as Record<string, unknown>)?.sku ?? item.sku_snapshot;
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <span className="text-[14px] text-text-primary">{productName as string}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-[12px] font-mono text-text-muted">{variantName as string}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-[14px] text-text-secondary">{item.quantity}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-[14px] text-text-secondary">{formatCurrency(item.unit_price)}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-[14px] font-medium text-text-primary">{formatCurrency(item.unit_price * item.quantity)}</span>
                                                </TableCell>
                                                {editMode && (
                                                    <TableCell>
                                                        <RemoveItemButton orderItemId={item.id} orderId={order.id} onError={setError} />
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                        <div className="mt-4 pt-4 border-t border-border space-y-1">
                            <div className="flex justify-between text-[14px]">
                                <span className="text-text-secondary">Subtotal</span>
                                <span className="text-text-primary">{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-[14px]">
                                <span className="text-text-secondary">Shipping</span>
                                <span className="text-text-primary">{formatCurrency(order.shippingCost)}</span>
                            </div>
                            {order.discountTotal > 0 && (
                                <div className="flex justify-between text-[14px]">
                                    <span className="text-text-secondary">Discount</span>
                                    <span className="text-success">-{formatCurrency(order.discountTotal)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-[16px] font-semibold pt-1 border-t border-border">
                                <span className="text-text-primary">Grand Total</span>
                                <span className="text-text-primary">{formatCurrency(order.grandTotal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Records */}
                    <PaymentRecordsSection payments={order.payments} orderId={order.id} paymentMethod={order.paymentMethod} editMode={editMode} onError={setError} />
                </div>

                <div className="space-y-6">
                    <CustomerInfoSection order={order} editMode={editMode} onError={setError} />
                    <ShippingAddressSection order={order} editMode={editMode} onError={setError} />

                    {/* Status update - always available for admin */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <h2 className="text-[16px] font-semibold text-text-primary mb-4">Update Status</h2>
                        <div className="space-y-2">
                            <select
                                value=""
                                onChange={(e) => e.target.value && handleStatusChange(e.target.value)}
                                disabled={updating}
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary"
                            >
                                <option value="" disabled>Select new status...</option>
                                {ORDER_STATUSES.filter(s => s !== currentStatus).map((s) => (
                                    <option key={s} value={s}>{statusLabel[s]}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Customer Info ─── */

function CustomerInfoSection({ order, editMode, onError }: { order: AdminOrderDetail; editMode: boolean; onError: (msg: string | null) => void }) {
    const [editing, setEditing] = useState(false);
    const [email, setEmail] = useState(order.customerEmail ?? '');
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        setSaving(true);
        const result = await editCustomerInfoAction(order.id, { customerEmail: email || undefined });
        if (result.success) setEditing(false);
        else onError(result.error ?? 'Failed to update');
        setSaving(false);
    }

    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-semibold text-text-primary">Customer</h2>
                {editMode && !editing && (
                    <button onClick={() => setEditing(true)} className="p-1.5 rounded-md hover:bg-surface-secondary transition-colors text-text-muted hover:text-text-primary">
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
            </div>
            {editing ? (
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">Name</label>
                        <p className="text-[14px] text-text-primary">{order.customerName || 'Guest'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary" placeholder="customer@example.com" />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={saving} variant="primary" size="sm">{saving ? 'Saving...' : 'Save'}</Button>
                        <Button onClick={() => setEditing(false)} variant="ghost" size="sm">Cancel</Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <div><span className="text-[12px] font-medium uppercase tracking-wide text-text-secondary">Name</span><p className="text-[14px] text-text-primary mt-0.5">{order.customerName || 'Guest'}</p></div>
                    <div><span className="text-[12px] font-medium uppercase tracking-wide text-text-secondary">Email</span><p className="text-[14px] text-text-primary mt-0.5">{order.customerEmail || '-'}</p></div>
                    <div><span className="text-[12px] font-medium uppercase tracking-wide text-text-secondary">Payment Method</span><p className="text-[14px] text-text-primary mt-0.5">{paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod}</p></div>
                </div>
            )}
        </div>
    );
}

/* ─── Shipping Address ─── */

function ShippingAddressSection({ order, editMode, onError }: { order: AdminOrderDetail; editMode: boolean; onError: (msg: string | null) => void }) {
    const addr = order.shippingAddresses[0];
    if (!addr) return null;

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(addr.name);
    const [phone, setPhone] = useState(addr.phone);
    const [address, setAddress] = useState(addr.address);
    const [city, setCity] = useState(addr.city);
    const [district, setDistrict] = useState(addr.district);
    const [postalCode, setPostalCode] = useState(addr.postal_code);
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        setSaving(true);
        const result = await editShippingAddressAction(addr.id, order.id, { name, phone, address, city, district, postalCode });
        if (result.success) setEditing(false);
        else onError(result.error ?? 'Failed to update');
        setSaving(false);
    }

    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-semibold text-text-primary">Shipping Address</h2>
                {editMode && !editing && (
                    <button onClick={() => setEditing(true)} className="p-1.5 rounded-md hover:bg-surface-secondary transition-colors text-text-muted hover:text-text-primary">
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
            </div>
            {editing ? (
                <div className="space-y-3">
                    <InputField label="Name" value={name} onChange={setName} />
                    <InputField label="Phone" value={phone} onChange={setPhone} />
                    <InputField label="Address" value={address} onChange={setAddress} />
                    <div className="grid grid-cols-2 gap-3">
                        <InputField label="City" value={city} onChange={setCity} />
                        <InputField label="District" value={district} onChange={setDistrict} />
                    </div>
                    <InputField label="Postal Code" value={postalCode} onChange={setPostalCode} />
                    <div className="flex gap-2 pt-1">
                        <Button onClick={handleSave} disabled={saving} variant="primary" size="sm">{saving ? 'Saving...' : 'Save'}</Button>
                        <Button onClick={() => setEditing(false)} variant="ghost" size="sm">Cancel</Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-1 text-[14px] text-text-secondary">
                    <p className="text-text-primary font-medium">{addr.name}</p>
                    <p>{addr.phone}</p>
                    <p>{addr.address}</p>
                    <p>{[addr.city, addr.district, addr.postal_code].filter(Boolean).join(', ')}</p>
                </div>
            )}
        </div>
    );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">{label}</label>
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary" />
        </div>
    );
}

/* ─── Add Product ─── */

function AddProductSection({ orderId, onError }: { orderId: string; onError: (msg: string | null) => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<{ id: string; sku: string; price: number; stock: number; productName: string }[]>([]);
    const [searching, setSearching] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    async function handleSearch() {
        if (search.length < 2) return;
        setSearching(true);
        const result = await searchVariantsAction(search);
        if (result.success && result.data) setResults(result.data);
        setSearching(false);
    }

    async function handleAdd(variantId: string) {
        setAdding(true);
        const result = await addOrderItemAction(orderId, variantId, quantity);
        if (result.success) { setOpen(false); setSearch(''); setResults([]); setQuantity(1); }
        else onError(result.error ?? 'Failed to add item');
        setAdding(false);
    }

    if (!open) {
        return (
            <Button onClick={() => setOpen(true)} variant="secondary" size="sm">
                <Plus className="w-4 h-4" />Add Product
            </Button>
        );
    }

    return (
        <div className="bg-surface-secondary border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-text-primary">Add Product</span>
                <button onClick={() => { setOpen(false); setSearch(''); setResults([]); }} className="p-1 text-text-muted hover:text-text-primary">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="flex gap-2">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Search by SKU..." className="flex-1 bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary" />
                <Button onClick={handleSearch} disabled={searching || search.length < 2} variant="secondary" size="sm">Search</Button>
            </div>
            {results.length > 0 && (
                <div>
                    <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 bg-surface border border-border rounded-md px-3 py-1.5 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary mb-2" title="Quantity" />
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                        {results.map((v) => (
                            <div key={v.id} className="flex items-center justify-between px-3 py-2 bg-surface rounded-md border border-border hover:bg-surface-secondary transition-colors">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-medium text-text-primary truncate">{v.productName}</p>
                                    <p className="text-[11px] text-text-muted">{v.sku} · {formatCurrency(v.price)} · Stock: {v.stock}</p>
                                </div>
                                <Button onClick={() => handleAdd(v.id)} disabled={adding} variant="primary" size="sm" className="shrink-0 ml-3">{adding ? '...' : 'Add'}</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {searching && <p className="text-[13px] text-text-muted text-center py-2">Searching...</p>}
        </div>
    );
}

/* ─── Remove Item ─── */

function RemoveItemButton({ orderItemId, orderId, onError }: { orderItemId: string; orderId: string; onError: (msg: string | null) => void }) {
    const [confirming, setConfirming] = useState(false);
    const [removing, setRemoving] = useState(false);

    async function handleRemove() {
        setRemoving(true);
        const result = await removeOrderItemAction(orderItemId, orderId);
        if (!result.success) onError(result.error ?? 'Failed to remove item');
        setRemoving(false);
    }

    if (confirming) {
        return (
            <span className="inline-flex items-center gap-1 text-[13px]">
                <span className="text-text-muted">Remove?</span>
                <button onClick={handleRemove} disabled={removing} className="text-error hover:underline">{removing ? '...' : 'Yes'}</button>
                <button onClick={() => setConfirming(false)} className="text-text-secondary hover:underline">No</button>
            </span>
        );
    }

    return (
        <button onClick={() => setConfirming(true)} className="p-1.5 text-text-muted hover:text-error rounded hover:bg-error-light transition-colors" title="Remove item">
            <Trash2 className="w-4 h-4" />
        </button>
    );
}

/* ─── Payment Records ─── */

function PaymentRecordsSection({ payments, orderId, paymentMethod, editMode, onError }: { payments: AdminOrderDetail['payments']; orderId: string; paymentMethod: string; editMode: boolean; onError: (msg: string | null) => void }) {
    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
            <h2 className="text-[16px] font-semibold text-text-primary mb-4">Payment Records</h2>
            {payments.length === 0 ? (
                <p className="text-[14px] text-text-secondary">No payment records</p>
            ) : (
                <div className="space-y-3">
                    {payments.map((payment) => (
                        <PaymentRecordCard key={payment.id} payment={payment} orderId={orderId} paymentMethod={paymentMethod} editMode={editMode} onError={onError} />
                    ))}
                </div>
            )}
        </div>
    );
}

function PaymentRecordCard({ payment, orderId, paymentMethod, editMode, onError }: { payment: AdminOrderDetail['payments'][number]; orderId: string; paymentMethod: string; editMode: boolean; onError: (msg: string | null) => void }) {
    const [editing, setEditing] = useState(false);
    const [gatewayRef, setGatewayRef] = useState(payment.gateway_ref ?? '');
    const [txnId, setTxnId] = useState(payment.txn_id ?? '');
    const [paymentNumber, setPaymentNumber] = useState(payment.payment_number ?? '');
    const [saving, setSaving] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const isPending = payment.status === 'pending';

    async function handleSave() {
        setSaving(true);
        const result = await updatePaymentRefsAction(payment.id, orderId, { gatewayRef: gatewayRef || undefined, txnId: txnId || undefined, paymentNumber: paymentNumber || undefined });
        if (result.success) setEditing(false);
        else onError(result.error ?? 'Failed to update');
        setSaving(false);
    }

    async function handleVerify() {
        if (!confirm('Verify this payment? This will decrement stock and mark the order as Paid.')) return;
        setVerifying(true);
        const result = await approvePaymentAction(orderId);
        if (!result.success) onError(result.error ?? 'Verification failed');
        setVerifying(false);
    }

    async function handleFail() {
        if (!confirm('Mark this payment as Failed? This will release reserved stock and cancel the order.')) return;
        setVerifying(true);
        const result = await rejectPaymentAction(orderId);
        if (!result.success) onError(result.error ?? 'Rejection failed');
        setVerifying(false);
    }

    return (
        <div className="bg-surface-secondary rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-text-primary">{formatCurrency(payment.amount)} {payment.currency}</span>
                <div className="flex items-center gap-2">
                    <Badge variant={paymentStatusVariant[payment.status] ?? 'warning'}>{paymentStatusLabel[payment.status]}</Badge>
                    {editMode && !editing && (
                        <button onClick={() => setEditing(true)} className="p-1 rounded hover:bg-surface-tertiary transition-colors text-text-muted hover:text-text-primary">
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {editMode && isPending && (
                        <div className="flex items-center gap-1 ml-1">
                            <Button onClick={handleVerify} disabled={verifying} variant="primary" size="sm">{verifying ? '...' : 'Verify'}</Button>
                            <Button onClick={handleFail} disabled={verifying} variant="destructive" size="sm">{verifying ? '...' : 'Fail'}</Button>
                        </div>
                    )}
                </div>
            </div>
            {editing ? (
                <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[11px] text-text-muted">Gateway Ref</label>
                            <input type="text" value={gatewayRef} onChange={(e) => setGatewayRef(e.target.value)} className="w-full bg-surface border border-border rounded-md px-2 py-1.5 text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary" />
                        </div>
                        <div>
                            <label className="text-[11px] text-text-muted">Txn ID</label>
                            <input type="text" value={txnId} onChange={(e) => setTxnId(e.target.value)} className="w-full bg-surface border border-border rounded-md px-2 py-1.5 text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary" />
                        </div>
                        <div>
                            <label className="text-[11px] text-text-muted">Payment Number</label>
                            <input type="text" value={paymentNumber} onChange={(e) => setPaymentNumber(e.target.value)} className="w-full bg-surface border border-border rounded-md px-2 py-1.5 text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={saving} variant="primary" size="sm">{saving ? 'Saving...' : 'Save'}</Button>
                        <Button onClick={() => setEditing(false)} variant="ghost" size="sm">Cancel</Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-text-muted">
                    <span>Gateway Ref: {payment.gateway_ref || '-'}</span>
                    <span>TxnID: {payment.txn_id || '-'}</span>
                    <span>Payment #: {payment.payment_number || '-'}</span>
                    {payment.verified_at && <span>Verified: {new Date(payment.verified_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
            )}
        </div>
    );
}
