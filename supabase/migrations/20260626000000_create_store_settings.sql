-- Create store_settings table — single-row config for the entire store

CREATE TABLE public.store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name TEXT NOT NULL DEFAULT 'PandaBDMart',
    store_email TEXT,
    store_phone TEXT,
    store_address TEXT,
    meta_title TEXT DEFAULT 'PandaBDMart - Online Shopping in Bangladesh',
    meta_description TEXT DEFAULT 'Shop the best products at PandaBDMart. Fast delivery across Bangladesh.',
    facebook_url TEXT,
    instagram_url TEXT,
    youtube_url TEXT,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    stock_reservation_minutes INTEGER NOT NULL DEFAULT 20,
    logo_url TEXT,
    favicon_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the single default row
INSERT INTO public.store_settings (store_name)
VALUES ('PandaBDMart');

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read store_settings" ON public.store_settings
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.role = 'admin'
    ));

CREATE POLICY "Admins can update store_settings" ON public.store_settings
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.role = 'admin'
    ));
