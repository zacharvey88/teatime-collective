-- Complete Supabase Setup for Teatime Collective (Safe Version)
-- This script is safe to run on existing databases - no data loss
-- Run this in your Supabase SQL editor

-- ========================================
-- 1. STORAGE SETUP
-- ========================================

-- Create storage bucket for images (safe - won't overwrite)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public read access to images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all images" ON storage.objects;

-- Create admin_users policies
CREATE POLICY "Admins can view admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.email = auth.jwt() ->> 'email' 
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage admin users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.email = auth.jwt() ->> 'email' 
      AND au.is_active = true 
      AND au.role IN ('superadmin', 'admin')
    )
  );

-- Create storage policies for the images bucket
CREATE POLICY "Public read access to images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can manage all images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'images' 
    AND auth.jwt() ->> 'email' = 'zac.harvey@gmail.com'
  );

-- ========================================
-- 2. SETTINGS SETUP
-- ========================================

-- Create settings table (safe - won't overwrite)
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  logo_url TEXT,
  order_email TEXT NOT NULL,
  site_title TEXT NOT NULL,
  site_description TEXT NOT NULL,
  primary_color TEXT NOT NULL DEFAULT '#FF6B35',
  payment_notice TEXT,
  cart_notice TEXT,
  cake_search_enabled BOOLEAN DEFAULT true,
  cakes_subheading TEXT,
  order_subheading TEXT,
  show_order_form_notice BOOLEAN DEFAULT true,
  show_cart_notice BOOLEAN DEFAULT true,
  home_title TEXT,
  home_subheading TEXT,
  cakes_heading TEXT,
  order_heading TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist (safe migration)
DO $$ 
BEGIN
  -- Add payment_notice column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'payment_notice') THEN
    ALTER TABLE settings ADD COLUMN payment_notice TEXT;
  END IF;
  
  -- Add cart_notice column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'cart_notice') THEN
    ALTER TABLE settings ADD COLUMN cart_notice TEXT;
  END IF;
  
  -- Add cake_search_enabled column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'cake_search_enabled') THEN
    ALTER TABLE settings ADD COLUMN cake_search_enabled BOOLEAN DEFAULT true;
  END IF;
  
  -- Add cakes_subheading column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'cakes_subheading') THEN
    ALTER TABLE settings ADD COLUMN cakes_subheading TEXT;
  END IF;
  
  -- Add order_subheading column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'order_subheading') THEN
    ALTER TABLE settings ADD COLUMN order_subheading TEXT;
  END IF;
  
  -- Add show_order_form_notice column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'show_order_form_notice') THEN
    ALTER TABLE settings ADD COLUMN show_order_form_notice BOOLEAN DEFAULT true;
  END IF;
  
  -- Add show_cart_notice column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'show_cart_notice') THEN
    ALTER TABLE settings ADD COLUMN show_cart_notice BOOLEAN DEFAULT true;
  END IF;
  
  -- Add home_title column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'home_title') THEN
    ALTER TABLE settings ADD COLUMN home_title TEXT;
  END IF;
  
  -- Add home_subheading column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'home_subheading') THEN
    ALTER TABLE settings ADD COLUMN home_subheading TEXT;
  END IF;
  
  -- Add cakes_heading column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'cakes_heading') THEN
    ALTER TABLE settings ADD COLUMN cakes_heading TEXT;
  END IF;
  
  -- Add order_heading column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'order_heading') THEN
    ALTER TABLE settings ADD COLUMN order_heading TEXT;
  END IF;
END $$;

-- Insert default settings (only if table is empty)
INSERT INTO settings (
  order_email, 
  site_title, 
  site_description, 
  primary_color,
  payment_notice,
  cart_notice,
  cake_search_enabled,
  show_order_form_notice,
  show_cart_notice
)
SELECT 
  'orders@teatimecollective.co.uk',
  'Teatime Collective - Delicious Vegan Cakes',
  'Vegan Cakes and Bakes, Festival Caterers and Market Traders since 2013.',
  '#FF6B35',
  'Please note: No payment will be required at this point. I will review your order and get back to you to confirm or discuss options. Thanks',
  'Prices shown are estimates and may vary based on special requests, decorations, dietary requirements, and other factors. Final pricing will be confirmed when we review your order.',
  true,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM settings);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can read settings" ON settings;
