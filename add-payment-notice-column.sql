-- Add payment_notice column to settings table
-- This migration adds the payment_notice column that was referenced in the code but missing from the database

-- Add the payment_notice column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'payment_notice') THEN
    ALTER TABLE settings ADD COLUMN payment_notice TEXT;
    
    -- Update existing records with a default payment notice
    UPDATE settings 
    SET payment_notice = 'Please note: No payment will be required at this point. I will review your order and get back to you to confirm or discuss options. Thanks'
    WHERE payment_notice IS NULL;
    
    RAISE NOTICE 'Added payment_notice column to settings table';
  ELSE
    RAISE NOTICE 'payment_notice column already exists in settings table';
  END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'settings' AND column_name = 'payment_notice'; 