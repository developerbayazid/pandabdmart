-- =============================================================================
-- Feature 03 — Initial Database Schema
-- Tables, triggers, RLS policies, indexes, and Realtime publication
-- Order: dependency-aware (FK targets created before references)
-- =============================================================================

-- -------------------------------------------------------------------------
-- 1. Helper functions (used by RLS policies and triggers)
--    SECURITY DEFINER with empty search_path per Supabase best practice
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('admin', 'shop_manager')
    );
END;
$$;

-- -------------------------------------------------------------------------
-- 2. Tables — ordered by dependency
-- -------------------------------------------------------------------------

-- 2a. users (references auth.users)
CREATE TABLE public.users (
    id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role        text NOT NULL DEFAULT 'customer',
    full_name   text,
    phone       text,
    avatar_url  text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT users_role_check CHECK (role IN ('admin', 'shop_manager', 'customer'))
);

-- 2b. categories (self-referencing)
CREATE TABLE public.categories (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id   uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    name        text NOT NULL,
    slug        text NOT NULL UNIQUE,
    path        text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2c. brands
CREATE TABLE public.brands (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text NOT NULL,
    slug        text NOT NULL UNIQUE,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2d. attributes
CREATE TABLE public.attributes (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2e. attribute_values
CREATE TABLE public.attribute_values (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_id    uuid NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
    value           text NOT NULL
);

-- 2f. shipping_zones
CREATE TABLE public.shipping_zones (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text NOT NULL,
    cost        numeric(10,2) NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2g. coupons
CREATE TABLE public.coupons (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code            text NOT NULL UNIQUE,
    type            text NOT NULL,
    value           numeric(10,2) NOT NULL DEFAULT 0,
    min_order       numeric(10,2) DEFAULT 0,
    usage_limit     integer DEFAULT 0,
    used_count      integer NOT NULL DEFAULT 0,
    expires_at      timestamptz,
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT coupons_type_check CHECK (type IN ('percentage', 'fixed', 'free_shipping'))
);

-- 2h. products
CREATE TABLE public.products (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id     uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_id        uuid REFERENCES public.brands(id) ON DELETE SET NULL,
    slug            text NOT NULL UNIQUE,
    type            text NOT NULL,
    status          text NOT NULL DEFAULT 'draft',
    name            text NOT NULL,
    description     text,
    specs           jsonb,
    deleted_at      timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT products_type_check CHECK (type IN ('simple', 'variable')),
    CONSTRAINT products_status_check CHECK (status IN ('draft', 'active', 'archived'))
);

-- 2i. product_variants
CREATE TABLE public.product_variants (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku             text NOT NULL UNIQUE,
    price           numeric(10,2) NOT NULL DEFAULT 0,
    compare_price   numeric(10,2),
    stock           integer NOT NULL DEFAULT 0,
    reserved_stock  integer NOT NULL DEFAULT 0,
    sold_count      integer NOT NULL DEFAULT 0,
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 2j. variant_images
CREATE TABLE public.variant_images (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id  uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    url         text NOT NULL,
    is_primary  boolean NOT NULL DEFAULT false,
    sort_order  integer NOT NULL DEFAULT 0
);

-- 2k. variant_attribute_values (N:M junction)
CREATE TABLE public.variant_attribute_values (
    variant_id          uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    attribute_value_id  uuid NOT NULL REFERENCES public.attribute_values(id) ON DELETE CASCADE,
    PRIMARY KEY (variant_id, attribute_value_id)
);

-- 2l. carts (1:1 with users)
CREATE TABLE public.carts (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2m. cart_items
CREATE TABLE public.cart_items (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id         uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    variant_id      uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity        integer NOT NULL DEFAULT 1,
    price_at_time   numeric(10,2) NOT NULL DEFAULT 0
);

-- 2n. wishlists
CREATE TABLE public.wishlists (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    variant_id  uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, variant_id)
);

-- 2o. reviews
CREATE TABLE public.reviews (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating      integer NOT NULL,
    comment     text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, product_id),
    CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5)
);

-- 2p. orders
CREATE TABLE public.orders (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status          text NOT NULL DEFAULT 'pending',
    payment_method  text NOT NULL,
    subtotal        numeric(10,2) NOT NULL DEFAULT 0,
    shipping_cost   numeric(10,2) NOT NULL DEFAULT 0,
    discount_total  numeric(10,2) NOT NULL DEFAULT 0,
    grand_total     numeric(10,2) NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT orders_status_check CHECK (status IN ('pending', 'payment_pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('sslcommerz', 'bkash', 'nagad'))
);

-- 2q. order_items
CREATE TABLE public.order_items (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id          uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity            integer NOT NULL DEFAULT 1,
    unit_price          numeric(10,2) NOT NULL DEFAULT 0,
    discount_applied    numeric(10,2) NOT NULL DEFAULT 0,
    product_snapshot    jsonb,
    variant_snapshot    jsonb,
    sku_snapshot        text
);

-- 2r. payments
CREATE TABLE public.payments (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status      text NOT NULL DEFAULT 'pending',
    amount      numeric(10,2) NOT NULL DEFAULT 0,
    currency    text NOT NULL DEFAULT 'BDT',
    gateway_ref text,
    txn_id      text,
    verified_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    verified_at timestamptz,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT payments_status_check CHECK (status IN ('pending', 'verified', 'failed', 'refunded'))
);

-- 2s. shipping_addresses
CREATE TABLE public.shipping_addresses (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    name            text NOT NULL,
    phone           text NOT NULL,
    address         text NOT NULL,
    city            text,
    district        text,
    postal_code     text
);

-- 2t. order_coupons (N:M junction)
CREATE TABLE public.order_coupons (
    order_id        uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    coupon_id       uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    discount_amount numeric(10,2) NOT NULL DEFAULT 0,
    PRIMARY KEY (order_id, coupon_id)
);

-- 2u. audit_logs
CREATE TABLE public.audit_logs (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action      text NOT NULL,
    entity_type text NOT NULL,
    entity_id   uuid NOT NULL,
    meta        jsonb,
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------------
-- 3. updated_at triggers (applied to tables with updated_at column)
-- -------------------------------------------------------------------------

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_updated_at_categories BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_updated_at_brands BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_updated_at_attributes BEFORE UPDATE ON public.attributes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_updated_at_variants BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_updated_at_carts BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_updated_at_zones BEFORE UPDATE ON public.shipping_zones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_updated_at_coupons BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_updated_at_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_updated_at_payments BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------------------------
-- 4. auth.users insert trigger — auto-creates public.users row
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.users (id, role, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------------------------
-- 5. Backfill — create users rows for any existing auth.users
-- -------------------------------------------------------------------------

INSERT INTO public.users (id, role, full_name)
SELECT
    au.id,
    COALESCE(au.raw_user_meta_data->>'role', 'customer'),
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name')
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;

-- -------------------------------------------------------------------------
-- 6. RLS — enable on all tables
-- -------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- 7. RLS Policies
-- -------------------------------------------------------------------------

-- === users ===
-- Everyone can read their own row; admin can read all; admin can update role
CREATE POLICY "users_read_own" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_admin_read_all" ON public.users
    FOR SELECT USING (public.is_admin());

CREATE POLICY "users_admin_update" ON public.users
    FOR UPDATE USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Allow insert from handle_new_user trigger (security definer bypasses RLS)
CREATE POLICY "users_insert_trigger" ON public.users
    FOR INSERT WITH CHECK (true);

-- Allow admin/manager to read basic user info for order management
CREATE POLICY "users_manager_read" ON public.users
    FOR SELECT USING (public.is_admin_or_manager());

-- === categories ===
CREATE POLICY "categories_read_all" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "categories_admin_write" ON public.categories
    FOR INSERT WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "categories_admin_update" ON public.categories
    FOR UPDATE USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "categories_admin_delete" ON public.categories
    FOR DELETE USING (public.is_admin_or_manager());

-- === brands ===
CREATE POLICY "brands_read_all" ON public.brands
    FOR SELECT USING (true);

CREATE POLICY "brands_admin_write" ON public.brands
    FOR INSERT WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "brands_admin_update" ON public.brands
    FOR UPDATE USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "brands_admin_delete" ON public.brands
    FOR DELETE USING (public.is_admin_or_manager());

-- === attributes ===
CREATE POLICY "attributes_read_all" ON public.attributes
    FOR SELECT USING (true);

CREATE POLICY "attributes_admin_write" ON public.attributes
    FOR INSERT WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "attributes_admin_update" ON public.attributes
    FOR UPDATE USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "attributes_admin_delete" ON public.attributes
    FOR DELETE USING (public.is_admin_or_manager());

-- === attribute_values ===
CREATE POLICY "attribute_values_read_all" ON public.attribute_values
    FOR SELECT USING (true);

CREATE POLICY "attribute_values_admin_write" ON public.attribute_values
    FOR INSERT WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "attribute_values_admin_update" ON public.attribute_values
    FOR UPDATE USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "attribute_values_admin_delete" ON public.attribute_values
    FOR DELETE USING (public.is_admin_or_manager());

-- === shipping_zones ===
CREATE POLICY "shipping_zones_read_all" ON public.shipping_zones
    FOR SELECT USING (true);

CREATE POLICY "shipping_zones_admin_write" ON public.shipping_zones
    FOR INSERT WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "shipping_zones_admin_update" ON public.shipping_zones
    FOR UPDATE USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "shipping_zones_admin_delete" ON public.shipping_zones
    FOR DELETE USING (public.is_admin_or_manager());

-- === coupons ===
CREATE POLICY "coupons_read_active" ON public.coupons
    FOR SELECT USING (is_active = true);

CREATE POLICY "coupons_admin_read_all" ON public.coupons
    FOR SELECT USING (public.is_admin_or_manager());

CREATE POLICY "coupons_admin_write" ON public.coupons
    FOR INSERT WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "coupons_admin_update" ON public.coupons
    FOR UPDATE USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "coupons_admin_delete" ON public.coupons
    FOR DELETE USING (public.is_admin_or_manager());

-- === products ===
CREATE POLICY "products_read_active" ON public.products
    FOR SELECT USING (status = 'active' AND deleted_at IS NULL);

CREATE POLICY "products_admin_read_all" ON public.products
    FOR SELECT USING (public.is_admin_or_manager());

CREATE POLICY "products_admin_write" ON public.products
    FOR INSERT WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "products_admin_update" ON public.products
    FOR UPDATE USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "products_admin_delete" ON public.products
    FOR DELETE USING (public.is_admin_or_manager());

-- === product_variants ===
CREATE POLICY "product_variants_read_active" ON public.product_variants
    FOR SELECT USING (is_active = true);

CREATE POLICY "product_variants_admin_read_all" ON public.product_variants
    FOR SELECT USING (public.is_admin_or_manager());

CREATE POLICY "product_variants_admin_write" ON public.product_variants
    FOR INSERT WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "product_variants_admin_update" ON public.product_variants
    FOR UPDATE USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

-- === variant_images ===
CREATE POLICY "variant_images_read_all" ON public.variant_images
    FOR SELECT USING (true);

CREATE POLICY "variant_images_admin_write" ON public.variant_images
    FOR INSERT WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "variant_images_admin_update" ON public.variant_images
    FOR UPDATE USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "variant_images_admin_delete" ON public.variant_images
    FOR DELETE USING (public.is_admin_or_manager());

-- === variant_attribute_values ===
CREATE POLICY "variant_attribute_values_read_all" ON public.variant_attribute_values
    FOR SELECT USING (true);

CREATE POLICY "variant_attribute_values_admin_write" ON public.variant_attribute_values
    FOR INSERT WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "variant_attribute_values_admin_delete" ON public.variant_attribute_values
    FOR DELETE USING (public.is_admin_or_manager());

-- === carts ===
CREATE POLICY "carts_read_own" ON public.carts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "carts_insert_own" ON public.carts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "carts_update_own" ON public.carts
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- === cart_items ===
CREATE POLICY "cart_items_read_own" ON public.cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
              AND carts.user_id = auth.uid()
        )
    );

CREATE POLICY "cart_items_insert_own" ON public.cart_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
              AND carts.user_id = auth.uid()
        )
    );

CREATE POLICY "cart_items_update_own" ON public.cart_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
              AND carts.user_id = auth.uid()
        )
    );

CREATE POLICY "cart_items_delete_own" ON public.cart_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
              AND carts.user_id = auth.uid()
        )
    );

