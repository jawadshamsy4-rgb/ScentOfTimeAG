-- Ensure sequences
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

-- Update the order_number default if not already set correctly
ALTER TABLE public.orders ALTER COLUMN order_number SET DEFAULT 'ST' || LPAD(nextval('public.order_number_seq')::text, 6, '0');

-- 3. Storage Buckets & Policies
INSERT INTO storage.buckets (id, name, public) VALUES 
('hero-slides', 'hero-slides', true),
('product-images', 'product-images', true),
('brand-images', 'brand-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop old policies to replace them
DROP POLICY IF EXISTS "Public View Hero Slides" ON storage.objects;
DROP POLICY IF EXISTS "Public View Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public View Brand Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Hero Slides" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Hero Slides" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Hero Slides" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Brand Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Brand Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Brand Images" ON storage.objects;

-- Create Public Read Policies
CREATE POLICY "Public View Hero Slides" ON storage.objects FOR SELECT USING (bucket_id = 'hero-slides');
CREATE POLICY "Public View Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public View Brand Images" ON storage.objects FOR SELECT USING (bucket_id = 'brand-images');

-- Create Admin Auth Upload/Update/Delete Policies
CREATE POLICY "Admin Upload Hero Slides" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hero-slides');
CREATE POLICY "Admin Update Hero Slides" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'hero-slides');
CREATE POLICY "Admin Delete Hero Slides" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'hero-slides');

CREATE POLICY "Admin Upload Product Images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Admin Update Product Images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "Admin Delete Product Images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

CREATE POLICY "Admin Upload Brand Images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'brand-images');
CREATE POLICY "Admin Update Brand Images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'brand-images');
CREATE POLICY "Admin Delete Brand Images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'brand-images');

-- 4. RPC Functions (SECURITY DEFINER)
-- place_order
CREATE OR REPLACE FUNCTION public.place_order(order_data jsonb)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_order_numbers text[];
  item jsonb;
  new_order_number text;
BEGIN
  inserted_order_numbers := ARRAY[]::text[];
  FOR item IN SELECT * FROM jsonb_array_elements(order_data)
  LOOP
    INSERT INTO public.orders (
      name, phone, address, product, variant, quantity, total_price, delivery_charge, selected_perfumes
    ) VALUES (
      item->>'name',
      item->>'phone',
      item->>'address',
      item->>'product',
      item->>'variant',
      (item->>'quantity')::int,
      (item->>'total_price')::numeric,
      (item->>'delivery_charge')::numeric,
      CASE WHEN item->>'selected_perfumes' IS NOT NULL THEN (SELECT array_agg(x::text) FROM jsonb_array_elements_text(item->'selected_perfumes') x) ELSE NULL END
    ) RETURNING order_number INTO new_order_number;
    
    inserted_order_numbers := array_append(inserted_order_numbers, new_order_number);
  END LOOP;
  
  RETURN inserted_order_numbers;
END;
$$;

-- track_orders_by_phone
CREATE OR REPLACE FUNCTION public.track_orders_by_phone(phone_number text)
RETURNS SETOF public.orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.orders WHERE phone = phone_number ORDER BY created_at DESC;
$$;

-- track_order_by_number
CREATE OR REPLACE FUNCTION public.track_order_by_number(order_num text)
RETURNS SETOF public.orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.orders WHERE order_number = order_num;
$$;

-- has_role (fast check)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Grant Execute on all to public and authenticated
GRANT EXECUTE ON FUNCTION public.place_order(jsonb) TO anon, authenticated, service_role, public;
GRANT EXECUTE ON FUNCTION public.track_orders_by_phone(text) TO anon, authenticated, service_role, public;
GRANT EXECUTE ON FUNCTION public.track_order_by_number(text) TO anon, authenticated, service_role, public;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO anon, authenticated, service_role, public;

-- 5. Admin Role Trigger
CREATE OR REPLACE FUNCTION public.assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'scentoftimebd2025@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.assign_admin_role();
