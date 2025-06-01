-- This SQL file contains the necessary grants to fix authentication and realtime issues with Supabase
-- Run this in your Supabase SQL editor

-- Grant select permissions to anon and authenticated roles for realtime functionality
-- Replace 'your_table_name' with each table you want to subscribe to

-- Example for a user_roles table
GRANT SELECT ON public.user_roles TO anon, authenticated;

-- Example for a roles table
GRANT SELECT ON public.roles TO anon, authenticated;

-- Add grants for all your tables that need realtime subscriptions
-- For example:
-- GRANT SELECT ON public.coach_messages TO anon, authenticated;
-- GRANT SELECT ON public.volunteers TO anon, authenticated;
-- GRANT SELECT ON public.tasks TO anon, authenticated;
-- GRANT SELECT ON public.shifts TO anon, authenticated;

-- Make sure RLS (Row Level Security) is enabled on your tables if you need data filtering
-- You might need to adjust your RLS policies to allow the appropriate access

-- If you're using realtime for broadcast, enable the extension if not already enabled
-- This is likely already done, but included for completeness
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Important: Also verify in the Supabase Dashboard that the tables you want 
-- to use with realtime are added to the realtime publication
-- Go to Database → Replication → select the tables in the supabase_realtime publication 