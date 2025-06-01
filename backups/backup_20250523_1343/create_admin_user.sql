-- This SQL script creates an admin user directly in the database
-- It should be run in the Supabase SQL Editor

-- Create a consistent UUID for the admin user
DO $$
DECLARE
    admin_user_id UUID := '00000000-0000-0000-0000-000000000001';
    admin_role_id UUID;
BEGIN
    -- Check if the user already exists in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_user_id) THEN
        -- Insert a new user into auth.users with email/password
        -- Note: This uses hashed password 'admin123' (for demo purposes only, use a strong password in production)
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            admin_user_id,
            'admin@trollhairdontcare.com',
            -- This is a hashed version of 'admin123', ONLY for testing
            '$2a$10$C.sLdI34uPqsKX1t8mKFzuzcCYcmGQSGo3yfhYFYfXV0gIPT2tgSG',
            NOW(),
            NOW(),
            NOW(),
            '{"admin": true}'
        );

        -- Create the profile for the admin user
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            created_at,
            updated_at
        )
        VALUES (
            admin_user_id,
            'admin@trollhairdontcare.com',
            'Admin User',
            NOW(),
            NOW()
        );

        -- Look up admin role ID
        SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';

        -- Assign admin role to the user
        INSERT INTO public.user_roles (
            user_id,
            role_id,
            created_at
        )
        VALUES (
            admin_user_id,
            admin_role_id,
            NOW()
        );

        RAISE NOTICE 'Admin user created successfully';
    ELSE
        RAISE NOTICE 'Admin user already exists';
    END IF;
END
$$; 