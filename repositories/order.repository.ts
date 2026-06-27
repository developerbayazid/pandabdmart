import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type CreateOrderInput = {
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
    paymentMethod: string;
    decrementStock: boolean;
    /** MFS only — customer-submitted transaction ID */
    txnId?: string | null;
    /** MFS only — customer's bKash/Nagad payment number */
    paymentNumber?: string | null;
    /** Customer email for guest order lookup */
    customerEmail: string;
};

type CreateOrderResult = {
    id: string;
    grand_total: number;
    currency: string;
};

async function getOrCreateCart(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
): Promise<string> {
    const { data: existing } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

    if (existing) return existing.id;

    const { data: created, error } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();

    if (error) throw new Error('Failed to find or create cart');
    return created.id;
}

export async function createOrderWithRpc(
    input: CreateOrderInput,
): Promise<CreateOrderResult> {
    const supabase = await createClient();
    const cartId = await getOrCreateCart(supabase, input.userId);

    // Validate cart has items
    if (input.cartItems.length === 0) {
        throw new Error('Cart is empty');
    }

    // Fetch variant data (prices, stock, snapshots) in bulk
    const variantIds = input.cartItems.map((item) => item.variantId);
    const productIds = input.cartItems.map((item) => item.productId);

    const { data: variants, error: variantError } = await supabase
        .from('product_variants')
        .select('id, price, purchase_price, stock, reserved_stock, sku, is_active')
        .in('id', variantIds);

    if (variantError || !variants) {
        throw new Error('Failed to fetch variant data');
    }

    const { data: products, error: productError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

    if (productError) {
        throw new Error('Failed to fetch product data');
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));
    const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);

    // Validate stock and compute subtotal from authoritative prices
    let subtotal = 0;
    for (const item of input.cartItems) {
        const variant = variantMap.get(item.variantId);
        if (!variant || !variant.is_active) {
            throw new Error(`Variant ${item.variantId} not found or inactive`);
        }

        const available = variant.stock - (variant.reserved_stock ?? 0);
        if (available < item.quantity) {
            throw new Error(
                `Insufficient stock for variant ${item.variantId}: available ${available}, requested ${item.quantity}`,
            );
        }

        subtotal += Number(variant.price) * item.quantity;
    }

    // Validate coupon and compute authoritative discount
    let computedDiscount = 0;
    let couponId: string | null = null;

    if (input.couponCode) {
        const { data: coupon, error: couponError } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', input.couponCode.toUpperCase())
            .single();

        if (couponError || !coupon) {
            throw new Error(`Invalid or expired coupon: ${input.couponCode}`);
        }

        if (!coupon.is_active) {
            throw new Error('This coupon is no longer active');
        }

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            throw new Error('This coupon has expired');
        }

        if (coupon.usage_limit > 0 && (coupon.used_count ?? 0) >= coupon.usage_limit) {
            throw new Error('This coupon has reached its usage limit');
        }

        if (Number(coupon.min_order) > subtotal) {
            throw new Error(
                `Minimum order of ${Number(coupon.min_order)} required for this coupon`,
            );
        }

        if (coupon.type === 'percentage') {
            computedDiscount = Math.round((subtotal * Number(coupon.value)) / 100);
        } else if (coupon.type === 'fixed') {
            computedDiscount = Math.min(Number(coupon.value), subtotal);
        } else if (coupon.type === 'free_shipping') {
            computedDiscount = input.shippingCost;
        }

        if (computedDiscount !== input.discountTotal) {
            throw new Error(
                `Discount mismatch: expected ${computedDiscount}, got ${input.discountTotal}`,
            );
        }

        couponId = coupon.id;
    } else if (input.discountTotal > 0) {
        throw new Error('Discount provided without a valid coupon code');
    }

    const grandTotal = Math.max(0, subtotal + input.shippingCost - computedDiscount);

        const isMfs = input.paymentMethod === 'bkash' || input.paymentMethod === 'nagad';

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: input.userId,
                status: isMfs ? 'payment_pending' : 'pending',
                payment_method: input.paymentMethod,
                subtotal,
                shipping_cost: input.shippingCost,
                discount_total: computedDiscount,
                grand_total: grandTotal,
                customer_email: input.customerEmail,
            })
            .select('id')
            .single();

    if (orderError || !order) {
        throw new Error(`Order creation failed: ${orderError?.message ?? 'unknown'}`);
    }

    const orderId = order.id;

    // Create order items with snapshots
    for (const item of input.cartItems) {
        const variant = variantMap.get(item.variantId);
        const product = productMap.get(item.productId);

        const { error: itemError } = await supabase.from('order_items').insert({
            order_id: orderId,
            variant_id: item.variantId,
            quantity: item.quantity,
            unit_price: Number(variant!.price),
            purchase_price: variant?.purchase_price != null ? Number(variant.purchase_price) : null,
            discount_applied: 0,
            product_snapshot: product ?? null,
            variant_snapshot: variant ?? null,
            sku_snapshot: variant?.sku ?? null,
        });

        if (itemError) {
            throw new Error(`Failed to create order items: ${itemError.message}`);
        }

        // Decrement stock if COD, reserve stock if MFS (bKash/Nagad)
        if (input.decrementStock) {
            const { error: stockError } = await supabase
                .from('product_variants')
                .update({ stock: variant!.stock - item.quantity })
                .eq('id', item.variantId)
                .gte('stock', item.quantity);

            if (stockError) {
                throw new Error(`Stock decrement failed: ${stockError.message}`);
            }
        } else if (isMfs) {
            const { error: reserveError } = await supabase
                .from('product_variants')
                .update({ reserved_stock: (variant!.reserved_stock ?? 0) + item.quantity })
                .eq('id', item.variantId);

            if (reserveError) {
                throw new Error(`Stock reservation failed: ${reserveError.message}`);
            }
        }
    }

    // Create payment record
    const { error: paymentError } = await supabase.from('payments').insert({
        order_id: orderId,
        status: 'pending',
        amount: grandTotal,
        currency: 'BDT',
        ...(input.txnId ? { txn_id: input.txnId } : {}),
        ...(input.paymentNumber ? { payment_number: input.paymentNumber } : {}),
    });

    if (paymentError) {
        throw new Error(`Payment creation failed: ${paymentError.message}`);
    }

    // Create shipping address
    const { error: shippingError } = await supabase.from('shipping_addresses').insert({
        order_id: orderId,
        name: input.shippingAddress.fullName,
        phone: input.shippingAddress.phone,
        address: input.shippingAddress.address,
        city: input.shippingAddress.city,
        district: input.shippingAddress.district,
        postal_code: input.shippingAddress.postalCode,
    });

    if (shippingError) {
        throw new Error(`Shipping address creation failed: ${shippingError.message}`);
    }

    // Create order_coupon if applicable
    if (couponId) {
        const { error: ocError } = await supabase.from('order_coupons').insert({
            order_id: orderId,
            coupon_id: couponId,
            discount_amount: computedDiscount,
        });

        if (ocError) {
            throw new Error(`Order coupon creation failed: ${ocError.message}`);
        }

        // Atomic coupon usage increment — prevents concurrent bypass of usage_limit
        const { error: usageError } = await supabase.rpc('increment_coupon_usage', {
            p_coupon_id: couponId,
        });

        if (usageError) {
            throw new Error(`Failed to increment coupon usage: ${usageError.message}`);
        }
    }

    // Clear cart
    await supabase.from('cart_items').delete().eq('cart_id', cartId);

    return {
        id: orderId,
        grand_total: grandTotal,
        currency: 'BDT',
    };
}

