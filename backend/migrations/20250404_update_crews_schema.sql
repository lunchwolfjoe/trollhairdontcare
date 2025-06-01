-- Migration to update the crews table schema to match the application expectations
BEGIN;

-- First, save any existing data that we want to preserve
CREATE TEMPORARY TABLE crews_backup AS
SELECT 
  id, 
  name, 
  description, 
  crew_type, 
  festival_id, 
  created_at, 
  updated_at
FROM public.crews;

-- Drop the existing table
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

-- Restore data (mapping fields as needed)
INSERT INTO public.crews (
  id, 
  name, 
  description, 
  crew_type, 
  festival_id, 
  created_at, 
  updated_at
)
SELECT 
  id, 
  name, 
  description, 
  crew_type, 
  festival_id, 
  created_at, 
  updated_at
FROM crews_backup
ON CONFLICT DO NOTHING;

-- Set some default values for the new fields
UPDATE public.crews 
SET 
  shift_start_time = '08:00', 
  shift_end_time = '16:00', 
  shift_length_hours = 8, 
  min_headcount = 1,
  max_headcount = 1,
  required_skills = '[]'::jsonb;

-- Allow read access to authenticated users
GRANT SELECT ON public.crews TO authenticated;

-- Allow insert/update/delete for authenticated users
GRANT INSERT, UPDATE, DELETE ON public.crews TO authenticated;

-- Clean up
DROP TABLE IF EXISTS crews_backup;

COMMIT; 