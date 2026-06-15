-- SECURITY DEFINER function for cancelling an order
-- Customers cannot UPDATE orders directly due to RLS (orders_admin_update only)
-- This function bypasses RLS and handles the entire cancel flow atomically
CREATE OR REPLACE FUNCTION public.cancel_order(
    p_order_id uuid,
    p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_order record;
    v_item record;
    v_new_status text := 'cancelled';
BEGIN
    -- Fetch the order and verify ownership + status
    SELECT id, status, payment_method
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id
      AND user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Order not found');
    END IF;

    IF v_order.status NOT IN ('pending', 'payment_pending') THEN
        RETURN jsonb_build_object(
            'error',
            'Cannot cancel order in "' || v_order.status || '" status'
        );
    END IF;

    -- Release reserved stock for MFS orders (payment_pending)
    IF v_order.status = 'payment_pending' THEN
        FOR v_item IN
            SELECT variant_id, quantity
            FROM public.order_items
            WHERE order_id = p_order_id
        LOOP
            UPDATE public.product_variants
            SET reserved_stock = GREATEST(0, reserved_stock - v_item.quantity)
            WHERE id = v_item.variant_id;
        END LOOP;
    END IF;

    -- Restore stock for COD orders (pending + cash_on_delivery)
    IF v_order.status = 'pending' AND v_order.payment_method = 'cash_on_delivery' THEN
        FOR v_item IN
            SELECT variant_id, quantity
            FROM public.order_items
            WHERE order_id = p_order_id
        LOOP
            UPDATE public.product_variants
            SET stock = stock + v_item.quantity
            WHERE id = v_item.variant_id;
        END LOOP;
    END IF;

    -- Set order status to cancelled
    UPDATE public.orders
    SET status = v_new_status
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'id', p_order_id,
        'status', v_new_status
    );
END;
$$;
