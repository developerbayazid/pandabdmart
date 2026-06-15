import * as orderRepository from '@/repositories/order.repository';
import { initiateSSLCommerzSession } from '@/lib/payments/sslcommerz';

type PlaceOrderInput = {
    userId: string;
    cartItems: {
        id: string;
        variantId: string;
        productId: string;
        quantity: number;
    }[];
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        district: string;
        postalCode: string;
    };
    shippingCost: number;
    discountTotal: number;
    couponCode: string | null;
    paymentMethod: 'sslcommerz' | 'bkash' | 'nagad' | 'cash_on_delivery';
    customerEmail: string;
    /** MFS only — customer-submitted transaction ID */
    txnId?: string | null;
    /** MFS only — customer's bKash/Nagad payment number */
    paymentNumber?: string | null;
};

export type PlaceOrderResult = {
    success: boolean;
    gatewayUrl?: string;
    orderId?: string;
    error?: string;
};

export async function placeOrder(
    input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
    try {
        const isCod = input.paymentMethod === 'cash_on_delivery';
        const isMfs = input.paymentMethod === 'bkash' || input.paymentMethod === 'nagad';

        const order = await orderRepository.createOrderWithRpc({
            userId: input.userId,
            cartItems: input.cartItems,
            shippingAddress: input.shippingAddress,
            shippingCost: input.shippingCost,
            discountTotal: input.discountTotal,
            couponCode: input.couponCode,
            paymentMethod: input.paymentMethod,
            decrementStock: isCod,
            txnId: input.txnId ?? null,
            paymentNumber: input.paymentNumber ?? null,
            customerEmail: input.customerEmail,
        });

        if (isCod || isMfs) {
            return {
                success: true,
                orderId: order.id,
            };
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        if (!siteUrl) {
            throw new Error('NEXT_PUBLIC_SITE_URL is not configured');
        }

        const webhookUrl = `${siteUrl}/api/webhooks/sslcommerz`;

        const session = await initiateSSLCommerzSession({
            orderId: order.id,
            amount: order.grand_total,
            customerName: input.shippingAddress.fullName,
            customerPhone: input.shippingAddress.phone,
            customerAddress: input.shippingAddress.address,
            customerEmail: input.customerEmail,
            successUrl: webhookUrl,
            failUrl: webhookUrl,
            cancelUrl: `${siteUrl}/checkout`,
            ipnUrl: webhookUrl,
        });

        return {
            success: true,
            gatewayUrl: session.gatewayUrl,
            orderId: order.id,
        };
    } catch (error) {
        console.error('[services/checkout] placeOrder', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to place order',
        };
    }
}

export async function verifyPayment(
    orderId: string,
    valId: string,
    gatewayRef: string,
    amount: number,
): Promise<{ success: boolean; orderId?: string; alreadyProcessed?: boolean; error?: string }> {
    try {
        const result = await orderRepository.verifyPaymentByRpc(
            orderId,
            valId,
            gatewayRef,
            amount,
        );

        return {
            success: true,
            orderId: result.order_id,
            alreadyProcessed: result.already_processed,
        };
    } catch (error) {
        console.error('[services/checkout] verifyPayment', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Payment verification failed',
        };
    }
}
