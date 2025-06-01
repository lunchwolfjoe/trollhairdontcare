-- First, ensure the admin role exists
INSERT INTO public.roles (name)
VALUES ('admin')
ON CONFLICT (name) DO NOTHING;

-- Then, ensure the user exists and has the admin role
DO $$
DECLARE
    v_admin_role_id uuid;
    v_user_id uuid;
BEGIN
    -- Get the admin role ID
    SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'admin';
    
    -- Get the user ID for the admin email
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@trollhairdontcare.com';

    -- If user exists, ensure they have the admin role
    IF v_user_id IS NOT NULL AND v_admin_role_id IS NOT NULL THEN
        -- Update user metadata to include admin role
        UPDATE auth.users
        SET raw_user_meta_data = jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{role}',
            '"admin"'
        )
        WHERE id = v_user_id;

        -- Ensure user has admin role in user_roles table
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (v_user_id, v_admin_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
END $$; 