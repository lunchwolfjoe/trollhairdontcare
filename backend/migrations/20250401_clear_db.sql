-- Script to clear existing database tables and prepare for new schema
-- WARNING: This will delete all existing data

-- Drop triggers first to avoid dependency issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remove tables from realtime publication
ALTER PUBLICATION IF EXISTS supabase_realtime DROP TABLE IF EXISTS public.assignments;
ALTER PUBLICATION IF EXISTS supabase_realtime DROP TABLE IF EXISTS public.messages;
ALTER PUBLICATION IF EXISTS supabase_realtime DROP TABLE IF EXISTS public.channel_messages;

-- Disable RLS on all tables to make dropping easier
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', r.tablename);
    END LOOP;
END $$;

-- Drop all policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Drop all tables in the correct order (respecting foreign keys)
DROP TABLE IF EXISTS public.channel_messages CASCADE;
DROP TABLE IF EXISTS public.channels CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.waivers CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.volunteers CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.festivals CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Notify completion
DO $$
BEGIN
    RAISE NOTICE 'Database cleared successfully';
END $$; 