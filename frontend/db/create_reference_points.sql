-- First clean up any existing tables
DROP TABLE IF EXISTS public.map_reference_points;
DROP TABLE IF EXISTS public.reference_points;

-- Create reference_points table
CREATE TABLE public.reference_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  is_global BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create map_reference_points table for linking reference points to specific maps
CREATE TABLE public.map_reference_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_point_id UUID NOT NULL REFERENCES public.reference_points(id) ON DELETE CASCADE,
  map_id TEXT NOT NULL,
  pixel_x FLOAT NOT NULL,
  pixel_y FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_reference_points_is_global ON public.reference_points(is_global);
CREATE INDEX idx_map_reference_points_map_id ON public.map_reference_points(map_id);
CREATE INDEX idx_map_reference_points_ref_point_id ON public.map_reference_points(reference_point_id);

-- Enable RLS
ALTER TABLE public.reference_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_reference_points ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow all users to read reference points" 
  ON public.reference_points FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to CRUD their own reference points" 
  ON public.reference_points FOR ALL 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all users to read map reference points" 
  ON public.map_reference_points FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to CRUD their own map reference points" 
  ON public.map_reference_points FOR ALL 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add comments
COMMENT ON TABLE public.reference_points IS 'Stores GPS coordinates for reference points';
COMMENT ON TABLE public.map_reference_points IS 'Maps reference points to pixel coordinates on specific maps'; 