type SSLCommerzSessionInput = {
    orderId: string;
    amount: number;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerEmail: string;
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
    ipnUrl: string;
};

type SSLCommerzSessionResponse = {
    gatewayUrl: string;
};

export async function initiateSSLCommerzSession(
    input: SSLCommerzSessionInput,
): Promise<SSLCommerzSessionResponse> {
    const baseUrl = process.env.SSLCOMMERZ_BASE_URL;
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;

    if (!baseUrl || !storeId || !storePassword) {
        throw new Error('SSLCommerz environment variables are not configured');
    }

    const body = new URLSearchParams({
        store_id: storeId,
        store_passwd: storePassword,
        total_amount: input.amount.toString(),
        currency: 'BDT',
        tran_id: input.orderId,
        success_url: input.successUrl,
        fail_url: input.failUrl,
        cancel_url: input.cancelUrl,
        ipn_url: input.ipnUrl,
        emi_option: '0',
        cus_name: input.customerName,
        cus_phone: input.customerPhone,
        cus_add1: input.customerAddress,
        cus_email: input.customerEmail,
        shipping_method: 'Courier',
        product_name: 'Order ' + input.orderId,
        product_category: 'General',
        product_profile: 'general',
    });

    const response = await fetch(`${baseUrl}/gwprocess/v4/api.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
        throw new Error(`SSLCommerz session error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'SUCCESS') {
        throw new Error(
            `SSLCommerz session failed: ${data.failedreason || 'unknown'}`,
        );
    }

    return { gatewayUrl: data.GatewayPageURL };
}
