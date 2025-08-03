-- Fix RLS policies for orders table to allow public inserts
-- This migration adds the missing policy for public order creation

-- Drop existing policies for orders table
DROP POLICY IF EXISTS "Admins can manage order requests" ON orders;
DROP POLICY IF EXISTS "Everyone can view order requests" ON orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
DROP POLICY IF EXISTS "Public can view orders" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage request items" ON order_items;
DROP POLICY IF EXISTS "Everyone can view request items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;
DROP POLICY IF EXISTS "Public can view order items" ON order_items;
DROP POLICY IF EXISTS "Public can insert order items" ON order_items;

-- Create new policies for orders table
CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Public can view orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Public can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Create new policies for order_items table
CREATE POLICY "Admins can manage order items" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Public can view order items" ON order_items
  FOR SELECT USING (true);

CREATE POLICY "Public can insert order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname; 