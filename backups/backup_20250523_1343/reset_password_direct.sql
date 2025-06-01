-- Reset password directly in the database
-- CAUTION: This should only be used in development environments
-- Run this in the Supabase SQL Editor

-- Option 1: Using auth.users_with_password function (preferred)
-- This uses Supabase's built-in function to properly hash passwords
SELECT auth.users_with_password('admin@trollhairdontcare.com', 'password123');

-- Option 2: Creating a new user if it doesn't exist
DO $$
DECLARE
    user_exists boolean;
    admin_role_id UUID;
BEGIN
    -- Check if user exists
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'admin@trollhairdontcare.com'
    ) INTO user_exists;

    IF user_exists THEN
        -- User exists, print message
        RAISE NOTICE 'User exists - password has been reset using the users_with_password function above';
    ELSE
        -- Create new user
        INSERT INTO auth.users (
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            role,
            raw_app_meta_data,
            raw_user_meta_data
        )
        VALUES (
            'admin@trollhairdontcare.com',
            crypt('password123', gen_salt('bf')),  -- Hashing password with bcrypt
            NOW(),  -- Email already confirmed
            NOW(),
            NOW(),
            'authenticated',
            '{"provider": "email", "providers": ["email"]}',
            '{}'
        );
        
        -- Get the user ID
        DECLARE user_id UUID;
        BEGIN
            SELECT id INTO user_id FROM auth.users WHERE email = 'admin@trollhairdontcare.com';
            
            -- Create profile
            INSERT INTO public.profiles (id, email, created_at, updated_at)
            VALUES (user_id, 'admin@trollhairdontcare.com', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
            
            -- Find admin role ID
            SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
            
            IF admin_role_id IS NULL THEN
                -- Create admin role if it doesn't exist
                INSERT INTO public.roles (name, description)
                VALUES ('admin', 'Administrator with full access')
                RETURNING id INTO admin_role_id;
            END IF;
            
            -- Assign admin role
            INSERT INTO public.user_roles (user_id, role_id, created_at)
            VALUES (user_id, admin_role_id, NOW())
            ON CONFLICT (user_id, role_id) DO NOTHING;
            
            RAISE NOTICE 'Created new admin user';
        END;
    END IF;
END $$; 