-- === wishlists ===
CREATE POLICY "wishlists_read_own" ON public.wishlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wishlists_insert_own" ON public.wishlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlists_delete_own" ON public.wishlists
    FOR DELETE USING (auth.uid() = user_id);

-- === reviews ===
CREATE POLICY "reviews_read_all" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "reviews_insert_own" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- === orders ===
CREATE POLICY "orders_read_own" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_admin_read_all" ON public.orders
    FOR SELECT USING (public.is_admin_or_manager());

CREATE POLICY "orders_insert_own" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_admin_update" ON public.orders
    FOR UPDATE USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

-- === order_items ===
CREATE POLICY "order_items_read_own" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
              AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "order_items_admin_read_all" ON public.order_items
    FOR SELECT USING (public.is_admin_or_manager());

CREATE POLICY "order_items_insert" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- === payments ===
CREATE POLICY "payments_read_own" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payments.order_id
              AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "payments_admin_read_all" ON public.payments
    FOR SELECT USING (public.is_admin_or_manager());

CREATE POLICY "payments_insert" ON public.payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "payments_admin_update" ON public.payments
    FOR UPDATE USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

-- === shipping_addresses ===
CREATE POLICY "shipping_addresses_read_own" ON public.shipping_addresses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = shipping_addresses.order_id
              AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "shipping_addresses_admin_read_all" ON public.shipping_addresses
    FOR SELECT USING (public.is_admin_or_manager());

