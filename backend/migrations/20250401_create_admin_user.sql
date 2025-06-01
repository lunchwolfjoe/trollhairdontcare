-- First, ensure the roles table exists
CREATE TABLE IF NOT EXISTS public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL
);

-- Create the admin role if it doesn't exist
INSERT INTO public.roles (name)
VALUES ('admin')
ON CONFLICT (name) DO NOTHING;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Now set up the admin user
DO $$
DECLARE
    v_admin_role_id uuid;
    v_admin_user_id uuid;
    v_admin_email text := 'admin@trollhairdontcare.com';
    v_admin_password text := 'Admin123!';
    v_user_exists boolean;
BEGIN
    -- Check if user already exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = v_admin_email) INTO v_user_exists;

    -- Get the admin role ID
    SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'admin';

    IF NOT v_user_exists THEN
        -- Insert the user
        INSERT INTO auth.users (
            email,
            encrypted_password,
            email_confirmed_at,
            raw_user_meta_data
        )
        VALUES (
            v_admin_email,
            crypt(v_admin_password, gen_salt('bf')),
            now(),
            '{"role": "admin"}'::jsonb
        )
        RETURNING id INTO v_admin_user_id;

        -- Create the user's profile
        INSERT INTO public.profiles (id, role)
        VALUES (v_admin_user_id, 'admin')
        ON CONFLICT (id) DO UPDATE
        SET role = 'admin';

        -- Insert the user_role
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (v_admin_user_id, v_admin_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;

        RAISE NOTICE 'Created admin user %', v_admin_email;
    ELSE
        -- Get existing user's ID
        SELECT id INTO v_admin_user_id FROM auth.users WHERE email = v_admin_email;

        -- Update existing user to be admin
        UPDATE auth.users
        SET raw_user_meta_data = jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{role}',
            '"admin"'
        )
        WHERE id = v_admin_user_id;

        -- Ensure the user's profile exists and is set to admin
        INSERT INTO public.profiles (id, role)
        VALUES (v_admin_user_id, 'admin')
        ON CONFLICT (id) DO UPDATE
        SET role = 'admin';

        -- Ensure the user has the admin role
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (v_admin_user_id, v_admin_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;

        RAISE NOTICE 'Updated existing user % to admin', v_admin_email;
    END IF;
END $$; 