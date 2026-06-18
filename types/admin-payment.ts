export type AdminPaymentRecord = {
    paymentId: string;
    orderId: string;
    orderStatus: string;
    customerName: string | null;
    customerEmail: string | null;
    paymentMethod: string;
    amount: number;
    txnId: string | null;
    paymentNumber: string | null;
    gatewayRef: string | null;
    status: 'pending' | 'verified' | 'failed';
    verifiedBy: string | null;
    verifiedByName: string | null;
    verifiedAt: string | null;
    createdAt: string;
};

export type AdminPendingPayment = {
    paymentId: string;
    orderId: string;
    customerName: string | null;
    customerEmail: string | null;
    paymentMethod: string;
    amount: number;
    txnId: string | null;
    paymentNumber: string | null;
    orderCreatedAt: string;
};
