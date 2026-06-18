-- =============================================================================
-- Feature 20 (extended) — Admin Order Edit RPCs
-- Atomic add/remove order items with stock handling and total recalculation
-- =============================================================================

-- -------------------------------------------------------------------------
-- 1. admin_add_order_item — atomic add item to existing order
--    Creates order_item with snapshot, recalculates totals, adjusts stock
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_add_order_item(
    p_order_id    uuid,
    p_variant_id  uuid,
    p_quantity    integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_order       record;
    v_variant      record;
    v_product      record;
    v_item_total   numeric;
BEGIN
    -- Validate order exists and is editable
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    IF v_order.status IN ('delivered', 'cancelled', 'refunded') THEN
        RAISE EXCEPTION 'Cannot modify order in % status', v_order.status;
    END IF;

    -- Validate variant exists and is active
    SELECT * INTO v_variant
    FROM public.product_variants
    WHERE id = p_variant_id AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Variant not found or inactive: %', p_variant_id;
    END IF;

    -- Fetch product snapshot
    SELECT * INTO v_product
    FROM public.products
    WHERE id = v_variant.product_id;

    -- Calculate item total
    v_item_total := v_variant.price * p_quantity;

    -- Insert order item with snapshots
    INSERT INTO public.order_items (
        order_id,
        variant_id,
        quantity,
        unit_price,
        discount_applied,
        product_snapshot,
        variant_snapshot,
        sku_snapshot
    ) VALUES (
        p_order_id,
        p_variant_id,
        p_quantity,
        v_variant.price,
        0,
        to_jsonb(v_product),
        to_jsonb(v_variant),
        v_variant.sku
    );

    -- Adjust stock based on order status
    IF v_order.status = 'payment_pending' THEN
        UPDATE public.product_variants
        SET reserved_stock = COALESCE(reserved_stock, 0) + p_quantity,
            updated_at = now()
        WHERE id = p_variant_id;
    ELSE
        -- pending (COD), paid, processing, shipped
        UPDATE public.product_variants
        SET stock = stock - p_quantity,
            updated_at = now()
        WHERE id = p_variant_id
          AND stock >= p_quantity;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Insufficient stock for variant %: needed %, available %', p_variant_id, p_quantity, v_variant.stock;
        END IF;
    END IF;

    -- Recalculate order totals
    UPDATE public.orders
    SET subtotal = subtotal + v_item_total,
        grand_total = grand_total + v_item_total,
        updated_at = now()
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'added_amount', v_item_total
    );
END;
$$;


-- -------------------------------------------------------------------------
-- 2. admin_remove_order_item — atomic remove item from order
--    Deletes order_item, recalculates totals, restores stock
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_remove_order_item(
    p_order_item_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_item        record;
    v_order       record;
    v_item_total  numeric;
BEGIN
    -- Fetch the order item
    SELECT * INTO v_item
    FROM public.order_items
    WHERE id = p_order_item_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order item not found: %', p_order_item_id;
    END IF;

    -- Fetch the order and validate it's editable
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = v_item.order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found: %', v_item.order_id;
    END IF;

    IF v_order.status IN ('delivered', 'cancelled', 'refunded') THEN
        RAISE EXCEPTION 'Cannot modify order in % status', v_order.status;
    END IF;

    v_item_total := v_item.unit_price * v_item.quantity;

    -- Restore stock based on order status
    IF v_order.status = 'payment_pending' THEN
        UPDATE public.product_variants
        SET reserved_stock = GREATEST(0, COALESCE(reserved_stock, 0) - v_item.quantity),
            updated_at = now()
        WHERE id = v_item.variant_id;
    ELSE
        UPDATE public.product_variants
        SET stock = stock + v_item.quantity,
            updated_at = now()
        WHERE id = v_item.variant_id;
    END IF;

    -- Delete the order item
    DELETE FROM public.order_items
    WHERE id = p_order_item_id;

    -- Recalculate order totals
    UPDATE public.orders
    SET subtotal = GREATEST(0, subtotal - v_item_total),
        grand_total = GREATEST(0, grand_total - v_item_total),
        updated_at = now()
    WHERE id = v_item.order_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_item.order_id,
        'removed_amount', v_item_total
    );
END;
$$;
