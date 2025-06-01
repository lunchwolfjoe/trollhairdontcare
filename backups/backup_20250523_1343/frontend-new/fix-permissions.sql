-- Grant SELECT permissions to the anon and authenticated roles for tables
-- This fixes the 401 Unauthorized error when trying to access data
-- Replace 'festivals' with any other tables you need to access if necessary

-- Grant permissions for festivals table
GRANT SELECT ON public.festivals TO anon, authenticated;

-- Fix the Row Level Security (RLS) policies
-- First, make sure RLS is enabled on the table
ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for SELECT operations
-- This allows any authenticated user to read data
CREATE POLICY "Allow public read access to festivals" 
ON public.festivals
FOR SELECT 
USING (true);

-- If you need to allow inserts as well
CREATE POLICY "Allow authenticated users to insert festivals" 
ON public.festivals
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Enable RLS and set proper policies for other tables with security warnings
-- Donation table
ALTER TABLE public.Donation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to Donation" 
ON public.Donation
FOR SELECT 
USING (true);

-- Volunteer table
ALTER TABLE public.Volunteer ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to Volunteer" 
ON public.Volunteer
FOR SELECT 
USING (true);

-- Event table
ALTER TABLE public.Event ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to Event" 
ON public.Event
FOR SELECT 
USING (true);

-- User table
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to user" 
ON public.user
FOR SELECT 
USING (true);

-- For any other tables that showed up in your security warnings
-- Replace table_name with the actual table name
-- ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access to table_name" 
-- ON public.table_name
-- FOR SELECT 
-- USING (true); 