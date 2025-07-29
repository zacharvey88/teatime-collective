-- Remove delivery columns from order_requests table
-- This migration removes preferred_delivery_date, preferred_delivery_time, and delivery_address columns

-- Drop the delivery-related columns
ALTER TABLE order_requests DROP COLUMN IF EXISTS preferred_delivery_date;
ALTER TABLE order_requests DROP COLUMN IF EXISTS preferred_delivery_time;
ALTER TABLE order_requests DROP COLUMN IF EXISTS delivery_address;

-- Verify the changes by showing the current table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'order_requests' 
ORDER BY ordinal_position;

-- Show success message
SELECT 'Successfully removed delivery columns from order_requests table' as status; 