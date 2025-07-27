-- Insert Sample Cake Data
-- Run this after the tables are properly created

-- Insert default cake categories
INSERT INTO cake_categories (name, description, display_order) VALUES
  ('Regular Cakes', 'Traditional sponge cakes with buttercream or ganache', 1),
  ('Frilly Cakes', 'Decorated cakes with piped buttercream designs', 2),
  ('Tray Bakes', 'Large rectangular cakes perfect for sharing', 3),
  ('Cheesecakes', 'Creamy cheesecakes with various toppings', 4)
ON CONFLICT (name) DO NOTHING;

-- Insert default cake sizes for Regular Cakes
INSERT INTO cake_sizes (category_id, name, description, price, display_order) VALUES
  ((SELECT id FROM cake_categories WHERE name = 'Regular Cakes'), '6 inch', '6-8 Large slices', 50.00, 1),
  ((SELECT id FROM cake_categories WHERE name = 'Regular Cakes'), '9 inch', '12-14 Large slices', 60.00, 2),
  ((SELECT id FROM cake_categories WHERE name = 'Regular Cakes'), '12.5 inch', '20 Large slices', 85.00, 3)
ON CONFLICT DO NOTHING;

-- Insert default cake sizes for Frilly Cakes
INSERT INTO cake_sizes (category_id, name, description, price, display_order) VALUES
  ((SELECT id FROM cake_categories WHERE name = 'Frilly Cakes'), '6 inch', '8 Large slices', 70.00, 1),
  ((SELECT id FROM cake_categories WHERE name = 'Frilly Cakes'), '9 inch', '12 Large slices', 80.00, 2),
  ((SELECT id FROM cake_categories WHERE name = 'Frilly Cakes'), '12.5 inch', '20 Large slices', 110.00, 3)
ON CONFLICT DO NOTHING;

-- Insert default cake sizes for Tray Bakes
INSERT INTO cake_sizes (category_id, name, description, price, display_order) VALUES
  ((SELECT id FROM cake_categories WHERE name = 'Tray Bakes'), 'Small Tray', 'Serves 12-15 people', 45.00, 1),
  ((SELECT id FROM cake_categories WHERE name = 'Tray Bakes'), 'Large Tray', 'Serves 20-25 people', 65.00, 2)
ON CONFLICT DO NOTHING;

-- Insert default cake sizes for Cheesecakes
INSERT INTO cake_sizes (category_id, name, description, price, display_order) VALUES
  ((SELECT id FROM cake_categories WHERE name = 'Cheesecakes'), '6 inch', '6-8 slices', 35.00, 1),
  ((SELECT id FROM cake_categories WHERE name = 'Cheesecakes'), '9 inch', '10-12 slices', 45.00, 2)
ON CONFLICT DO NOTHING;

-- Insert some default flavors
INSERT INTO cake_flavors (category_id, name, description, display_order) VALUES
  ((SELECT id FROM cake_categories WHERE name = 'Regular Cakes'), 'Chocolate', 'Rich chocolate sponge with chocolate buttercream', 1),
  ((SELECT id FROM cake_categories WHERE name = 'Regular Cakes'), 'Vanilla', 'Light vanilla sponge with vanilla buttercream', 2),
  ((SELECT id FROM cake_categories WHERE name = 'Regular Cakes'), 'Lemon', 'Zesty lemon sponge with lemon buttercream', 3),
  ((SELECT id FROM cake_categories WHERE name = 'Frilly Cakes'), 'Chocolate Frilly', 'Chocolate cake with piped chocolate buttercream', 1),
  ((SELECT id FROM cake_categories WHERE name = 'Frilly Cakes'), 'Vanilla Frilly', 'Vanilla cake with piped vanilla buttercream', 2),
  ((SELECT id FROM cake_categories WHERE name = 'Tray Bakes'), 'Chocolate Brownie', 'Rich chocolate brownie tray bake', 1),
  ((SELECT id FROM cake_categories WHERE name = 'Tray Bakes'), 'Lemon Drizzle', 'Zesty lemon drizzle tray bake', 2),
  ((SELECT id FROM cake_categories WHERE name = 'Cheesecakes'), 'Classic Vanilla', 'Smooth vanilla cheesecake', 1),
  ((SELECT id FROM cake_categories WHERE name = 'Cheesecakes'), 'Chocolate', 'Rich chocolate cheesecake', 2)
ON CONFLICT DO NOTHING;

-- Show what was inserted
SELECT 'Cake categories:' as info;
SELECT name, description FROM cake_categories ORDER BY display_order;

SELECT 'Cake sizes:' as info;
SELECT c.name as category, s.name as size, s.description, s.price 
FROM cake_sizes s 
JOIN cake_categories c ON s.category_id = c.id 
ORDER BY c.display_order, s.display_order;

SELECT 'Cake flavors:' as info;
SELECT c.name as category, f.name as flavor, f.description 
FROM cake_flavors f 
JOIN cake_categories c ON f.category_id = c.id 
ORDER BY c.display_order, f.display_order; 