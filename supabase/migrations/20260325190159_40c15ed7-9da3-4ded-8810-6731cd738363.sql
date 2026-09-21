
-- Add order_number column
ALTER TABLE public.orders ADD COLUMN order_number text UNIQUE;

-- Create sequence for order numbers
CREATE SEQUENCE public.order_number_seq START 1;

-- Backfill existing orders
UPDATE public.orders
SET order_number = 'SO' || LPAD(nextval('public.order_number_seq')::text, 6, '0')
WHERE order_number IS NULL;

-- Make it NOT NULL after backfill
ALTER TABLE public.orders ALTER COLUMN order_number SET NOT NULL;

-- Set default for new orders
ALTER TABLE public.orders ALTER COLUMN order_number SET DEFAULT 'SO' || LPAD(nextval('public.order_number_seq')::text, 6, '0');
