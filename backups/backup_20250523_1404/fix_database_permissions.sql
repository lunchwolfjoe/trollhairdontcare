-- Complete SQL script to fix Supabase authentication and permissions issues
-- Run this in your Supabase SQL Editor

-- Fix schema permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant privileges on all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant privileges on all existing functions
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant privileges on all existing sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant privileges on all future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Grant privileges on all future functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- Grant privileges on all future sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- Specific grants for realtime functionality
-- These are the minimum permissions needed if you want to restrict access more tightly
GRANT SELECT ON public.user_roles TO anon, authenticated;
GRANT SELECT ON public.roles TO anon, authenticated;

-- Add any other tables that need realtime access
-- GRANT SELECT ON public.coach_messages TO anon, authenticated;
-- GRANT SELECT ON public.volunteers TO anon, authenticated;
-- GRANT SELECT ON public.tasks TO anon, authenticated;
-- GRANT SELECT ON public.shifts TO anon, authenticated;

-- Create extension for realtime if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- IMPORTANT: After running this script, you also need to:
-- 1. Make sure your tables are added to the supabase_realtime publication
--    (Go to Database → Replication in the Supabase Dashboard)
-- 2. Verify your site URLs are configured in Authentication → URL Configuration
-- 3. If using Row Level Security (RLS), ensure your policies are correctly configured 