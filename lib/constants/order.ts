export const ORDER_STATUSES = [
    'pending',
    'payment_pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const VALID_TRANSITIONS: Record<string, string[]> = {
    pending: ['cancelled'],
    payment_pending: ['cancelled'],
    paid: ['processing', 'refunded', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
    refunded: [],
};
