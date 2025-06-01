-- Drop existing tables and policies to avoid errors
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Roles are viewable by all authenticated users" ON public.roles;
    DROP POLICY IF EXISTS "User roles are viewable by all authenticated users" ON public.user_roles;
    DROP POLICY IF EXISTS "Users can create their own profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles are viewable by all authenticated users" ON public.profiles;
    
    -- Drop trigger if exists
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Drop function if exists
    DROP FUNCTION IF EXISTS public.handle_new_user();
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping objects: %', SQLERRM;
END $$;

-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role_id)
);

-- Insert default roles if they don't exist
INSERT INTO public.roles (name, description)
VALUES 
    ('admin', 'Administrator with full access'),
    ('coordinator', 'Festival coordinator with management access'),
    ('volunteer', 'Festival volunteer')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Roles are viewable by all authenticated users"
    ON public.roles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "User roles are viewable by all authenticated users"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "User roles can be created by anyone"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can create profiles"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles are viewable by all authenticated users"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
BEGIN
    -- Create profile
    BEGIN
        INSERT INTO public.profiles (id, email)
        VALUES (
            new.id,
            new.email
        );
    EXCEPTION WHEN unique_violation THEN
        -- Profile already exists, ignore
        NULL;
    END;

    -- Get the volunteer role ID
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'volunteer';

    -- Assign volunteer role
    BEGIN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (new.id, default_role_id);
    EXCEPTION WHEN unique_violation THEN
        -- Role already assigned, ignore
        NULL;
    END;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user(); 