-- Feature 14 — Add payment_number to payments table (bKash/Nagad MFS)
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_number text;
