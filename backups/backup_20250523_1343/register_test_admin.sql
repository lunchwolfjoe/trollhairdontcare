-- This SQL script prepares the database for registering a test admin user
-- Run this in the Supabase SQL Editor

-- Step 1: Make sure roles are created
INSERT INTO public.roles (name, description)
VALUES 
    ('admin', 'Administrator with full access'),
    ('coordinator', 'Festival coordinator with management access'),
    ('volunteer', 'Festival volunteer')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Create an RLS policy that allows users to register themselves as admins (TEMPORARY)
-- WARNING: This is extremely permissive and should be reverted after testing
-- Remember to disable after testing!

-- Disable RLS temporarily to make registration work
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;

-- Step 3: Create a function that will automatically assign the admin role to specific test emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    role_id UUID;
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        NOW(),
        NOW()
    );
    
    -- Determine which role to assign based on email
    IF NEW.email LIKE '%@trollhairdontcare.com' THEN
        -- Assign admin role to any email with this domain
        SELECT id INTO role_id FROM public.roles WHERE name = 'admin';
    ELSE
        -- Default to volunteer role
        SELECT id INTO role_id FROM public.roles WHERE name = 'volunteer';
    END IF;
    
    -- Assign role
    INSERT INTO public.user_roles (user_id, role_id, created_at)
    VALUES (NEW.id, role_id, NOW());
    
    RETURN NEW;
END;
$$;

-- Update or create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Instructions for re-enabling security after testing:

/*
-- IMPORTANT: Run this script after successful testing:

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Then add proper RLS policies
*/ 