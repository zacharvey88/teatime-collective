-- Update order_requests table to make delivery columns optional
-- This migration makes preferred_delivery_date, preferred_delivery_time, and delivery_address nullable

-- Make preferred_delivery_date nullable
ALTER TABLE order_requests ALTER COLUMN preferred_delivery_date DROP NOT NULL;

-- Make preferred_delivery_time nullable  
ALTER TABLE order_requests ALTER COLUMN preferred_delivery_time DROP NOT NULL;

-- Make delivery_address nullable
ALTER TABLE order_requests ALTER COLUMN delivery_address DROP NOT NULL;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'order_requests' 
  AND column_name IN ('preferred_delivery_date', 'preferred_delivery_time', 'delivery_address')
ORDER BY column_name;

-- Show success message
SELECT 'Successfully made delivery columns optional in order_requests table' as status; 