import { CartItem } from './cart';

export type ShippingFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    postalCode: string;
    country: string;
    addressLabel: 'home' | 'work' | 'partner' | null;
    saveInfo: boolean;
};

export type PaymentMethod = 'sslcommerz' | 'bkash' | 'nagad' | 'cash_on_delivery';

export type CheckoutState = {
    shipping: ShippingFormData;
    zoneId: string | null;
    paymentMethod: PaymentMethod;
    txnId: string;
    paymentNumber: string;
    couponCode: string | null;
    discount: number;
    agreeToTerms: boolean;
};

export type CheckoutCartItem = CartItem;

export type ShippingZone = {
    id: string;
    name: string;
    cost: number;
    description?: string;
};

export type CheckoutSummary = {
    subtotal: number;
    shipping: number;
    discount: number;
    tax: number;
    total: number;
    itemCount: number;
};
