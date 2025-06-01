-- Add new columns to the assets table to support different location types
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS location_type VARCHAR(50) DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(9,6),
ADD COLUMN IF NOT EXISTS location_long DECIMAL(9,6);

-- Add comment to explain the location_type field
COMMENT ON COLUMN assets.location_type IS 'Type of location: fixed, mobile, or storage';

-- Add comment to explain current_location_id usage based on location_type
COMMENT ON COLUMN assets.current_location_id IS 'For fixed: location ID/name, for mobile: current assignment (optional), for storage: storage location';

-- Add indexes for improved search performance
CREATE INDEX IF NOT EXISTS idx_assets_location_type ON assets(location_type);
CREATE INDEX IF NOT EXISTS idx_assets_festival_id ON assets(festival_id);

-- Update any existing assets to have a location_type of 'fixed' by default
UPDATE assets SET location_type = 'fixed' WHERE location_type IS NULL; 