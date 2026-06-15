-- Add customer_email to orders table for guest order lookup
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email text;

-- Create a SECURITY DEFINER function for guest order lookup
-- This bypasses RLS so unauthenticated guests can verify their order
-- by providing the order ID + email or phone
CREATE OR REPLACE FUNCTION public.guest_lookup_order(
    p_order_id uuid,
    p_email text DEFAULT NULL,
    p_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_order jsonb;
    v_email_match boolean := false;
    v_phone_match boolean := false;
BEGIN
    -- Check if order exists and email matches (if provided)
    IF p_email IS NOT NULL AND p_email != '' THEN
        SELECT EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = p_order_id AND customer_email = p_email
        ) INTO v_email_match;
    END IF;

    -- Check if phone matches shipping address (if provided)
    IF p_phone IS NOT NULL AND p_phone != '' THEN
        SELECT EXISTS (
            SELECT 1 FROM public.shipping_addresses
            WHERE order_id = p_order_id AND phone = p_phone
        ) INTO v_phone_match;
    END IF;

    -- Must match at least one verification method
    IF (p_email IS NULL OR p_email = '') AND (p_phone IS NULL OR p_phone = '') THEN
        RETURN NULL;
    END IF;

    IF NOT v_email_match AND NOT v_phone_match THEN
        RETURN NULL;
    END IF;

    -- Fetch the full order with all relations
    SELECT jsonb_build_object(
        'id', o.id,
        'user_id', o.user_id,
        'status', o.status,
        'payment_method', o.payment_method,
        'subtotal', o.subtotal,
        'shipping_cost', o.shipping_cost,
        'discount_total', o.discount_total,
        'grand_total', o.grand_total,
        'customer_email', o.customer_email,
        'created_at', o.created_at,
        'updated_at', o.updated_at,
        'order_items', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'id', oi.id,
                'order_id', oi.order_id,
                'variant_id', oi.variant_id,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'discount_applied', oi.discount_applied,
                'product_snapshot', oi.product_snapshot,
                'variant_snapshot', oi.variant_snapshot,
                'sku_snapshot', oi.sku_snapshot
            ))
            FROM public.order_items oi
            WHERE oi.order_id = o.id
        ), '[]'::jsonb),
        'payments', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'id', p.id,
                'order_id', p.order_id,
                'status', p.status,
                'amount', p.amount,
                'currency', p.currency,
                'gateway_ref', p.gateway_ref,
                'txn_id', p.txn_id,
                'payment_number', p.payment_number,
                'verified_by', p.verified_by,
                'verified_at', p.verified_at,
                'created_at', p.created_at
            ))
            FROM public.payments p
            WHERE p.order_id = o.id
        ), '[]'::jsonb),
        'shipping_addresses', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'id', sa.id,
                'order_id', sa.order_id,
                'name', sa.name,
                'phone', sa.phone,
                'address', sa.address,
                'city', sa.city,
                'district', sa.district,
                'postal_code', sa.postal_code
            ))
            FROM public.shipping_addresses sa
            WHERE sa.order_id = o.id
        ), '[]'::jsonb)
    ) INTO v_order
    FROM public.orders o
    WHERE o.id = p_order_id;

    RETURN v_order;
END;
$$;
