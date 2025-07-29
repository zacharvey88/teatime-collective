-- Add 'archived' status to order_requests table
-- This migration adds the 'archived' status option to the existing CHECK constraint

-- First, drop the existing CHECK constraint
ALTER TABLE order_requests DROP CONSTRAINT IF EXISTS order_requests_status_check;

-- Add the new CHECK constraint that includes 'archived'
ALTER TABLE order_requests ADD CONSTRAINT order_requests_status_check 
  CHECK (status IN ('new_request', 'reviewed', 'approved', 'rejected', 'completed', 'archived'));

-- Verify the change
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'order_requests' AND column_name = 'status';

-- Show the constraint details
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'order_requests_status_check';

SELECT 'Successfully added archived status to order_requests table' as status; 