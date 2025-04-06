-- Get the admin role ID
DO $$
DECLARE
    v_admin_role_id uuid;
    v_user_id uuid;
BEGIN
    -- Get the admin role ID
    SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'admin';
    
    -- Get the user ID for the admin email
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@trollhairdontcare.com';

    -- Insert the user role if both IDs exist
    IF v_admin_role_id IS NOT NULL AND v_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (v_user_id, v_admin_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
END $$; 