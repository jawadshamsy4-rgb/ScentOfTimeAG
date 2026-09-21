
-- Create reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  comment text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (true);

-- Anyone can submit a review
CREATE POLICY "Anyone can submit reviews" ON public.reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Admins can delete reviews
CREATE POLICY "Admins can delete reviews" ON public.reviews
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update reviews
CREATE POLICY "Admins can update reviews" ON public.reviews
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
