-- Simple password reset for development
-- Run this in Supabase SQL Editor

-- Option 1: Update password directly (simplest)
UPDATE auth.users
SET encrypted_password = crypt('password123', gen_salt('bf'))
WHERE email = 'admin@trollhairdontcare.com';

-- Option 2: Delete and recreate the user
-- First, ensure the roles table exists
INSERT INTO public.roles (name, description)
VALUES 
    ('admin', 'Administrator with full access'),
    ('coordinator', 'Festival coordinator with management access'),
    ('volunteer', 'Festival volunteer')
ON CONFLICT (name) DO NOTHING;

-- Delete the user if it exists
DELETE FROM auth.users WHERE email = 'admin@trollhairdontcare.com';

-- Insert new user with known password
INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    raw_app_meta_data
)
VALUES (
    'admin@trollhairdontcare.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    '{"provider": "email", "providers": ["email"]}'
); 