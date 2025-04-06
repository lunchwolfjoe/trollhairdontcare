-- TrollHairDontCare Minimal Database Setup
-- This script creates just the essential tables for the festival management application

-- Begin transaction
BEGIN;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================================
-- Core Tables
-- =======================================

-- Profiles table (extends the auth.users table managed by Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    display_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles junction table
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

-- Festivals table
CREATE TABLE IF NOT EXISTS public.festivals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location TEXT,
    status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
    map_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Locations table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    festival_id UUID NOT NULL REFERENCES public.festivals ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    location_type TEXT NOT NULL,
    coordinates JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Volunteers table
CREATE TABLE IF NOT EXISTS public.volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    festival_id UUID NOT NULL REFERENCES public.festivals ON DELETE CASCADE,
    application_status TEXT NOT NULL CHECK (application_status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    availability_start TIMESTAMPTZ,
    availability_end TIMESTAMPTZ,
    skills TEXT[],
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (profile_id, festival_id)
);

-- Create admin role
INSERT INTO public.roles (name, description) 
VALUES ('admin', 'Administrator with full access') 
ON CONFLICT (name) DO NOTHING;

-- Create coordinator role
INSERT INTO public.roles (name, description) 
VALUES ('coordinator', 'Festival coordinator') 
ON CONFLICT (name) DO NOTHING;

-- Create volunteer role
INSERT INTO public.roles (name, description) 
VALUES ('volunteer', 'Festival volunteer') 
ON CONFLICT (name) DO NOTHING;

-- Function to get current user's roles
CREATE OR REPLACE FUNCTION public.get_user_roles()
RETURNS TABLE (role_name TEXT) 
LANGUAGE SQL SECURITY DEFINER
AS $$
    SELECT r.name
    FROM public.roles r
    JOIN public.user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid();
$$;

-- Count volunteers by status for a festival
CREATE OR REPLACE FUNCTION public.count_volunteers_by_status(festival_id UUID)
RETURNS TABLE (status TEXT, count BIGINT)
LANGUAGE SQL SECURITY DEFINER
AS $$
    SELECT application_status as status, COUNT(*) as count
    FROM public.volunteers
    WHERE volunteers.festival_id = count_volunteers_by_status.festival_id
    GROUP BY application_status;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.festivals
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.locations
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.volunteers
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Create default policies
-- Profile access policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = profiles.id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = profiles.id);

-- Festival access policies
CREATE POLICY "Festivals are viewable by all authenticated users" 
ON public.festivals FOR SELECT 
USING (auth.role() = 'authenticated');

-- Commit the transaction
COMMIT; 