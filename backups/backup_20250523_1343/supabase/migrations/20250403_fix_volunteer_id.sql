-- Fix for volunteer_id type mismatch in assignments table
BEGIN;

-- First, drop the existing foreign key constraints if they exist
ALTER TABLE IF EXISTS public.assignments 
DROP CONSTRAINT IF EXISTS assignments_volunteer_id_fkey;

ALTER TABLE IF EXISTS public.assignments 
DROP CONSTRAINT IF EXISTS assignments_location_id_fkey;

-- Drop the tables if they exist (in correct order)
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.volunteers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.festivals CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.is_coordinator(UUID);
DROP FUNCTION IF EXISTS public.is_volunteer(UUID);

-- Create required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create helper functions for role checking
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = uid AND r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_coordinator(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = uid AND r.name = 'coordinator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_volunteer(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = uid AND r.name = 'volunteer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create roles table first (no dependencies)
CREATE TABLE public.roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create profiles table (depends on auth.users)
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

-- Create user_roles table (depends on profiles and roles)
CREATE TABLE public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, role_id)
);

-- Create festivals table (no dependencies)
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

-- Create locations table (depends on festivals)
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

-- Create volunteers table (depends on profiles and festivals)
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

-- Create assignments table (depends on volunteers and locations)
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

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
('admin', 'Administrator with full system access'),
('coordinator', 'Festival coordinator with management capabilities'),
('volunteer', 'Festival volunteer with limited access');

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
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

-- Create roles policies
CREATE POLICY "Roles are readable by all authenticated users"
ON public.roles FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Roles can only be managed by admins"
ON public.roles FOR ALL
USING (public.is_admin(auth.uid()));

-- Create user_roles policies
CREATE POLICY "User roles are viewable by admins and coordinators"
ON public.user_roles FOR SELECT
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "User roles can only be managed by admins"
ON public.user_roles FOR ALL
USING (public.is_admin(auth.uid()));

-- Create festivals policies
CREATE POLICY "Festivals are readable by all authenticated users"
ON public.festivals FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Festivals can only be managed by admins and coordinators"
ON public.festivals FOR ALL
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

-- Create locations policies
CREATE POLICY "Locations are readable by all authenticated users"
ON public.locations FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Locations can only be managed by admins and coordinators"
ON public.locations FOR ALL
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

-- Create volunteers policies
CREATE POLICY "Volunteers are viewable by admins and coordinators"
ON public.volunteers FOR SELECT
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

CREATE POLICY "Volunteers can view their own records"
ON public.volunteers FOR SELECT
USING (profile_id = auth.uid());

CREATE POLICY "Volunteers can be created by admins, coordinators, or self-registration"
ON public.volunteers FOR INSERT
WITH CHECK (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid()) OR
  profile_id = auth.uid()
);

CREATE POLICY "Volunteers can be updated by admins, coordinators, or themselves"
ON public.volunteers FOR UPDATE
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid()) OR
  profile_id = auth.uid()
);

CREATE POLICY "Volunteers can be deleted by admins or coordinators"
ON public.volunteers FOR DELETE
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

-- Create assignments policies
CREATE POLICY "Assignments are viewable by admins and coordinators"
ON public.assignments FOR SELECT
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

CREATE POLICY "Volunteers can view their own assignments"
ON public.assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.volunteers v
    WHERE v.id = volunteer_id AND v.profile_id = auth.uid()
  )
);

CREATE POLICY "Assignments can be managed by admins and coordinators"
ON public.assignments FOR ALL
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

COMMIT; 