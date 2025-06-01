-- First, ensure the roles table exists
CREATE TABLE IF NOT EXISTS public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL
);

-- Create roles if they don't exist
INSERT INTO public.roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.roles (name) VALUES ('coordinator') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.roles (name) VALUES ('volunteer') ON CONFLICT (name) DO NOTHING;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Create a test user directly in the auth.users table
DO $$
DECLARE
    v_test_user_id uuid;
    v_admin_role_id uuid;
BEGIN
    -- Get the admin role ID
    SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'admin';
    
    -- Create the test user
    INSERT INTO auth.users (
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data
    )
    VALUES (
        'test@trollhairdontcare.com',
        crypt('Test123!', gen_salt('bf')),
        now(),
        '{"role": "admin"}'::jsonb
    )
    RETURNING id INTO v_test_user_id;
    
    -- Add the user role
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (v_test_user_id, v_admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RAISE NOTICE 'Created test user with ID: %', v_test_user_id;
END $$; 