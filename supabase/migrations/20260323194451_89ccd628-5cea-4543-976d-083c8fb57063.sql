-- Add status column to orders
ALTER TABLE public.orders ADD COLUMN status text NOT NULL DEFAULT 'Pending';

-- Drop existing select policy that only allows admin
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

-- Allow anyone to select orders (tracking uses id+phone filter client-side)
CREATE POLICY "Anyone can view orders for tracking"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow admins to update orders (for status changes)
CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));