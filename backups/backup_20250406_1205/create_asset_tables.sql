-- Create asset_categories table
CREATE TABLE IF NOT EXISTS asset_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  serial_number VARCHAR(255),
  category_id UUID REFERENCES asset_categories(id),
  status VARCHAR(50) NOT NULL DEFAULT 'available',
  condition VARCHAR(50) NOT NULL DEFAULT 'good',
  current_location_id UUID,
  assigned_volunteer_id UUID,
  festival_id UUID,
  purchase_date TIMESTAMP WITH TIME ZONE,
  purchase_price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create asset_logs table
CREATE TABLE IF NOT EXISTS asset_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  volunteer_id UUID,
  location_id UUID,
  action VARCHAR(50) NOT NULL,
  action_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  condition_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create asset_maintenance table
CREATE TABLE IF NOT EXISTS asset_maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  performed_by UUID,
  maintenance_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  maintenance_due TIMESTAMP WITH TIME ZONE,
  description TEXT NOT NULL,
  cost DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert some sample asset categories
INSERT INTO asset_categories (name, description)
VALUES 
  ('Audio Equipment', 'Sound systems, microphones, amplifiers, etc.'),
  ('Lighting Equipment', 'Stage lights, LED panels, spotlights, etc.'),
  ('Stage Equipment', 'Platforms, stands, barriers, etc.'),
  ('Tools', 'Hand tools, power tools, etc.'),
  ('Furniture', 'Tables, chairs, tents, etc.')
ON CONFLICT (id) DO NOTHING; 