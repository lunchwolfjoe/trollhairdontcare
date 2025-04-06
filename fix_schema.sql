-- Script to fix the data type mismatch between volunteers.id and assignments.volunteer_id

-- STEP 1: Fix the type mismatch issue

-- First, drop any existing foreign key constraint
ALTER TABLE public.assignments DROP CONSTRAINT IF EXISTS assignments_volunteer_id_fkey;

-- Modify the volunteers table id column to be UUID type
ALTER TABLE public.volunteers 
    ALTER COLUMN id DROP DEFAULT,  -- Remove the BIGSERIAL default
    ALTER COLUMN id TYPE UUID USING (uuid_generate_v4()),  -- Convert to UUID 
    ALTER COLUMN id SET DEFAULT uuid_generate_v4();  -- Set UUID default

-- Modify the assignments table volunteer_id column to match
ALTER TABLE public.assignments
    ALTER COLUMN volunteer_id TYPE UUID USING (volunteer_id::TEXT::UUID);

-- Recreate the foreign key constraint
ALTER TABLE public.assignments
    ADD CONSTRAINT assignments_volunteer_id_fkey
    FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id);

-- STEP 2: Make sure all tables have proper RLS policies

-- Disable RLS temporarily to allow for proper setup
ALTER TABLE public.volunteers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;

-- Create the volunteers schema if it doesn't exist
CREATE TABLE IF NOT EXISTS public.volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    application_status TEXT CHECK (application_status IN ('pending', 'approved', 'rejected', 'waitlist')),
    availability JSONB,
    skills TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(profile_id, festival_id)
);

-- Create the assignments schema if it doesn't exist
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    task_description TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN ('scheduled', 'completed', 'canceled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and create appropriate policies
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Volunteers policies
DROP POLICY IF EXISTS "Users can view volunteers" ON public.volunteers;
CREATE POLICY "Users can view volunteers" 
    ON public.volunteers FOR SELECT 
    TO authenticated 
    USING (true);

DROP POLICY IF EXISTS "Admins can manage volunteers" ON public.volunteers;
CREATE POLICY "Admins can manage volunteers" 
    ON public.volunteers FOR ALL 
    TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'coordinator')
    ));

-- Assignments policies
DROP POLICY IF EXISTS "Users can view assignments" ON public.assignments;
CREATE POLICY "Users can view assignments" 
    ON public.assignments FOR SELECT 
    TO authenticated 
    USING (true);

DROP POLICY IF EXISTS "Admins can manage assignments" ON public.assignments;
CREATE POLICY "Admins can manage assignments" 
    ON public.assignments FOR ALL 
    TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'coordinator')
    ));

-- Notify completion
DO $$
BEGIN
    RAISE NOTICE 'Schema update complete';
END $$; 