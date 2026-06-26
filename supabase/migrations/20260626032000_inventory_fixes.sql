-- Inventory Management System — Fixes from code review
-- 1. Add updated_at triggers
-- 2. Add deleted_at to inventory_variants for soft-delete cascade
-- 3. Add ILIKE search index (trigram)
-- 4. Atomic transfer RPC (replaces TOCTOU-prone service-layer transfer)

-- ---------------------------------------------------------------------------
-- 1. updated_at triggers (match all other tables in the schema)
-- ---------------------------------------------------------------------------
-- Drop old incorrectly-named triggers if they exist from a previous partial deploy
DROP TRIGGER IF EXISTS set_updated_at ON public.inventory_items;
DROP TRIGGER IF EXISTS set_updated_at ON public.inventory_variants;
DROP TRIGGER IF EXISTS trg_set_updated_at_inventory_items ON public.inventory_items;
DROP TRIGGER IF EXISTS trg_set_updated_at_inventory_variants ON public.inventory_variants;

CREATE TRIGGER trg_set_updated_at_inventory_items BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_set_updated_at_inventory_variants BEFORE UPDATE ON public.inventory_variants
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Soft-delete support for inventory_variants
-- ---------------------------------------------------------------------------
DO $$ BEGIN
    ALTER TABLE public.inventory_variants ADD COLUMN deleted_at timestamptz;
EXCEPTION WHEN duplicate_column THEN
    RAISE NOTICE 'Column deleted_at already exists on inventory_variants — skipping';
END $$;

-- Create a function that soft-deletes variants when the parent item is soft-deleted
CREATE OR REPLACE FUNCTION public.cascade_inventory_variant_soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
        UPDATE public.inventory_variants
        SET deleted_at = NEW.deleted_at
        WHERE inventory_item_id = NEW.id AND deleted_at IS NULL;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_inventory_items_soft_delete ON public.inventory_items;
CREATE TRIGGER trg_inventory_items_soft_delete
    AFTER UPDATE OF deleted_at ON public.inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION public.cascade_inventory_variant_soft_delete();

-- ---------------------------------------------------------------------------
-- 3. Trigram index for ILIKE name search (requires pg_trgm extension)
-- ---------------------------------------------------------------------------
-- Enable pg_trgm if not already enabled
DO $$ BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_trgm extension not available — skipping trigram index';
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_inventory_items_name_trgm
        ON public.inventory_items USING gin (name gin_trgm_ops)
        WHERE deleted_at IS NULL;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Trigram index creation skipped (pg_trgm may not be available)';
END $$;

-- ---------------------------------------------------------------------------
-- 4. Helper RPC: get distinct suppliers (server-side DISTINCT + deleted_at filter)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_distinct_inventory_suppliers()
RETURNS SETOF text
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT DISTINCT supplier
    FROM public.inventory_items
    WHERE supplier != '' AND deleted_at IS NULL
    ORDER BY supplier;
$$;

-- ---------------------------------------------------------------------------
-- 5. Atomic transfer RPC
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

    -- Bulk create product variants from inventory variants
    FOR v_variant IN
        SELECT sku, selling_price, stock, is_active
        FROM public.inventory_variants
        WHERE inventory_item_id = p_inventory_item_id AND deleted_at IS NULL
        ORDER BY created_at ASC
    LOOP
        INSERT INTO public.product_variants (
            product_id, sku, price, stock, is_active
        ) VALUES (
            v_product_id,
            v_variant.sku,
            COALESCE(v_variant.selling_price, 0),
            COALESCE(v_variant.stock, 0),
            COALESCE(v_variant.is_active, true)
        );

        v_variants := v_variants || jsonb_build_object(
            'sku', v_variant.sku,
            'price', v_variant.selling_price,
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
-- 6. Atomic revert RPC — undo a transfer, soft-delete linked product, restore to draft
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.revert_inventory_transfer(
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
    v_product_id  uuid;
BEGIN
    -- Verify caller has admin or shop_manager role
    IF NOT EXISTS (
        SELECT 1 FROM public.users WHERE id = p_actor_id AND role IN ('admin', 'shop_manager')
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;

    -- Lock the inventory item row
    SELECT * INTO v_item
    FROM public.inventory_items
    WHERE id = p_inventory_item_id AND deleted_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Inventory item not found');
    END IF;

    -- Only transferred items can be reverted
    IF v_item.status != 'transferred' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item is not in transferred status');
    END IF;

    v_product_id := v_item.transferred_to_product_id;

    -- Soft-delete the linked storefront product
    IF v_product_id IS NOT NULL THEN
        UPDATE public.products
        SET deleted_at = now()
        WHERE id = v_product_id;
    END IF;

    -- Restore inventory item to draft
    UPDATE public.inventory_items
    SET status = 'draft',
        transferred_to_product_id = NULL
    WHERE id = p_inventory_item_id;

    RETURN jsonb_build_object(
        'success', true,
        'product_id', v_product_id
    );
END;
$$;
