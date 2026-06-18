-- Add soft-delete support to categories and brands

ALTER TABLE public.categories
    ADD COLUMN deleted_at timestamptz;

ALTER TABLE public.brands
    ADD COLUMN deleted_at timestamptz;
