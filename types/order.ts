import type { OrderStatus } from '@/lib/constants/order';

export type OrderPayment = {
    id: string;
    order_id: string;
    status: 'pending' | 'verified' | 'failed' | 'refunded';
    amount: number;
    currency: string;
    gateway_ref: string | null;
    txn_id: string | null;
    payment_number: string | null;
    verified_by: string | null;
    verified_at: string | null;
    created_at: string;
};

export type OrderShipping = {
    id: string;
    order_id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    postal_code: string;
};

export type OrderItemSnapshot = {
    id: string;
    order_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
    discount_applied: number;
    product_snapshot: Record<string, unknown> | null;
    variant_snapshot: Record<string, unknown> | null;
    sku_snapshot: string | null;
};

export type Order = {
    id: string;
    user_id: string;
    status: OrderStatus;
    payment_method: string;
    subtotal: number;
    shipping_cost: number;
    discount_total: number;
    grand_total: number;
    created_at: string;
    updated_at: string;
    order_items: OrderItemSnapshot[];
    payments: OrderPayment[];
    shipping_addresses: OrderShipping[];
};

export type OrderLookupInput = {
    orderId: string;
    email?: string;
    phone?: string;
};
