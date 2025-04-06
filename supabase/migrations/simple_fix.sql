-- Simplified crews table schema fix
BEGIN;

-- Drop the table (warning: this will lose existing data)
DROP TABLE IF EXISTS public.crews CASCADE;

-- Recreate the table with the correct schema
CREATE TABLE public.crews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  crew_type TEXT,
  required_skills JSONB DEFAULT '[]',
  min_headcount INTEGER DEFAULT 1,
  max_headcount INTEGER DEFAULT 1,
  shift_start_time TEXT DEFAULT '08:00',
  shift_end_time TEXT DEFAULT '16:00',
  shift_length_hours INTEGER DEFAULT 4,
  festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allow read access to authenticated users
GRANT SELECT ON public.crews TO authenticated;

-- Allow insert/update/delete for authenticated users
GRANT INSERT, UPDATE, DELETE ON public.crews TO authenticated;

-- Create some sample data
INSERT INTO public.crews (
  name,
  description,
  crew_type,
  required_skills,
  min_headcount,
  max_headcount,
  shift_start_time,
  shift_end_time,
  shift_length_hours,
  festival_id
)
SELECT
  'Sample Crew',
  'A sample crew for testing',
  'Technical',
  '["Sound Equipment", "Lighting"]'::jsonb,
  2,
  4,
  '09:00',
  '17:00',
  8,
  id
FROM
  public.festivals
LIMIT 1;

COMMIT; 