-- =============================================================================
-- Feature 20 — MFS Payment Approval / Rejection RPCs
-- Atomic operations for bKash/Nagad manual payment verification
-- =============================================================================

-- -------------------------------------------------------------------------
-- 1. approve_manual_payment — atomic approval for MFS (bKash/Nagad) payments
--    Verifies payment, decrements stock, releases reservation, sets order to paid
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.approve_manual_payment(
    p_order_id    uuid,
    p_verified_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_order       record;
    v_payment     record;
    v_item        record;
BEGIN
    -- Verify caller has admin or shop_manager role
    IF NOT EXISTS (
        SELECT 1 FROM public.users WHERE id = p_verified_by AND role IN ('admin', 'shop_manager')
    ) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Get order and validate status + payment method
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    IF v_order.status != 'payment_pending' THEN
        RAISE EXCEPTION 'Order is not in payment_pending status: %', v_order.status;
    END IF;

    IF v_order.payment_method NOT IN ('bkash', 'nagad') THEN
        RAISE EXCEPTION 'Order payment method is not MFS: %', v_order.payment_method;
    END IF;

    -- Get payment record with row lock to prevent double-processing
    SELECT * INTO v_payment
    FROM public.payments
    WHERE order_id = p_order_id
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment record not found for order %', p_order_id;
    END IF;

    IF v_payment.status != 'pending' THEN
        RAISE EXCEPTION 'Payment already processed: %', v_payment.status;
    END IF;

    -- Decrement stock and release reservation for each order item atomically
    FOR v_item IN
        SELECT oi.variant_id, oi.quantity
        FROM public.order_items oi
        WHERE oi.order_id = p_order_id
    LOOP
        -- Decrement stock and release reserved stock in one UPDATE.
        -- Checks both stock (prevents overselling) and reserved_stock
        -- (the quantity was already reserved at order placement).
        UPDATE public.product_variants
        SET stock = GREATEST(0, stock - v_item.quantity),
            reserved_stock = GREATEST(0, COALESCE(reserved_stock, 0) - v_item.quantity),
            updated_at = now()
        WHERE id = v_item.variant_id
          AND is_active = true
          AND stock >= v_item.quantity
          AND COALESCE(reserved_stock, 0) >= v_item.quantity;

        -- If the variant was deleted, deactivated, or has insufficient
        -- stock/reservation after order placement, still allow verification.
        -- Order snapshots preserve the transaction history, and the
        -- customer should not be blocked by an inventory side effect.
        -- Best-effort: try to release any remaining reservation.
        IF NOT FOUND THEN
            UPDATE public.product_variants
            SET reserved_stock = GREATEST(0, COALESCE(reserved_stock, 0) - v_item.quantity),
                updated_at = now()
            WHERE id = v_item.variant_id;
        END IF;
    END LOOP;

    -- Update payment to verified (defensive: only if still pending)
    UPDATE public.payments
    SET status = 'verified',
        verified_by = p_verified_by,
        verified_at = now(),
        updated_at = now()
    WHERE id = v_payment.id AND status = 'pending';

    -- Update order to paid
    UPDATE public.orders
    SET status = 'paid',
        updated_at = now()
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'status', 'paid'
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.approve_manual_payment FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_manual_payment TO service_role;


-- -------------------------------------------------------------------------
-- 2. reject_manual_payment — atomic rejection for MFS (bKash/Nagad) payments
--    Marks payment failed, releases stock reservation, sets order to cancelled
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.reject_manual_payment(
    p_order_id    uuid,
    p_verified_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_order       record;
    v_payment     record;
    v_item        record;
BEGIN
    -- Verify caller has admin or shop_manager role
    IF NOT EXISTS (
        SELECT 1 FROM public.users WHERE id = p_verified_by AND role IN ('admin', 'shop_manager')
    ) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Get order and validate status + payment method
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    IF v_order.status != 'payment_pending' THEN
        RAISE EXCEPTION 'Order is not in payment_pending status: %', v_order.status;
    END IF;

    IF v_order.payment_method NOT IN ('bkash', 'nagad') THEN
        RAISE EXCEPTION 'Order payment method is not MFS: %', v_order.payment_method;
    END IF;

    -- Get payment record with row lock to prevent double-processing
    SELECT * INTO v_payment
    FROM public.payments
    WHERE order_id = p_order_id
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment record not found for order %', p_order_id;
    END IF;

    IF v_payment.status != 'pending' THEN
        RAISE EXCEPTION 'Payment already processed: %', v_payment.status;
    END IF;

    -- Release reserved stock for each order item
    FOR v_item IN
        SELECT oi.variant_id, oi.quantity
        FROM public.order_items oi
        WHERE oi.order_id = p_order_id
    LOOP
        UPDATE public.product_variants
        SET reserved_stock = GREATEST(0, COALESCE(reserved_stock, 0) - v_item.quantity),
            updated_at = now()
        WHERE id = v_item.variant_id;
    END LOOP;

    -- Mark payment as failed (defensive: only if still pending)
    UPDATE public.payments
    SET status = 'failed',
        verified_by = p_verified_by,
        verified_at = now(),
        updated_at = now()
    WHERE id = v_payment.id AND status = 'pending';

    -- Cancel order
    UPDATE public.orders
    SET status = 'cancelled',
        updated_at = now()
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'status', 'cancelled'
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reject_manual_payment FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_manual_payment TO service_role;


-- -------------------------------------------------------------------------
-- 3. Index for MFS payment queries (admin verification queue)
-- -------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_payments_status_method
    ON public.payments(status, created_at DESC)
    WHERE status = 'pending';
