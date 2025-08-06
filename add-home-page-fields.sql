-- Add home page title and subheading fields to settings table
-- This migration adds fields for customizing the home page content

-- Add new columns to the settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS home_title TEXT,
ADD COLUMN IF NOT EXISTS home_subheading TEXT;

-- Add comments for documentation
COMMENT ON COLUMN settings.home_title IS 'Custom title for the home page (different from SEO site title)';
COMMENT ON COLUMN settings.home_subheading IS 'Custom subheading for the home page';

-- Update existing settings with default values (only if columns are empty)
UPDATE settings 
SET 
  home_title = COALESCE(home_title, 'Teatime Collective'),
  home_subheading = COALESCE(home_subheading, 'Delicious Vegan Cakes & Bakes')
WHERE home_title IS NULL OR home_subheading IS NULL;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'settings' 
AND column_name IN ('home_title', 'home_subheading')
ORDER BY ordinal_position; 