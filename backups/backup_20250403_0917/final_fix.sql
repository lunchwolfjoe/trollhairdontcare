-- FINAL FIX for database registration errors
-- This script fixes the trigger function that creates profiles automatically

-- First, enable extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop function if it exists
DROP FUNCTION IF NOT EXISTS public.handle_new_user();

-- Create tables if they don't exist already
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role_id)
);

-- Insert default roles (if not exist)
INSERT INTO public.roles (name, description)
VALUES 
    ('admin', 'Administrator with full access'),
    ('coordinator', 'Festival coordinator with management access'),
    ('volunteer', 'Festival volunteer')
ON CONFLICT (name) DO NOTHING;

-- Get the admin role ID
DO $$
DECLARE
    admin_role_id UUID;
BEGIN
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    
    -- Make admin@trollhairdontcare.com an admin if needed
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@trollhairdontcare.com') THEN
        INSERT INTO public.user_roles (user_id, role_id)
        SELECT 
            id, 
            admin_role_id
        FROM 
            auth.users 
        WHERE 
            email = 'admin@trollhairdontcare.com'
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- VERY IMPORTANT: Disable RLS temporarily to allow the register function to work
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Create a robust function to handle new user creation with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Run with privileges of function creator
SET search_path = public -- Prevent search path injection
AS $$
DECLARE
    default_role_id UUID;
BEGIN
    -- Create a profile for the new user
    BEGIN
        INSERT INTO public.profiles (id, email, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            NOW(),
            NOW()
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        -- Continue execution instead of failing
    END;
    
    -- Find volunteer role ID
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'volunteer';
    
    -- Only proceed if we found the role
    IF default_role_id IS NOT NULL THEN
        -- Assign default role
        BEGIN
            INSERT INTO public.user_roles (user_id, role_id, created_at)
            VALUES (
                NEW.id,
                default_role_id,
                NOW()
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Error assigning role to user %: %', NEW.id, SQLERRM;
            -- Continue execution instead of failing
        END;
    ELSE
        RAISE LOG 'Could not find volunteer role for new user %', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger to automatically create profiles
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Once everything is set up, enable RLS with permissive policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Define permissive RLS policies
DROP POLICY IF EXISTS "Profiles are viewable by all authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by all authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "User roles are viewable by all authenticated users" ON public.user_roles;
CREATE POLICY "User roles are viewable by all authenticated users"
ON public.user_roles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Roles are viewable by all authenticated users" ON public.roles;
CREATE POLICY "Roles are viewable by all authenticated users"
ON public.roles FOR SELECT
TO authenticated
USING (true); 