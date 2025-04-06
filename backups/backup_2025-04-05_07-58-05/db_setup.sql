-- TrollHairDontCare Database Setup
-- This script creates all the necessary tables for the festival management application

-- Begin transaction
BEGIN;

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================================
-- Core Tables
-- =======================================

-- Profiles table
-- Note: This table extends the auth.users table managed by Supabase Auth
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

-- =======================================
-- Volunteer Management
-- =======================================

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

-- Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volunteer_id UUID NOT NULL REFERENCES public.volunteers ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations ON DELETE CASCADE,
    task_description TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'assigned', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =======================================
-- Crew Management
-- =======================================

-- Crews table
CREATE TABLE IF NOT EXISTS public.crews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    festival_id UUID NOT NULL REFERENCES public.festivals ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    crew_type TEXT NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    shift_length_hours NUMERIC(4,2) NOT NULL,
    min_headcount INTEGER NOT NULL DEFAULT 1,
    max_headcount INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crew members table
CREATE TABLE IF NOT EXISTS public.crew_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crew_id UUID NOT NULL REFERENCES public.crews ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES public.volunteers ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (crew_id, volunteer_id)
);

-- Shifts table
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    festival_id UUID NOT NULL REFERENCES public.festivals ON DELETE CASCADE,
    crew_id UUID NOT NULL REFERENCES public.crews ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    required_volunteers INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL CHECK (status IN ('open', 'filled', 'in-progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shift assignments table
CREATE TABLE IF NOT EXISTS public.shift_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES public.shifts ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES public.volunteers ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('assigned', 'confirmed', 'checked-in', 'completed', 'no-show')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (shift_id, volunteer_id)
);

-- =======================================
-- Messaging System
-- =======================================

-- Channels table
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    festival_id UUID NOT NULL REFERENCES public.festivals ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Channel messages table
CREATE TABLE IF NOT EXISTS public.channel_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES public.channels ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =======================================
-- Musical Acts
-- =======================================

-- Musical acts table
CREATE TABLE IF NOT EXISTS public.musical_acts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    festival_id UUID NOT NULL REFERENCES public.festivals ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    genre TEXT,
    website_url TEXT,
    social_media JSONB,
    performance_duration INTERVAL,
    technical_requirements TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance schedules table
CREATE TABLE IF NOT EXISTS public.performance_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    festival_id UUID NOT NULL REFERENCES public.festivals ON DELETE CASCADE,
    act_id UUID NOT NULL REFERENCES public.musical_acts ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (act_id, start_time)
);

-- =======================================
-- Weather Tracking
-- =======================================

-- Weather forecasts table
CREATE TABLE IF NOT EXISTS public.weather_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    festival_id UUID NOT NULL REFERENCES public.festivals ON DELETE CASCADE,
    forecast_time TIMESTAMPTZ NOT NULL,
    temperature NUMERIC(5,2),
    conditions TEXT,
    precipitation_chance NUMERIC(5,2),
    wind_speed NUMERIC(5,2),
    wind_direction TEXT,
    uv_index NUMERIC(3,1),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =======================================
-- Asset Management
-- =======================================

-- Asset categories table
CREATE TABLE IF NOT EXISTS public.asset_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assets table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    festival_id UUID NOT NULL REFERENCES public.festivals ON DELETE CASCADE,
    category_id UUID REFERENCES public.asset_categories,
    name TEXT NOT NULL,
    description TEXT,
    serial_number TEXT,
    acquisition_date DATE,
    value NUMERIC(10,2),
    status TEXT NOT NULL DEFAULT 'available',
    qr_code TEXT,
    current_location_id UUID REFERENCES public.locations,
    assigned_volunteer_id UUID REFERENCES public.volunteers,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Asset maintenance table
CREATE TABLE IF NOT EXISTS public.asset_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES public.assets ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    description TEXT,
    performed_by TEXT,
    maintenance_date DATE NOT NULL,
    next_maintenance_date DATE,
    cost NUMERIC(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =======================================
-- Setup Row Level Security (RLS) Policies
-- =======================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musical_acts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_maintenance ENABLE ROW LEVEL SECURITY;

-- Create default policies (can be refined later)
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

-- =======================================
-- Create helper functions
-- =======================================

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

-- =======================================
-- Create Triggers for timestamp management
-- =======================================

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

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.assignments
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.crews
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.crew_members
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.shifts
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.shift_assignments
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.channels
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.channel_messages
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.musical_acts
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.performance_schedules
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.weather_forecasts
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.asset_categories
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER IF NOT EXISTS set_timestamp BEFORE UPDATE ON public.asset_maintenance
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- Commit the transaction
COMMIT; 