CREATE POLICY "shipping_addresses_insert" ON public.shipping_addresses
    FOR INSERT WITH CHECK (true);

-- === order_coupons ===
CREATE POLICY "order_coupons_read_own" ON public.order_coupons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_coupons.order_id
              AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "order_coupons_admin_read_all" ON public.order_coupons
    FOR SELECT USING (public.is_admin_or_manager());

CREATE POLICY "order_coupons_insert" ON public.order_coupons
    FOR INSERT WITH CHECK (true);

-- === audit_logs ===
-- Admin only: read; Admin/Manager: insert (via service); nobody: update/delete
CREATE POLICY "audit_logs_admin_read" ON public.audit_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY "audit_logs_insert" ON public.audit_logs
    FOR INSERT WITH CHECK (public.is_admin_or_manager());

-- -------------------------------------------------------------------------
-- 8. Indexes
-- -------------------------------------------------------------------------

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_products_status ON public.products(status) WHERE deleted_at IS NULL;

CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_stock ON public.product_variants(stock) WHERE is_active = true;

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_status ON public.payments(status);

CREATE INDEX idx_carts_user_id ON public.carts(user_id);

CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);

CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

CREATE INDEX idx_brands_slug ON public.brands(slug);

CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_is_active ON public.coupons(is_active) WHERE is_active = true;

CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- -------------------------------------------------------------------------
-- 9. Supabase Realtime — enable on orders, payments, product_variants
-- -------------------------------------------------------------------------

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_variants;
