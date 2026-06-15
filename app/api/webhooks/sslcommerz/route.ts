import { NextRequest, NextResponse } from 'next/server';
import * as checkoutService from '@/services/checkout.service';
import * as orderRepository from '@/repositories/order.repository';

export async function POST(req: NextRequest) {
    try {
        const body = await req.formData();
        const valId = body.get('val_id') as string;
        const tranId = body.get('tran_id') as string;
        const amount = body.get('amount') as string;
        const status = body.get('status') as string;

        if (!valId || !tranId) {
            return NextResponse.json(
                { success: false, error: 'Missing val_id or tran_id' },
                { status: 400 },
            );
        }

        if (status !== 'VALID') {
            return NextResponse.json(
                { success: false, error: 'Payment not valid' },
                { status: 400 },
            );
        }

        const storeId = process.env.SSLCOMMERZ_STORE_ID!;
        const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD!;
        const baseUrl = process.env.SSLCOMMERZ_BASE_URL;

        if (!baseUrl || !storeId || !storePassword) {
            console.error('[api/webhooks/sslcommerz] Missing SSLCommerz environment variables');
            return NextResponse.json({ success: false }, { status: 200 });
        }

        const params = new URLSearchParams({
            val_id: valId,
            store_id: storeId,
            store_passwd: storePassword,
            format: 'json',
        });

        const validation = await fetch(
            `${baseUrl}/validator/api/validationserverAPI.php?${params}`,
            { signal: AbortSignal.timeout(15000) },
        );

        const result = await validation.json();

        if (result.status !== 'VALID' && result.status !== 'VALIDATED') {
            console.error('[api/webhooks/sslcommerz] Server-side validation failed', {
                valId,
                resultStatus: result.status,
            });
            return NextResponse.json(
                { success: false, error: 'Invalid transaction' },
                { status: 400 },
            );
        }

        const gatewayRef = result.tran_id || tranId;
        const validatedAmount = Number(result.amount || amount);

        const existing = await orderRepository.findPaymentByGatewayRef(gatewayRef);
        if (existing?.status === 'verified') {
            return NextResponse.json({ success: true, status: 'already processed' });
        }

        const verifyResult = await checkoutService.verifyPayment(
            tranId,
            valId,
            gatewayRef,
            validatedAmount,
        );

        if (!verifyResult.success) {
            console.error('[api/webhooks/sslcommerz] Verification RPC failed', {
                tranId,
                error: verifyResult.error,
            });
            return NextResponse.json({ success: false }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[api/webhooks/sslcommerz]', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
