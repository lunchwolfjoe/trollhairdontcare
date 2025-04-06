-- Seed data for testing the Welcome Home Portal
-- This script adds sample guest data for the festival check-in process

-- Make sure we have the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to get the latest festival ID
-- This will be used if no specific festival ID is provided
CREATE OR REPLACE FUNCTION get_latest_festival_id() RETURNS UUID AS $$
DECLARE
  festival_id UUID;
BEGIN
  SELECT id INTO festival_id FROM festivals 
  WHERE status = 'active' 
  ORDER BY start_date DESC 
  LIMIT 1;
  
  RETURN festival_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample guest data
DO $$
DECLARE
  festival_id UUID := get_latest_festival_id();
  guest_id UUID;
BEGIN
  -- Only proceed if we have a festival
  IF festival_id IS NOT NULL THEN
    -- Guests with assigned RV spots and different ticket types
    INSERT INTO guests (
      festival_id, 
      full_name, 
      email, 
      phone, 
      rv_spot_number, 
      ticket_type, 
      tow_vehicle_permit, 
      sleeper_vehicle_permit, 
      credentials_issued
    ) VALUES
    -- Full Festival guests
    (festival_id, 'John Smith', 'john.smith@example.com', '555-123-4567', 'A-1', 'Full Festival', true, false, false),
    (festival_id, 'Jane Doe', 'jane.doe@example.com', '555-234-5678', 'A-2', 'Full Festival', false, true, true),
    (festival_id, 'Robert Johnson', 'rjohnson@example.com', '555-345-6789', 'A-3', 'Full Festival', true, true, false),
    (festival_id, 'Sarah Williams', 'swilliams@example.com', '555-456-7890', 'A-4', 'Full Festival', false, false, true),
    (festival_id, 'Michael Davis', 'mdavis@example.com', '555-567-8901', 'A-5', 'Full Festival', true, false, false),
    
    -- Weekend guests
    (festival_id, 'Elizabeth Brown', 'ebrown@example.com', '555-678-9012', 'B-1', 'Weekend', false, false, false),
    (festival_id, 'David Wilson', 'dwilson@example.com', '555-789-0123', 'B-2', 'Weekend', true, false, true),
    (festival_id, 'Jennifer Moore', 'jmoore@example.com', '555-890-1234', 'B-3', 'Weekend', false, true, false),
    
    -- VIP guests
    (festival_id, 'Christopher Taylor', 'ctaylor@example.com', '555-901-2345', 'C-1', 'VIP', true, true, false),
    (festival_id, 'Amanda Thomas', 'athomas@example.com', '555-012-3456', 'C-2', 'VIP', true, false, true),
    (festival_id, 'Kevin Martin', 'kmartin@example.com', '555-123-4567', 'C-3', 'VIP', false, true, false),
    
    -- Artist guests
    (festival_id, 'Laura White', 'lwhite@example.com', '555-234-5678', 'D-1', 'Artist', false, false, true),
    (festival_id, 'Daniel Lee', 'dlee@example.com', '555-345-6789', 'D-2', 'Artist', true, true, false),
    
    -- Day Pass guests (typically don't have RV spots)
    (festival_id, 'Sophia Clark', 'sclark@example.com', '555-456-7890', NULL, 'Day Pass', false, false, false),
    (festival_id, 'James Walker', 'jwalker@example.com', '555-567-8901', NULL, 'Day Pass', false, false, true);
    
    -- Add more varied names with a range of check-in statuses
    INSERT INTO guests (
      festival_id, 
      full_name, 
      email, 
      phone, 
      rv_spot_number, 
      ticket_type, 
      tow_vehicle_permit, 
      sleeper_vehicle_permit, 
      credentials_issued
    ) VALUES
    -- Different last name initials for search testing
    (festival_id, 'Adam Anderson', 'aanderson@example.com', '555-111-2222', 'E-1', 'Full Festival', true, false, false),
    (festival_id, 'Betty Baker', 'bbaker@example.com', '555-222-3333', 'E-2', 'Full Festival', false, true, false),
    (festival_id, 'Carlos Cruz', 'ccruz@example.com', '555-333-4444', 'E-3', 'Weekend', true, true, false),
    (festival_id, 'Diana Davis', 'ddavis@example.com', '555-444-5555', 'E-4', 'Weekend', false, false, true),
    (festival_id, 'Edward Evans', 'eevans@example.com', '555-555-6666', 'E-5', 'VIP', true, false, true),
    (festival_id, 'Fiona Foster', 'ffoster@example.com', '555-666-7777', 'F-1', 'Full Festival', false, true, true),
    (festival_id, 'George Garcia', 'ggarcia@example.com', '555-777-8888', 'F-2', 'Full Festival', true, true, false),
    (festival_id, 'Hannah Hill', 'hhill@example.com', '555-888-9999', 'F-3', 'Weekend', false, false, false),
    (festival_id, 'Isaac Ingram', 'iingram@example.com', '555-999-0000', 'F-4', 'Day Pass', false, false, true),
    (festival_id, 'Julia Jackson', 'jjackson@example.com', '555-000-1111', 'F-5', 'Artist', true, false, false);
    
    RAISE NOTICE 'Added sample guest data for festival %', festival_id;
  ELSE
    RAISE NOTICE 'No active festival found. Please create a festival first.';
  END IF;
END $$; 