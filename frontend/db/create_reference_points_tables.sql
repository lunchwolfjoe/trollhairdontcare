-- Create reference_points table
CREATE TABLE IF NOT EXISTS public.reference_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  geo_lat FLOAT NOT NULL,
  geo_lng FLOAT NOT NULL,
  is_global BOOLEAN DEFAULT FALSE,
  map_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create map_reference_points table
CREATE TABLE IF NOT EXISTS public.map_reference_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_point_id UUID NOT NULL REFERENCES public.reference_points(id) ON DELETE CASCADE,
  map_id VARCHAR(255) NOT NULL,
  image_x FLOAT NOT NULL,
  image_y FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reference_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_reference_points ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to read reference_points"
  ON public.reference_points
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert reference_points"
  ON public.reference_points
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update reference_points"
  ON public.reference_points
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read map_reference_points"
  ON public.map_reference_points
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert map_reference_points"
  ON public.map_reference_points
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update map_reference_points"
  ON public.map_reference_points
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS reference_points_map_id_idx ON public.reference_points(map_id);
CREATE INDEX IF NOT EXISTS reference_points_is_global_idx ON public.reference_points(is_global);
CREATE INDEX IF NOT EXISTS map_reference_points_reference_point_id_idx ON public.map_reference_points(reference_point_id);
CREATE INDEX IF NOT EXISTS map_reference_points_map_id_idx ON public.map_reference_points(map_id);

-- Add comments
COMMENT ON TABLE public.reference_points IS 'Stores global GPS reference points that can be reused across maps';
COMMENT ON TABLE public.map_reference_points IS 'Stores the relationship between reference points and their coordinates on specific maps'; 