-- Script to reset the database and apply the new schema
-- WARNING: This will delete all existing data

BEGIN;

-- =================== CLEANUP =====================
-- Drop triggers first to avoid dependency issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remove tables from realtime publication
DO $$
BEGIN
  -- Check if the tables are in the publication before trying to drop them
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'assignments'
    AND schemaname = 'public'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.assignments;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'messages'
    AND schemaname = 'public'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.messages;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'channel_messages'
    AND schemaname = 'public'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.channel_messages;
  END IF;
END $$;

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

-- =================== NEW SCHEMA =====================
-- Create required extensions (may already exist in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    display_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Roles table
CREATE TABLE public.roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User Roles mapping table
CREATE TABLE public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, role_id)
);

-- Festivals table
CREATE TABLE public.festivals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'planning' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Locations table
CREATE TABLE public.locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    festival_id UUID NOT NULL REFERENCES public.festivals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    location_type TEXT,
    coordinates GEOMETRY(POINT, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Volunteers table
CREATE TABLE public.volunteers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    festival_id UUID NOT NULL REFERENCES public.festivals(id) ON DELETE CASCADE,
    application_status TEXT DEFAULT 'pending' NOT NULL,
    notes TEXT,
    availability_start DATE,
    availability_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (profile_id, festival_id)
);

-- Assignments table
CREATE TABLE public.assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    task_description TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Assets table
CREATE TABLE public.assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    festival_id UUID NOT NULL REFERENCES public.festivals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    asset_type TEXT NOT NULL,
    current_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    assigned_volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'available' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Waivers table
CREATE TABLE public.waivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    festival_id UUID NOT NULL REFERENCES public.festivals(id) ON DELETE CASCADE,
    template_content TEXT NOT NULL,
    version TEXT NOT NULL,
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
    signed_at TIMESTAMP WITH TIME ZONE,
    signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Messages table
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    festival_id UUID NOT NULL REFERENCES public.festivals(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'announcement' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Channels table for communication features
CREATE TABLE public.channels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    festival_id UUID NOT NULL REFERENCES public.festivals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Channel Messages table
CREATE TABLE public.channel_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Default data insertion
INSERT INTO public.roles (name, description) VALUES
('admin', 'Administrator with full system access'),
('coordinator', 'Festival coordinator with management capabilities'),
('volunteer', 'Festival volunteer with limited access');

-- Create RLS policies

-- Profiles policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  )
);

CREATE POLICY "Coordinators can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'coordinator'
  )
);

-- Create function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for relevant tables
-- Create the publication if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_messages;

-- Create a test festival for development
INSERT INTO public.festivals (name, description, start_date, end_date, location, status)
VALUES (
  'Folk Festival 2025',
  'Annual celebration of folk music and culture', 
  '2025-06-15', 
  '2025-06-18',
  'Meadowlands Park',
  'planning'
);

COMMIT; 