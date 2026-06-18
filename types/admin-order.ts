import type { OrderStatus } from '@/lib/constants/order';
import type { OrderPayment, OrderShipping, OrderItemSnapshot } from '@/types/order';

export type AdminOrderFilters = {
    search?: string;
    status?: OrderStatus;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
};

export type AdminOrderListItem = {
    id: string;
    userId: string;
    customerName: string | null;
    customerEmail: string | null;
    status: OrderStatus;
    paymentMethod: string;
    subtotal: number;
    shippingCost: number;
    discountTotal: number;
    grandTotal: number;
    itemCount: number;
    createdAt: string;
};

export type AdminOrderDetail = {
    id: string;
    userId: string;
    customerName: string | null;
    customerEmail: string | null;
    status: OrderStatus;
    paymentMethod: string;
    subtotal: number;
    shippingCost: number;
    discountTotal: number;
    grandTotal: number;
    createdAt: string;
    updatedAt: string;
    orderItems: OrderItemSnapshot[];
    payments: OrderPayment[];
    shippingAddresses: OrderShipping[];
};

export type AdminEditCustomerInfo = {
    customerEmail?: string;
};

export type AdminEditShippingAddress = {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    district?: string;
    postalCode?: string;
};

export type AdminAddOrderItemInput = {
    orderId: string;
    variantId: string;
    quantity: number;
};
