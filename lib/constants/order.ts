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
