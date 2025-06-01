-- This SQL script resets the password for an existing admin user
-- Run this in the Supabase SQL Editor

-- Step 1: First ensure the admin role exists
DO $$
DECLARE
    admin_role_id UUID;
BEGIN
    -- Check if admin role exists
    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'admin') THEN
        -- Create admin role
        INSERT INTO public.roles (name, description)
        VALUES ('admin', 'Administrator with full access')
        RETURNING id INTO admin_role_id;
        
        RAISE NOTICE 'Admin role created with ID: %', admin_role_id;
    ELSE
        SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
        RAISE NOTICE 'Admin role already exists with ID: %', admin_role_id;
    END IF;
END
$$;

-- Step 2: Reset password for admin user if they exist
-- For security, this uses Supabase's built-in function
-- Password will be temporarily set to 'admin123' (change this immediately after login)
SELECT 
    auth.uid() AS current_user,
    (SELECT COUNT(*) FROM auth.users WHERE email = 'admin@trollhairdontcare.com') AS admin_exists;

-- To reset the password, uncomment the following line and run it separately in a SQL query:
-- SELECT * FROM auth.users WHERE email = 'admin@trollhairdontcare.com';

-- IMPORTANT: You need to reset the password through the Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Find admin@trollhairdontcare.com
-- 3. Click the three dots, select "Reset password"
-- 4. Set a new password

-- Step 3: Ensure the admin user has the admin role
DO $$
DECLARE
    admin_user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Get admin user ID if user exists
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@trollhairdontcare.com';
    
    IF admin_user_id IS NOT NULL THEN
        RAISE NOTICE 'Admin user exists with ID: %', admin_user_id;
        
        -- Check if admin profile exists
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_user_id) THEN
            -- Create profile for admin
            INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
            VALUES (admin_user_id, 'admin@trollhairdontcare.com', 'Admin User', NOW(), NOW());
            
            RAISE NOTICE 'Admin profile created';
        ELSE
            RAISE NOTICE 'Admin profile already exists';
        END IF;
        
        -- Get admin role ID
        SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
        
        -- Assign admin role if not already assigned
        IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = admin_user_id AND role_id = admin_role_id) THEN
            INSERT INTO public.user_roles (user_id, role_id, created_at)
            VALUES (admin_user_id, admin_role_id, NOW());
            
            RAISE NOTICE 'Admin role assigned to user';
        ELSE
            RAISE NOTICE 'Admin role already assigned to user';
        END IF;
    ELSE
        RAISE NOTICE 'Admin user does not exist. Please register an admin user first.';
    END IF;
END
$$; 