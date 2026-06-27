-- Feature 26 — Email Notifications: Profit Tracking Foundation
-- 1. Add purchase_price to product_variants (populated during inventory transfer)
-- 2. Add purchase_price to order_items (snapshot cost at time of sale)
-- 3. Update transfer_inventory_to_product RPC to carry purchase_price
-- 4. Update create_order RPC to capture purchase_price in order_items

-- ---------------------------------------------------------------------------
-- 1. Add purchase_price to product_variants
-- ---------------------------------------------------------------------------
DO $$ BEGIN
    ALTER TABLE public.product_variants
    ADD COLUMN purchase_price numeric(10,2);
EXCEPTION WHEN duplicate_column THEN
    RAISE NOTICE 'Column purchase_price already exists on product_variants — skipping';
END $$;

-- ---------------------------------------------------------------------------
-- 2. Add purchase_price to order_items
-- ---------------------------------------------------------------------------
DO $$ BEGIN
    ALTER TABLE public.order_items
    ADD COLUMN purchase_price numeric(10,2);
EXCEPTION WHEN duplicate_column THEN
    RAISE NOTICE 'Column purchase_price already exists on order_items — skipping';
END $$;

-- ---------------------------------------------------------------------------
-- 3. Update transfer_inventory_to_product RPC to carry purchase_price
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.transfer_inventory_to_product(
    p_inventory_item_id uuid,
    p_actor_id          uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_item        record;
    v_variant     record;
    v_product_id  uuid;
    v_slug        text;
    v_count       integer;
    v_variants    jsonb DEFAULT '[]'::jsonb;
    v_result      jsonb;
BEGIN
    -- Verify caller has admin or shop_manager role
    IF NOT EXISTS (
        SELECT 1 FROM public.users WHERE id = p_actor_id AND role IN ('admin', 'shop_manager')
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;

    -- Lock the inventory item row to prevent concurrent transfers
    SELECT * INTO v_item
    FROM public.inventory_items
    WHERE id = p_inventory_item_id AND deleted_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Inventory item not found');
    END IF;

    -- Prevent double-transfer
    IF v_item.status = 'transferred' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item has already been transferred');
    END IF;

    -- Require category for storefront product (admin list uses inner join)
    IF v_item.category_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item has no category — assign a category before transferring');
    END IF;

    -- Validate that there are variants to transfer
    SELECT COUNT(*) INTO v_count
    FROM public.inventory_variants
    WHERE inventory_item_id = p_inventory_item_id AND deleted_at IS NULL;

    IF v_count = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item has no variants to transfer');
    END IF;

    -- Generate unique slug
    v_slug := regexp_replace(
        lower(v_item.name),
        '[^a-z0-9]+', '-', 'g'
    );
    v_slug := trim(both '-' from v_slug);
    v_slug := v_slug || '-' || to_hex(floor(extract(epoch from now()) * 1000)::bigint);

    -- Create the storefront product
    INSERT INTO public.products (
        name, slug, type, status,
        category_id, brand_id,
        description,
        specs
    ) VALUES (
        v_item.name, v_slug, v_item.type, 'draft',
        v_item.category_id, v_item.brand_id,
        COALESCE(v_item.notes, ''),
        '{}'::jsonb
    )
    RETURNING id INTO v_product_id;

    -- Bulk create product variants from inventory variants (NOW with purchase_price)
    FOR v_variant IN
        SELECT sku, selling_price, purchase_price, stock, is_active
        FROM public.inventory_variants
        WHERE inventory_item_id = p_inventory_item_id AND deleted_at IS NULL
        ORDER BY created_at ASC
    LOOP
        INSERT INTO public.product_variants (
            product_id, sku, price, purchase_price, stock, is_active
        ) VALUES (
            v_product_id,
            v_variant.sku,
            COALESCE(v_variant.selling_price, 0),
            COALESCE(v_variant.purchase_price, 0),
            COALESCE(v_variant.stock, 0),
            COALESCE(v_variant.is_active, true)
        );

        v_variants := v_variants || jsonb_build_object(
            'sku', v_variant.sku,
            'price', v_variant.selling_price,
            'purchase_price', v_variant.purchase_price,
            'stock', v_variant.stock
        );
    END LOOP;

    -- Mark inventory item as transferred
    UPDATE public.inventory_items
    SET status = 'transferred',
        transferred_to_product_id = v_product_id
    WHERE id = p_inventory_item_id;

    v_result := jsonb_build_object(
        'success', true,
        'product_id', v_product_id,
        'variant_count', v_count,
        'variants', v_variants
    );

    RETURN v_result;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Update create_order RPC to capture purchase_price in order_items snapshots
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_order(
    p_user_id         uuid,
    p_cart_items      jsonb,
    p_shipping_address jsonb,
    p_shipping_cost   numeric,
    p_discount_total  numeric,
    p_coupon_code     text DEFAULT NULL,
    p_payment_method  text DEFAULT 'sslcommerz',
    p_decrement_stock boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_order_id        uuid;
    v_cart_id         uuid;
    v_item            jsonb;
    v_variant_id      uuid;
    v_quantity        integer;
    v_authoritative_price numeric;
    v_purchase_price  numeric;
    v_available       integer;
    v_subtotal        numeric := 0;
    v_computed_discount numeric := 0;
    v_grand_total     numeric;
    v_variant_snap    jsonb;
    v_product_snap    jsonb;
    v_sku             text;
    v_coupon          record;
    v_item_index      integer;
    v_variant_ids     uuid[];
    v_product_ids     uuid[];
BEGIN
    -- Validate user exists and owns cart
    SELECT c.id INTO v_cart_id
    FROM public.carts c
    WHERE c.user_id = p_user_id;

    IF v_cart_id IS NULL THEN
        RAISE EXCEPTION 'Cart not found for user %', p_user_id;
    END IF;

    -- Validate cart is not empty
    IF jsonb_array_length(p_cart_items) = 0 THEN
        RAISE EXCEPTION 'Cart is empty';
    END IF;

    -- Collect variant and product IDs for bulk lookups
    SELECT array_agg(DISTINCT ((item->>'variantId')::uuid))
    INTO v_variant_ids
    FROM jsonb_array_elements(p_cart_items) AS item;

    SELECT array_agg(DISTINCT ((item->>'productId')::uuid))
    INTO v_product_ids
    FROM jsonb_array_elements(p_cart_items) AS item;

    -- Lock all variant rows to prevent concurrent checkout race conditions.
    -- Locks held until end of transaction (COMMIT).
    PERFORM 1
    FROM product_variants pv
    WHERE pv.id = ANY(v_variant_ids) AND pv.is_active = true
    FOR UPDATE;

    -- Bulk-fetch variant prices, stock, purchase_price, and snapshots into a temp table
    CREATE TEMP TABLE IF NOT EXISTS _order_variants (
        variant_id uuid PRIMARY KEY,
        price numeric,
        purchase_price numeric,
        available_stock integer,
        snapshot jsonb,
        sku text
    ) ON COMMIT DROP;

    INSERT INTO _order_variants (variant_id, price, purchase_price, available_stock, snapshot, sku)
    SELECT
        pv.id,
        pv.price,
        pv.purchase_price,
        pv.stock - COALESCE(pv.reserved_stock, 0),
        to_jsonb(pv),
        pv.sku
    FROM product_variants pv
    WHERE pv.id = ANY(v_variant_ids) AND pv.is_active = true;

    -- Bulk-fetch product snapshots into a temp table
    CREATE TEMP TABLE IF NOT EXISTS _order_products (
        product_id uuid PRIMARY KEY,
        snapshot jsonb
    ) ON COMMIT DROP;

    INSERT INTO _order_products (product_id, snapshot)
    SELECT p.id, to_jsonb(p)
    FROM products p
    WHERE p.id = ANY(v_product_ids);

    -- Validate stock and compute subtotal from authoritative prices
    FOR v_item_index IN 0..jsonb_array_length(p_cart_items)-1
    LOOP
        v_item := p_cart_items->v_item_index;
        v_variant_id := (v_item->>'variantId')::uuid;
        v_quantity := (v_item->>'quantity')::integer;

        SELECT ov.price, ov.available_stock
        INTO v_authoritative_price, v_available
        FROM _order_variants ov
        WHERE ov.variant_id = v_variant_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Variant % not found or inactive', v_variant_id;
        END IF;

        IF v_available < v_quantity THEN
            RAISE EXCEPTION 'Insufficient stock for variant %: available %, requested %',
                v_variant_id, v_available, v_quantity;
        END IF;

        v_subtotal := v_subtotal + (v_authoritative_price * v_quantity);
    END LOOP;

    -- Validate coupon and compute authoritative discount
    IF p_coupon_code IS NOT NULL THEN
        SELECT * INTO v_coupon
        FROM public.coupons c
        WHERE c.code = upper(p_coupon_code)
          AND c.is_active = true
          AND (c.expires_at IS NULL OR c.expires_at > now())
          AND (c.usage_limit <= 0 OR c.used_count < c.usage_limit);

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid or expired coupon: %', p_coupon_code;
        END IF;

        IF v_coupon.min_order::numeric > v_subtotal THEN
            RAISE EXCEPTION 'Minimum order of % not met for coupon: %', v_coupon.min_order, p_coupon_code;
        END IF;

        -- Compute authoritative discount from coupon definition
        IF v_coupon.type = 'percentage' THEN
            v_computed_discount := round((v_subtotal * v_coupon.value::numeric) / 100);
        ELSIF v_coupon.type = 'fixed' THEN
            v_computed_discount := least(v_coupon.value::numeric, v_subtotal);
        ELSIF v_coupon.type = 'free_shipping' THEN
            v_computed_discount := p_shipping_cost;
        END IF;

        -- Validate client-supplied discount matches computed
        IF v_computed_discount != p_discount_total THEN
            RAISE EXCEPTION 'Discount mismatch: expected %, got %', v_computed_discount, p_discount_total;
        END IF;
    ELSIF p_discount_total > 0 THEN
        RAISE EXCEPTION 'Discount provided without a valid coupon code';
    END IF;

    v_grand_total := v_subtotal + p_shipping_cost - v_computed_discount;
    IF v_grand_total < 0 THEN
        v_grand_total := 0;
    END IF;

    -- Create order
    INSERT INTO public.orders (
        user_id,
        status,
        payment_method,
        subtotal,
        shipping_cost,
        discount_total,
        grand_total
    ) VALUES (
        p_user_id,
        'pending',
        p_payment_method,
        v_subtotal,
        p_shipping_cost,
        v_computed_discount,
        v_grand_total
    )
    RETURNING id INTO v_order_id;

    -- Create order_items with snapshots (NOW with purchase_price)
    FOR v_item_index IN 0..jsonb_array_length(p_cart_items)-1
    LOOP
        v_item := p_cart_items->v_item_index;
        v_variant_id := (v_item->>'variantId')::uuid;
        v_quantity := (v_item->>'quantity')::integer;

        SELECT ov.price, ov.purchase_price, ov.snapshot, ov.sku
        INTO v_authoritative_price, v_purchase_price, v_variant_snap, v_sku
        FROM _order_variants ov
        WHERE ov.variant_id = v_variant_id;

        SELECT op.snapshot
        INTO v_product_snap
        FROM _order_products op
        WHERE op.product_id = (v_item->>'productId')::uuid;

        INSERT INTO public.order_items (
            order_id,
            variant_id,
            quantity,
            unit_price,
            purchase_price,
            discount_applied,
            product_snapshot,
            variant_snapshot,
            sku_snapshot
        ) VALUES (
            v_order_id,
            v_variant_id,
            v_quantity,
            v_authoritative_price,
            v_purchase_price,
            0,
            v_product_snap,
            v_variant_snap,
            v_sku
        );
    END LOOP;

    -- Create payment record (pending)
    INSERT INTO public.payments (
        order_id,
        status,
        amount,
        currency
    ) VALUES (
        v_order_id,
        'pending',
        v_grand_total,
        'BDT'
    );

    -- Create shipping address
    INSERT INTO public.shipping_addresses (
        order_id,
        name,
        phone,
        address,
        city,
        district,
        postal_code
    ) VALUES (
        v_order_id,
        p_shipping_address->>'fullName',
        p_shipping_address->>'phone',
        p_shipping_address->>'address',
        p_shipping_address->>'city',
        p_shipping_address->>'district',
        p_shipping_address->>'postalCode'
    );

    -- Create order_coupon if coupon applied
    IF p_coupon_code IS NOT NULL AND v_coupon.id IS NOT NULL THEN
        INSERT INTO public.order_coupons (order_id, coupon_id, discount_amount)
        VALUES (v_order_id, v_coupon.id, v_computed_discount);

        UPDATE public.coupons
        SET used_count = used_count + 1
        WHERE id = v_coupon.id;
    END IF;

    -- Clear cart
    DELETE FROM public.cart_items WHERE cart_id = v_cart_id;

    -- Decrement stock immediately for COD (no payment verification step)
    IF p_decrement_stock THEN
        FOR v_item_index IN 0..jsonb_array_length(p_cart_items)-1
        LOOP
            v_item := p_cart_items->v_item_index;
            v_variant_id := (v_item->>'variantId')::uuid;
            v_quantity := (v_item->>'quantity')::integer;

            UPDATE public.product_variants
            SET stock = stock - v_quantity,
                updated_at = now()
            WHERE id = v_variant_id
              AND stock >= v_quantity
              AND is_active = true;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Insufficient stock for variant % during decrement', v_variant_id;
            END IF;
        END LOOP;
    END IF;

    RETURN jsonb_build_object(
        'id', v_order_id,
        'grand_total', v_grand_total,
        'currency', 'BDT'
    );
END;
$$;
