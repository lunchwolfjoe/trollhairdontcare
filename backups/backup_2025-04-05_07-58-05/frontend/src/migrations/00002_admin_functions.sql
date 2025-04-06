-- Function to make a user an admin
CREATE OR REPLACE FUNCTION make_user_admin(target_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    target_user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Get the user's ID
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found with email %', target_email;
    END IF;

    -- Get the admin role ID
    SELECT id INTO admin_role_id
    FROM public.roles
    WHERE name = 'admin';

    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Admin role not found';
    END IF;

    -- Remove any existing roles for the user
    DELETE FROM public.user_roles
    WHERE user_id = target_user_id;

    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role_id, created_at)
    VALUES (target_user_id, admin_role_id, NOW());

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 