export async function verifyPaymentByRpc(
    orderId: string,
    valId: string,
    gatewayRef: string,
    amount: number,
): Promise<{ success: boolean; order_id: string; status: string; already_processed?: boolean }> {
    const supabase = await createClient();

    // Get the order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (orderError || !order) {
        throw new Error(`Order not found: ${orderId}`);
    }

    if (order.status !== 'pending') {
        throw new Error(`Order is not in pending status: ${order.status}`);
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (paymentError || !payment) {
        throw new Error(`Payment record not found for order ${orderId}`);
    }

    // Idempotency check
    if (payment.status === 'verified') {
        return { success: true, order_id: orderId, status: 'paid', already_processed: true };
    }

    // Verify amount
    if (Number(payment.amount) !== amount) {
        throw new Error(
            `Payment amount mismatch: expected ${payment.amount}, got ${amount}`,
        );
    }

    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('variant_id, quantity')
        .eq('order_id', orderId);

    if (itemsError || !orderItems) {
        throw new Error('Failed to fetch order items');
    }

    // Decrement stock for each item
    for (const item of orderItems) {
        const { data: variant } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('id', item.variant_id)
            .single();

        if (!variant || variant.stock < item.quantity) {
            throw new Error(`Insufficient stock for variant: ${item.variant_id}`);
        }

        const { error: decError } = await supabase
            .from('product_variants')
            .update({ stock: variant.stock - item.quantity })
            .eq('id', item.variant_id)
            .gte('stock', item.quantity);

        if (decError) {
            throw new Error(`Stock decrement failed: ${item.variant_id}`);
        }
    }

    // Update payment
    await supabase
        .from('payments')
        .update({
            status: 'verified',
            gateway_ref: gatewayRef,
            verified_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

    // Update order
    await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', orderId);

    return { success: true, order_id: orderId, status: 'paid' };
}

export async function getOrderById(orderId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('orders')
        .select(
            '*, order_items(*), payments(*), shipping_addresses(*)',
        )
        .eq('id', orderId)
        .single();

    if (error || !data) {
        return null;
    }

    return data;
}

export async function getOrderByIdWithVerification(
    orderId: string,
    email?: string,
    phone?: string,
) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('guest_lookup_order', {
        p_order_id: orderId,
        p_email: email || null,
        p_phone: phone || null,
    });

    if (error) {
        console.error('[order.repository] guest_lookup_order RPC error:', error.message);
        return null;
    }

    if (!data) {
        return null;
    }

    return data;
}

export async function cancelOrder(orderId: string, userId?: string) {
    const supabase = await createClient();

    if (userId) {
        const { data, error } = await supabase.rpc('cancel_order', {
            p_order_id: orderId,
            p_user_id: userId,
        });

        if (error) {
            throw new Error(`Cancel failed: ${error.message}`);
        }

        if (data?.error) {
            throw new Error(data.error);
        }

        return { id: data.id as string, status: data.status as string };
    }

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, status, payment_method')
        .eq('id', orderId)
        .single();

    if (orderError || !order) {
        throw new Error('Order not found');
    }

    if (order.status !== 'pending' && order.status !== 'payment_pending') {
        throw new Error(
            `Cannot cancel order in "${order.status}" status`,
        );
    }

    const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('variant_id, quantity')
        .eq('order_id', orderId);

    if (itemsError || !orderItems) {
        throw new Error('Failed to fetch order items');
    }

    if (order.status === 'payment_pending') {
        for (const item of orderItems) {
            const { data: variant } = await supabase
                .from('product_variants')
                .select('reserved_stock')
                .eq('id', item.variant_id)
                .single();

            if (variant) {
                const newReserved = Math.max(
                    0,
                    (variant.reserved_stock ?? 0) - item.quantity,
                );

                if (newReserved !== (variant.reserved_stock ?? 0)) {
                    await supabase
                        .from('product_variants')
                        .update({ reserved_stock: newReserved })
                        .eq('id', item.variant_id);
                }
            }
        }
    }

    if (
        order.status === 'pending' &&
        order.payment_method === 'cash_on_delivery'
    ) {
        for (const item of orderItems) {
            const { data: variant } = await supabase
                .from('product_variants')
                .select('stock')
                .eq('id', item.variant_id)
                .single();

            if (variant) {
                await supabase
                    .from('product_variants')
                    .update({ stock: variant.stock + item.quantity })
                    .eq('id', item.variant_id);
            }
        }
    }

    const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

    if (updateError) {
        throw new Error(`Failed to cancel order: ${updateError.message}`);
    }

    return { id: orderId, status: 'cancelled' as const };
}

export async function getAdminOrders({
    page = 1,
    limit = 20,
    search,
    status,
    paymentMethod,
    dateFrom,
    dateTo,
}: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
}): Promise<{ orders: Record<string, unknown>[]; total: number; page: number; totalPages: number }> {
    const supabase = await createClient();

    let query = supabase
        .from('orders')
        .select(
            'id, user_id, customer_email, status, payment_method, subtotal, shipping_cost, discount_total, grand_total, created_at, user:users(full_name), order_items(count)',
            { count: 'exact' },
        )
        .order('created_at', { ascending: false });

    if (search) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search);
        if (isUuid) {
            query = query.or(
                `id.eq.${search},user.full_name.ilike.%${search}%`,
            );
        } else {
            query = query.ilike('user.full_name', `%${search}%`);
        }
    }

    if (status) {
        query = query.eq('status', status);
    }

    if (paymentMethod) {
        query = query.eq('payment_method', paymentMethod);
    }

    if (dateFrom) {
        query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
        query = query.lte('created_at', dateTo);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error('[repositories/order] getAdminOrders:', error);
        return { orders: [], total: 0, page: 1, totalPages: 0 };
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const rawData = data as unknown as Record<string, unknown>[] | null;
    return { orders: rawData ?? [], total, page, totalPages };
}

