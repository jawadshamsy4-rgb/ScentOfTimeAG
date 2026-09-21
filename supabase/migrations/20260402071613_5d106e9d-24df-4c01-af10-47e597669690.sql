
CREATE TABLE public.category_discounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.category_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view discounts" ON public.category_discounts FOR SELECT USING (true);
CREATE POLICY "Admins can insert discounts" ON public.category_discounts FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update discounts" ON public.category_discounts FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete discounts" ON public.category_discounts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.category_discounts (category, discount_type, discount_value, enabled) VALUES
  ('Men', 'percentage', 0, false),
  ('Women', 'percentage', 0, false),
  ('Oud', 'percentage', 0, false),
  ('Combo', 'percentage', 0, false),
  ('Authentic', 'percentage', 0, false),
  ('Discovery', 'percentage', 0, false);
