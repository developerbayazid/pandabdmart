-- Inventory Management System
-- Tables for internal product tracking (not visible on storefront)
-- Admin can transfer inventory items to live products table

-- 1. inventory_items — master inventory record
CREATE TABLE public.inventory_items (
    id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name                      text NOT NULL,
    sku_prefix                text NOT NULL UNIQUE,
    type                      text NOT NULL DEFAULT 'simple',
    status                    text NOT NULL DEFAULT 'draft',
    category_id               uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_id                  uuid REFERENCES public.brands(id) ON DELETE SET NULL,
    supplier                  text NOT NULL DEFAULT '',
    purchase_price            numeric(10,2) NOT NULL DEFAULT 0,
    selling_price             numeric(10,2) NOT NULL DEFAULT 0,
    reorder_point             integer NOT NULL DEFAULT 5,
    warehouse_location        text NOT NULL DEFAULT '',
    notes                     text DEFAULT '',
    transferred_to_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    deleted_at                timestamptz,
    created_at                timestamptz NOT NULL DEFAULT now(),
    updated_at                timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT inventory_items_type_check CHECK (type IN ('simple', 'variable')),
    CONSTRAINT inventory_items_status_check CHECK (status IN ('draft', 'transferred'))
);

-- 2. inventory_variants — variant-level tracking under an inventory item
CREATE TABLE public.inventory_variants (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id  uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    sku                text NOT NULL UNIQUE,
    purchase_price     numeric(10,2) NOT NULL DEFAULT 0,
    selling_price      numeric(10,2) NOT NULL DEFAULT 0,
    stock              integer NOT NULL DEFAULT 0,
    is_active          boolean NOT NULL DEFAULT true,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_inventory_items_category ON public.inventory_items(category_id);
CREATE INDEX idx_inventory_items_brand ON public.inventory_items(brand_id);
CREATE INDEX idx_inventory_items_status ON public.inventory_items(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_items_supplier ON public.inventory_items(supplier);
CREATE INDEX idx_inventory_variants_item ON public.inventory_variants(inventory_item_id);
CREATE INDEX idx_inventory_variants_sku ON public.inventory_variants(sku);

-- RLS — admin/manager only (no public access)
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_items_admin_read" ON public.inventory_items
    FOR SELECT USING (is_admin_or_manager());

CREATE POLICY "inventory_items_admin_insert" ON public.inventory_items
    FOR INSERT WITH CHECK (is_admin_or_manager());

CREATE POLICY "inventory_items_admin_update" ON public.inventory_items
    FOR UPDATE USING (is_admin_or_manager())
    WITH CHECK (is_admin_or_manager());

CREATE POLICY "inventory_items_admin_delete" ON public.inventory_items
    FOR DELETE USING (is_admin_or_manager());

CREATE POLICY "inventory_variants_admin_read" ON public.inventory_variants
    FOR SELECT USING (is_admin_or_manager());

CREATE POLICY "inventory_variants_admin_insert" ON public.inventory_variants
    FOR INSERT WITH CHECK (is_admin_or_manager());

CREATE POLICY "inventory_variants_admin_update" ON public.inventory_variants
    FOR UPDATE USING (is_admin_or_manager())
    WITH CHECK (is_admin_or_manager());

CREATE POLICY "inventory_variants_admin_delete" ON public.inventory_variants
    FOR DELETE USING (is_admin_or_manager());