export async function getAdminOrderById(orderId: string): Promise<Record<string, unknown> | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('orders')
        .select(
            'id, user_id, customer_email, status, payment_method, subtotal, shipping_cost, discount_total, grand_total, created_at, updated_at, user:users(full_name), order_items(*), payments(*), shipping_addresses(*)',
        )
        .eq('id', orderId)
        .single();

    if (error || !data) {
        return null;
    }

    return data as unknown as Record<string, unknown>;
}

export async function updateOrderStatusInDb(
    orderId: string,
    currentStatus: string,
    newStatus: string,
): Promise<{ id: string; status: string }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('status', currentStatus)
        .select('id, status')
        .single();

    if (error) {
        throw new Error(`Failed to update order status: ${error.message}`);
    }

    return { id: data.id as string, status: data.status as string };
}

export async function findPaymentByGatewayRef(
    gatewayRef: string,
): Promise<{ id: string; status: string; order_id: string } | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('payments')
        .select('id, status, order_id')
        .eq('gateway_ref', gatewayRef)
        .maybeSingle();

    if (error || !data) return null;

    return {
        id: data.id,
        status: data.status,
        order_id: data.order_id,
    };
}

export async function adminEditCustomerInfo(
    orderId: string,
    data: { customerEmail?: string },
): Promise<void> {
    const supabase = await createClient();

    const updates: Record<string, unknown> = {};
    if (data.customerEmail !== undefined) updates.customer_email = data.customerEmail;

    if (Object.keys(updates).length === 0) return;

    const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

    if (error) throw new Error(`Failed to update customer info: ${error.message}`);
}

