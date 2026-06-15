-- Feature 13 — Add cash_on_delivery to orders.payment_method constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check
    CHECK (payment_method IN ('sslcommerz', 'bkash', 'nagad', 'cash_on_delivery'));
