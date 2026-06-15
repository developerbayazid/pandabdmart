-- Add description column to shipping_zones
ALTER TABLE public.shipping_zones
    ADD COLUMN IF NOT EXISTS description text;

-- Insert default shipping methods
INSERT INTO public.shipping_zones (name, cost, description) VALUES
    ('Standard Shipping', 5.00, 'within 3-4 days main city, within 4-7 days outside main city'),
    ('Express Shipping', 9.00, 'within 24-48 hours')
ON CONFLICT DO NOTHING;