export async function adminEditShippingAddress(
    addressId: string,
    data: {
        name?: string;
        phone?: string;
        address?: string;
        city?: string;
        district?: string;
        postalCode?: string;
    },
): Promise<void> {
    const supabase = await createClient();

    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.address !== undefined) updates.address = data.address;
    if (data.city !== undefined) updates.city = data.city;
    if (data.district !== undefined) updates.district = data.district;
    if (data.postalCode !== undefined) updates.postal_code = data.postalCode;

    if (Object.keys(updates).length === 0) return;

    const { error } = await supabase
        .from('shipping_addresses')
        .update(updates)
        .eq('id', addressId);

    if (error) throw new Error(`Failed to update shipping address: ${error.message}`);
}

export async function adminAddOrderItemRpc(
    orderId: string,
    variantId: string,
    quantity: number,
): Promise<{ success: boolean; order_id: string; error?: string }> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient.rpc('admin_add_order_item', {
        p_order_id: orderId,
        p_variant_id: variantId,
        p_quantity: quantity,
    });

    if (error) {
        return { success: false, order_id: orderId, error: error.message };
    }

    return {
        success: data.success as boolean,
        order_id: data.order_id as string,
    };
}

export async function adminRemoveOrderItemRpc(
    orderItemId: string,
): Promise<{ success: boolean; order_id: string; error?: string }> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient.rpc('admin_remove_order_item', {
        p_order_item_id: orderItemId,
    });

    if (error) {
        return { success: false, order_id: '', error: error.message };
    }

    return {
        success: data.success as boolean,
        order_id: data.order_id as string,
    };
}

export async function adminSearchVariants(
    search: string,
    limit = 20,
): Promise<{ id: string; sku: string; price: number; stock: number; productName: string }[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('product_variants')
        .select(
            'id, sku, price, stock, product:products!inner(name)',
        )
        .ilike('sku', `%${search}%`)
        .eq('is_active', true)
        .order('sku')
        .limit(limit);

    if (error || !data) return [];

    return (data as unknown as {
        id: string;
        sku: string;
        price: number;
        stock: number;
        product: { name: string }[];
    }[]).map((v) => ({
        id: v.id,
        sku: v.sku,
        price: v.price,
        stock: v.stock,
        productName: v.product?.[0]?.name ?? 'Unknown',
    }));
}

export async function resetPaymentToPending(
    orderId: string,
    orderItems: { variantId: string; quantity: number }[],
): Promise<void> {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Restore stock and re-reserve for each item (reverse of approve_manual_payment)
    for (const item of orderItems) {
        const { data: variant } = await supabase
            .from('product_variants')
            .select('stock, reserved_stock')
            .eq('id', item.variantId)
            .maybeSingle();

        if (variant) {
            await adminClient
                .from('product_variants')
                .update({
                    stock: (variant.stock ?? 0) + item.quantity,
                    reserved_stock: (variant.reserved_stock ?? 0) + item.quantity,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', item.variantId);
        }
    }

    // Reset payment record to pending so Verify/Fail buttons reappear
    await adminClient
        .from('payments')
        .update({
            status: 'pending',
            verified_by: null,
            verified_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);
}