DROP POLICY IF EXISTS "Admins can update settings" ON settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON settings;
DROP POLICY IF EXISTS "Public can read settings" ON settings;

-- Create policies
CREATE POLICY "Admins can read settings" ON settings
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'zac.harvey@gmail.com'
  );

CREATE POLICY "Admins can update settings" ON settings
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = 'zac.harvey@gmail.com'
  );

CREATE POLICY "Admins can insert settings" ON settings
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = 'zac.harvey@gmail.com'
  );

CREATE POLICY "Public can read settings" ON settings
  FOR SELECT USING (true);

-- ========================================
-- 3. ORDER REQUESTS SETUP
-- ========================================

-- Create order_requests table (safe - won't overwrite)
CREATE TABLE IF NOT EXISTS order_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferred_collection_date DATE,
  preferred_collection_time TIME,
  estimated_total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'new_request' CHECK (status IN ('new_request', 'reviewed', 'approved', 'rejected', 'completed')),
  email_sent BOOLEAN DEFAULT false,
  notes TEXT,
  special_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table (safe - won't overwrite)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES order_requests(id) ON DELETE CASCADE,
  cake_id UUID REFERENCES cakes(id) ON DELETE SET NULL,
  cake_size_id UUID REFERENCES cake_sizes(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  estimated_unit_price DECIMAL(10,2) NOT NULL,
  estimated_total_price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table (safe - won't overwrite)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'editor', 'viewer')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table (safe - won't overwrite)
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,

  first_order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_orders INTEGER DEFAULT 0,
  total_value DECIMAL(10,2) DEFAULT 0,
  favorite_flavor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. CAKE MANAGEMENT TABLES SETUP
-- ========================================

-- Create cake_categories table (safe - won't overwrite)
CREATE TABLE IF NOT EXISTS cake_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cake_sizes table (safe - won't overwrite)
CREATE TABLE IF NOT EXISTS cake_sizes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES cake_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cakes table (safe - won't overwrite)
CREATE TABLE IF NOT EXISTS cakes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category_id UUID REFERENCES cake_categories(id) ON DELETE SET NULL,
  flavor_id UUID REFERENCES cake_sizes(id) ON DELETE SET NULL,
  cake_type TEXT NOT NULL CHECK (cake_type IN ('standalone', 'categorised')),
  price_override DECIMAL(10,2),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cake tables
ALTER TABLE cake_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cake_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cakes ENABLE ROW LEVEL SECURITY;

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;

-- Drop existing cake policies if they exist
DROP POLICY IF EXISTS "Admins can manage cake categories" ON cake_categories;
DROP POLICY IF EXISTS "Everyone can view cake categories" ON cake_categories;
DROP POLICY IF EXISTS "Admins can manage cake sizes" ON cake_sizes;
DROP POLICY IF EXISTS "Everyone can view cake sizes" ON cake_sizes;


-- Create RLS policies for cake tables
CREATE POLICY "Admins can manage cake categories" ON cake_categories
  FOR ALL USING (is_admin_user());

CREATE POLICY "Everyone can view cake categories" ON cake_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage cake sizes" ON cake_sizes
  FOR ALL USING (is_admin_user());

CREATE POLICY "Everyone can view cake sizes" ON cake_sizes
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage cakes" ON cakes
  FOR ALL USING (is_admin_user());

CREATE POLICY "Everyone can view cakes" ON cakes
  FOR SELECT USING (true);



-- Insert default cake categories
INSERT INTO cake_categories (name, description) VALUES
  ('Regular Cakes', 'Traditional sponge cakes with buttercream or ganache'),
  ('Frilly Cakes', 'Decorated cakes with piped buttercream designs'),
  ('Tray Bakes', 'Large rectangular cakes perfect for sharing'),
  ('Cheesecakes', 'Creamy cheesecakes with various toppings')
ON CONFLICT (name) DO NOTHING;

-- Insert default cake sizes for Regular Cakes
INSERT INTO cake_sizes (category_id, name, description, price) VALUES
  ((SELECT id FROM cake_categories WHERE name = 'Regular Cakes'), '6 inch', '6-8 Large slices', 50.00),
  ((SELECT id FROM cake_categories WHERE name = 'Regular Cakes'), '9 inch', '12-14 Large slices', 60.00),
  ((SELECT id FROM cake_categories WHERE name = 'Regular Cakes'), '12.5 inch', '20 Large slices', 85.00)
ON CONFLICT DO NOTHING;

-- Insert default cake sizes for Frilly Cakes
INSERT INTO cake_sizes (category_id, name, description, price) VALUES
  ((SELECT id FROM cake_categories WHERE name = 'Frilly Cakes'), '6 inch', '8 Large slices', 70.00),
  ((SELECT id FROM cake_categories WHERE name = 'Frilly Cakes'), '9 inch', '12 Large slices', 80.00),
  ((SELECT id FROM cake_categories WHERE name = 'Frilly Cakes'), '12.5 inch', '20 Large slices', 110.00)
ON CONFLICT DO NOTHING;

-- Insert default cake sizes for Tray Bakes
INSERT INTO cake_sizes (category_id, name, description, price) VALUES
  ((SELECT id FROM cake_categories WHERE name = 'Tray Bakes'), 'Small Tray', 'Serves 12-15 people', 45.00),
  ((SELECT id FROM cake_categories WHERE name = 'Tray Bakes'), 'Large Tray', 'Serves 20-25 people', 65.00)
ON CONFLICT DO NOTHING;

-- Insert default cake sizes for Cheesecakes
INSERT INTO cake_sizes (category_id, name, description, price) VALUES
  ((SELECT id FROM cake_categories WHERE name = 'Cheesecakes'), '6 inch', '6-8 slices', 35.00),
  ((SELECT id FROM cake_categories WHERE name = 'Cheesecakes'), '9 inch', '10-12 slices', 45.00)
ON CONFLICT DO NOTHING;



-- ========================================
-- 5. IMAGE TABLES SETUP
-- ========================================

-- Create carousel_images table (safe - won't overwrite)
CREATE TABLE IF NOT EXISTS carousel_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wedding_images table (safe - won't overwrite)
CREATE TABLE IF NOT EXISTS wedding_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create festival_images table (safe - won't overwrite)
CREATE TABLE IF NOT EXISTS festival_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage order requests" ON order_requests;
DROP POLICY IF EXISTS "Everyone can view order requests" ON order_requests;
DROP POLICY IF EXISTS "Admins can manage request items" ON request_items;
DROP POLICY IF EXISTS "Everyone can view request items" ON request_items;
DROP POLICY IF EXISTS "Admins can manage customers" ON customers;
DROP POLICY IF EXISTS "Everyone can view customers" ON customers;
DROP POLICY IF EXISTS "Admins can manage carousel images" ON carousel_images;
DROP POLICY IF EXISTS "Everyone can view carousel images" ON carousel_images;
DROP POLICY IF EXISTS "Admins can manage wedding images" ON wedding_images;
DROP POLICY IF EXISTS "Everyone can view wedding images" ON wedding_images;
DROP POLICY IF EXISTS "Admins can manage festival images" ON festival_images;
DROP POLICY IF EXISTS "Everyone can view festival images" ON festival_images;

-- Create RLS policies for order_requests
CREATE POLICY "Admins can manage order requests" ON order_requests
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'zac.harvey@gmail.com'
  );

CREATE POLICY "Everyone can view order requests" ON order_requests
  FOR SELECT USING (true);

-- Create RLS policies for request_items
CREATE POLICY "Admins can manage request items" ON request_items
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'zac.harvey@gmail.com'
  );

CREATE POLICY "Everyone can view request items" ON request_items
  FOR SELECT USING (true);

-- Create RLS policies for customers
CREATE POLICY "Admins can manage customers" ON customers
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'zac.harvey@gmail.com'
  );

CREATE POLICY "Everyone can view customers" ON customers
  FOR SELECT USING (true);

-- Create RLS policies for carousel_images
CREATE POLICY "Admins can manage carousel images" ON carousel_images
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'zac.harvey@gmail.com'
  );

CREATE POLICY "Everyone can view carousel images" ON carousel_images
  FOR SELECT USING (true);

-- Create RLS policies for wedding_images
CREATE POLICY "Admins can manage wedding images" ON wedding_images
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'zac.harvey@gmail.com'
  );

CREATE POLICY "Everyone can view wedding images" ON wedding_images
  FOR SELECT USING (true);

-- Create RLS policies for festival_images
CREATE POLICY "Admins can manage festival images" ON festival_images
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'zac.harvey@gmail.com'
  );

CREATE POLICY "Everyone can view festival images" ON festival_images
  FOR SELECT USING (true);

-- Create or replace functions (safe - will update existing functions)
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update customer record
  INSERT INTO customers (email, name, phone, first_order_date, last_order_date, total_orders, total_value)
  VALUES (
    NEW.customer_email,
    NEW.customer_name,
    NEW.customer_phone,
    NEW.collection_date,
    NEW.collection_date,
    1,
    NEW.estimated_total
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    phone = COALESCE(EXCLUDED.phone, customers.phone),
    last_order_date = EXCLUDED.last_order_date,
    total_orders = customers.total_orders + 1,
    total_value = customers.total_value + EXCLUDED.total_estimated_total,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_favorite_cake()
RETURNS TRIGGER AS $$
BEGIN
  -- Update customer's favorite cake based on most ordered
  UPDATE customers
  SET favourite_cake = (
    SELECT c.name
    FROM request_items ri
    JOIN cakes c ON ri.cake_id = c.id
    WHERE ri.request_id IN (
      SELECT id FROM order_requests WHERE customer_email = (
        SELECT customer_email FROM order_requests WHERE id = NEW.request_id
      )
    )
    GROUP BY c.name
    ORDER BY COUNT(*) DESC
    LIMIT 1
  )
  WHERE email = (
    SELECT customer_email FROM order_requests WHERE id = NEW.request_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_order_request_created ON order_requests;
DROP TRIGGER IF EXISTS on_request_item_created ON request_items;

-- Create triggers
CREATE TRIGGER on_order_request_created
  AFTER INSERT ON order_requests
  FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

CREATE TRIGGER on_request_item_created
  AFTER INSERT ON request_items
  FOR EACH ROW EXECUTE FUNCTION update_favorite_cake();

-- ========================================
-- 4. SAMPLE DATA (Optional)
-- ========================================

-- Sample data removed - tables will be empty by default

-- Create market_dates table (safe - won't overwrite)
CREATE TABLE IF NOT EXISTS market_dates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT NOT NULL,
  url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add url column if it doesn't exist (safe migration)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_dates' AND column_name = 'url') THEN
    ALTER TABLE market_dates ADD COLUMN url TEXT;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE market_dates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read active market dates" ON market_dates;
DROP POLICY IF EXISTS "Admins can manage market dates" ON market_dates;

-- Create policies
CREATE POLICY "Public can read active market dates" ON market_dates
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage market dates" ON market_dates
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'zac.harvey@gmail.com'
  );

-- Sample market dates removed - table will be empty by default

-- Insert default admin user (only if table is empty)
INSERT INTO admin_users (email, name, role, permissions, is_active)
SELECT 
  'zac.harvey@gmail.com',
  'Zac Harvey',
  'superadmin',
  '{"manage_cakes": true, "manage_orders": true, "manage_reviews": true, "manage_markets": true, "manage_settings": true, "manage_admins": true}',
  true
WHERE NOT EXISTS (SELECT 1 FROM admin_users);

-- Success message
SELECT 'Teatime Collective Supabase setup completed successfully!' as status; 