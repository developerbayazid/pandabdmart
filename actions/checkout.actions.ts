'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth/require-auth';
import * as checkoutService from '@/services/checkout.service';
import type { PlaceOrderResult } from '@/services/checkout.service';

export async function placeOrderAction(
    p: {
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
        txnId?: string | null;
        paymentNumber?: string | null;
    },
): Promise<PlaceOrderResult> {
    const user = await requireAuth();

    const result = await checkoutService.placeOrder({
        userId: user.id,
        cartItems: p.cartItems,
        shippingAddress: p.shippingAddress,
        shippingCost: p.shippingCost,
        discountTotal: p.discountTotal,
        couponCode: p.couponCode,
        paymentMethod: p.paymentMethod,
        customerEmail: user.email ?? '',
        txnId: p.txnId ?? null,
        paymentNumber: p.paymentNumber ?? null,
    });

    if (result.success) {
        revalidatePath('/cart');
    }

    return result;
}
