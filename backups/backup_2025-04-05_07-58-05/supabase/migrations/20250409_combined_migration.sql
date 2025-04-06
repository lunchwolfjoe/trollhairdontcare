-- Combined Migration Script for TrollHairDontCare
-- This script combines all migrations in the correct order
-- Copy the entire contents of this file into Supabase SQL Editor

BEGIN;

-- First, drop existing tables if they exist (be careful with this in production!)
DO $$ 
BEGIN
    -- Drop existing tables in reverse order of dependencies
    DROP TABLE IF EXISTS public.asset_logs CASCADE;
    DROP TABLE IF EXISTS public.asset_maintenance CASCADE;
    DROP TABLE IF EXISTS public.assets CASCADE;
    DROP TABLE IF EXISTS public.asset_categories CASCADE;
    DROP TABLE IF EXISTS public.shift_assignments CASCADE;
    DROP TABLE IF EXISTS public.shifts CASCADE;
    DROP TABLE IF EXISTS public.crew_members CASCADE;
    DROP TABLE IF EXISTS public.crews CASCADE;
    DROP TABLE IF EXISTS public.performance_schedules CASCADE;
    DROP TABLE IF EXISTS public.musical_acts CASCADE;
    DROP TABLE IF EXISTS public.weather_forecasts CASCADE;
    DROP TABLE IF EXISTS public.channel_messages CASCADE;
    DROP TABLE IF EXISTS public.channels CASCADE;
    DROP TABLE IF EXISTS public.messages CASCADE;
    DROP TABLE IF EXISTS public.waivers CASCADE;
    DROP TABLE IF EXISTS public.assignments CASCADE;
    DROP TABLE IF EXISTS public.volunteers CASCADE;
    DROP TABLE IF EXISTS public.locations CASCADE;
    DROP TABLE IF EXISTS public.festivals CASCADE;
    DROP TABLE IF EXISTS public.user_roles CASCADE;
    DROP TABLE IF EXISTS public.roles CASCADE;
    DROP TABLE IF EXISTS public.profiles CASCADE;
END $$;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.is_coordinator(UUID);
DROP FUNCTION IF EXISTS public.is_volunteer(UUID);
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create base tables
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE public.festivals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'planning',
    map_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    location_type TEXT NOT NULL,
    coordinates JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    application_status TEXT DEFAULT 'pending',
    notes TEXT,
    availability_start DATE,
    availability_end DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(profile_id, festival_id)
);

CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    task_description TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.waivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
    template_content TEXT NOT NULL,
    version TEXT NOT NULL,
    signed_at TIMESTAMPTZ,
    signature TEXT,
    signed_document_path TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'announcement',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.channel_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create festival components tables
CREATE TABLE public.musical_acts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    genre TEXT,
    website_url TEXT,
    social_media JSONB,
    performance_duration INTERVAL,
    technical_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.performance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    act_id UUID REFERENCES public.musical_acts(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(act_id, start_time)
);

CREATE TABLE public.crews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    crew_type TEXT NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    shift_length_hours INTEGER NOT NULL,
    min_headcount INTEGER NOT NULL DEFAULT 1,
    max_headcount INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.crew_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_id UUID REFERENCES public.crews(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(crew_id, volunteer_id)
);

CREATE TABLE public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    crew_id UUID REFERENCES public.crews(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    required_volunteers INTEGER DEFAULT 1,
    status TEXT DEFAULT 'open',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.shift_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(shift_id, volunteer_id)
);

CREATE TABLE public.weather_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    forecast_time TIMESTAMPTZ NOT NULL,
    temperature DECIMAL,
    conditions TEXT,
    precipitation_chance INTEGER,
    wind_speed DECIMAL,
    wind_direction TEXT,
    uv_index INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create asset management tables
CREATE TABLE public.asset_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.asset_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    serial_number TEXT,
    acquisition_date DATE,
    value DECIMAL,
    status TEXT DEFAULT 'available',
    current_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    assigned_volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
    qr_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.asset_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    description TEXT,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    maintenance_date TIMESTAMPTZ DEFAULT now(),
    next_maintenance_date TIMESTAMPTZ,
    cost DECIMAL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.asset_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    action_time TIMESTAMPTZ DEFAULT now(),
    condition_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create helper functions
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_id AND r.name = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_coordinator(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_id AND r.name = 'coordinator'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_volunteer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_id AND r.name = 'volunteer'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musical_acts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Anyone can view roles"
    ON public.roles FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view user roles"
    ON public.user_roles FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage user roles"
    ON public.user_roles FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view festivals"
    ON public.festivals FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage festivals"
    ON public.festivals FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view locations"
    ON public.locations FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage locations"
    ON public.locations FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view volunteers"
    ON public.volunteers FOR SELECT
    USING (true);

CREATE POLICY "Users can view own volunteer record"
    ON public.volunteers FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Admins can manage volunteers"
    ON public.volunteers FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view assignments"
    ON public.assignments FOR SELECT
    USING (true);

CREATE POLICY "Users can view own assignments"
    ON public.assignments FOR SELECT
    USING (volunteer_id IN (
        SELECT id FROM public.volunteers WHERE profile_id = auth.uid()
    ));

CREATE POLICY "Admins can manage assignments"
    ON public.assignments FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view waivers"
    ON public.waivers FOR SELECT
    USING (true);

CREATE POLICY "Users can view own waivers"
    ON public.waivers FOR SELECT
    USING (volunteer_id IN (
        SELECT id FROM public.volunteers WHERE profile_id = auth.uid()
    ));

CREATE POLICY "Admins can manage waivers"
    ON public.waivers FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view messages"
    ON public.messages FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Anyone can view channels"
    ON public.channels FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view channel messages"
    ON public.channel_messages FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create channel messages"
    ON public.channel_messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Create storage buckets
-- Note: Bucket policies must be configured separately via the Supabase dashboard or management API.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('profile-avatars', 'Profile Avatars', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']),
    ('signed-waivers', 'Signed Waivers', false, 10485760, ARRAY['application/pdf']),
    ('festival-maps', 'Festival Maps', true, 20971520, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
    ('performance-media', 'Performance Media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg']);

-- Insert default roles
INSERT INTO public.roles (name, description)
VALUES 
    ('admin', 'Full system access'),
    ('coordinator', 'Festival coordination access'),
    ('volunteer', 'Volunteer access');

-- Insert test data
DO $$
DECLARE
    test_festival_id UUID;
    main_stage_id UUID;
    folk_tent_id UUID;
    food_court_id UUID;
    volunteer_hq_id UUID;
    first_aid_id UUID;
    test_admin_id UUID;
    test_coordinator_id UUID;
    test_admin_volunteer_id UUID;
    test_coord_volunteer_id UUID;
    volunteer_id UUID;
    act1_id UUID;
    act2_id UUID;
    act3_id UUID;
    stage_crew_id UUID;
    sound_crew_id UUID;
    security_crew_id UUID;
    medical_crew_id UUID;
    sound_category UUID;
    lighting_category UUID;
    stage_category UUID;
    tools_category UUID;
    comms_category UUID;
    safety_category UUID;
    pa_system_id UUID;
    mic_set_id UUID;
    stage_lights_id UUID;
    radio_1_id UUID;
    radio_2_id UUID;
    first_aid_kit_id UUID;
BEGIN
    -- Create test admin user
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
    VALUES (
        gen_random_uuid(),
        'admin@trollhairdontcare.com',
        crypt('admin123', gen_salt('bf')),
        now(),
        jsonb_build_object(
            'full_name', 'Admin User',
            'avatar_url', 'https://example.com/admin.jpg'
        )
    )
    RETURNING id INTO test_admin_id;

    -- Create test coordinator
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
    VALUES (
        gen_random_uuid(),
        'coordinator@trollhairdontcare.com',
        crypt('coord123', gen_salt('bf')),
        now(),
        jsonb_build_object(
            'full_name', 'Coordinator User',
            'avatar_url', 'https://example.com/coordinator.jpg'
        )
    )
    RETURNING id INTO test_coordinator_id;

    -- Assign roles
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT test_admin_id, id FROM public.roles WHERE name = 'admin';

    INSERT INTO public.user_roles (user_id, role_id)
    SELECT test_coordinator_id, id FROM public.roles WHERE name = 'coordinator';

    -- Create test festival
    INSERT INTO public.festivals (name, description, start_date, end_date, location, status)
    VALUES (
        'TrollHairDontCare Festival 2024',
        'The biggest folk music festival of the year! Join us for three days of amazing music, food, and fun.',
        '2024-07-15',
        '2024-07-17',
        'Central Park, New York',
        'planning'
    )
    RETURNING id INTO test_festival_id;

    -- Create locations (individual inserts)
    INSERT INTO public.locations (festival_id, name, description, location_type)
    VALUES (test_festival_id, 'Main Stage', 'The primary stage for headline acts', 'stage')
    RETURNING id INTO main_stage_id;
    
    INSERT INTO public.locations (festival_id, name, description, location_type)
    VALUES (test_festival_id, 'Folk Tent', 'Intimate performances in an acoustic setting', 'stage')
    RETURNING id INTO folk_tent_id;

    INSERT INTO public.locations (festival_id, name, description, location_type)
    VALUES (test_festival_id, 'Food Court', 'Various food vendors and seating area', 'amenity')
    RETURNING id INTO food_court_id;

    INSERT INTO public.locations (festival_id, name, description, location_type)
    VALUES (test_festival_id, 'Volunteer HQ', 'Central location for volunteer coordination', 'admin')
    RETURNING id INTO volunteer_hq_id;

    INSERT INTO public.locations (festival_id, name, description, location_type)
    VALUES (test_festival_id, 'First Aid Station', 'Medical assistance and emergency care', 'amenity')
    RETURNING id INTO first_aid_id;

    -- Create volunteers (admin and coordinator - individual inserts)
    INSERT INTO public.volunteers (profile_id, festival_id, application_status, notes, availability_start, availability_end)
    VALUES (test_admin_id, test_festival_id, 'approved', 'Experienced stage manager', '2024-07-14', '2024-07-18')
    RETURNING id INTO test_admin_volunteer_id;

    INSERT INTO public.volunteers (profile_id, festival_id, application_status, notes, availability_start, availability_end)
    VALUES (test_coordinator_id, test_festival_id, 'approved', 'Volunteer coordinator', '2024-07-14', '2024-07-18')
    RETURNING id INTO test_coord_volunteer_id;

    -- Create more test volunteers (loop is fine)
    FOR i IN 1..10 LOOP
        -- Create volunteer user
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (
            gen_random_uuid(),
            'volunteer' || i || '@example.com',
            crypt('volunteer123', gen_salt('bf')),
            now(),
            jsonb_build_object(
                'full_name', 'Volunteer ' || i,
                'avatar_url', 'https://example.com/volunteer' || i || '.jpg'
            )
        )
        RETURNING id INTO volunteer_id;

        -- Assign volunteer role
        INSERT INTO public.user_roles (user_id, role_id)
        SELECT volunteer_id, id FROM public.roles WHERE name = 'volunteer';

        -- Create volunteer record
        INSERT INTO public.volunteers (profile_id, festival_id, application_status, notes, availability_start, availability_end)
        VALUES (
            volunteer_id,
            test_festival_id,
            CASE 
                WHEN i <= 5 THEN 'approved'
                WHEN i <= 8 THEN 'pending'
                ELSE 'rejected'
            END,
            'Volunteer ' || i || ' notes',
            '2024-07-14',
            '2024-07-18'
        );
    END LOOP;

    -- Create musical acts (individual inserts)
    INSERT INTO public.musical_acts (festival_id, name, description, genre, performance_duration)
    VALUES (test_festival_id, 'The Folk Brothers', 'Traditional folk music duo', 'Folk', '01:00:00')
    RETURNING id INTO act1_id;
    
    INSERT INTO public.musical_acts (festival_id, name, description, genre, performance_duration)
    VALUES (test_festival_id, 'Acoustic Dreams', 'Contemporary acoustic ensemble', 'Acoustic', '01:30:00')
    RETURNING id INTO act2_id;
    
    INSERT INTO public.musical_acts (festival_id, name, description, genre, performance_duration)
    VALUES (test_festival_id, 'Mountain Strings', 'Bluegrass quartet', 'Bluegrass', '01:00:00')
    RETURNING id INTO act3_id;

    -- Create performance schedules
    INSERT INTO public.performance_schedules (festival_id, act_id, location_id, start_time, end_time)
    VALUES 
        (test_festival_id, act1_id, main_stage_id, '2024-07-15 14:00:00', '2024-07-15 15:00:00'),
        (test_festival_id, act2_id, folk_tent_id, '2024-07-15 15:30:00', '2024-07-15 17:00:00'),
        (test_festival_id, act3_id, main_stage_id, '2024-07-15 18:00:00', '2024-07-15 19:00:00');

    -- Create crews (individual inserts)
    INSERT INTO public.crews (festival_id, name, description, crew_type, shift_start_time, shift_end_time, shift_length_hours, min_headcount, max_headcount)
    VALUES (test_festival_id, 'Stage Crew', 'Handles stage setup and teardown', 'technical', '08:00:00', '16:00:00', 8, 4, 4)
    RETURNING id INTO stage_crew_id;
    
    INSERT INTO public.crews (festival_id, name, description, crew_type, shift_start_time, shift_end_time, shift_length_hours, min_headcount, max_headcount)
    VALUES (test_festival_id, 'Sound Crew', 'Manages sound equipment and mixing', 'technical', '12:00:00', '20:00:00', 8, 2, 2)
    RETURNING id INTO sound_crew_id;
    
    INSERT INTO public.crews (festival_id, name, description, crew_type, shift_start_time, shift_end_time, shift_length_hours, min_headcount, max_headcount)
    VALUES (test_festival_id, 'Security Crew', 'Ensures festival safety', 'operations', '10:00:00', '18:00:00', 8, 3, 3)
    RETURNING id INTO security_crew_id;
    
    INSERT INTO public.crews (festival_id, name, description, crew_type, shift_start_time, shift_end_time, shift_length_hours, min_headcount, max_headcount)
    VALUES (test_festival_id, 'Medical Crew', 'Provides first aid and medical support', 'operations', '08:00:00', '16:00:00', 8, 1, 1)
    RETURNING id INTO medical_crew_id;

    -- Create crew members (Using correct volunteer IDs)
    INSERT INTO public.crew_members (crew_id, volunteer_id, role)
    VALUES 
        (stage_crew_id, test_admin_volunteer_id, 'Crew Leader'),
        (sound_crew_id, test_coord_volunteer_id, 'Sound Manager');

    -- Create shifts
    INSERT INTO public.shifts (festival_id, crew_id, location_id, start_time, end_time, required_volunteers)
    VALUES 
        (test_festival_id, stage_crew_id, main_stage_id, '2024-07-15 08:00:00', '2024-07-15 16:00:00', 4),
        (test_festival_id, sound_crew_id, main_stage_id, '2024-07-15 12:00:00', '2024-07-15 20:00:00', 2),
        (test_festival_id, security_crew_id, main_stage_id, '2024-07-15 10:00:00', '2024-07-15 18:00:00', 3);

    -- Create shift assignments
    INSERT INTO public.shift_assignments (shift_id, volunteer_id, status)
    SELECT s.id, v.id, 'scheduled'
    FROM public.shifts s
    CROSS JOIN public.volunteers v
    WHERE s.festival_id = test_festival_id
    AND v.application_status = 'approved'
    LIMIT 5;

    -- Create asset categories (individual inserts)
    INSERT INTO public.asset_categories (name, description)
    VALUES ('Sound Equipment', 'Audio equipment including microphones, speakers, amps, etc.')
    RETURNING id INTO sound_category;

    INSERT INTO public.asset_categories (name, description)
    VALUES ('Lighting', 'Stage lighting equipment')
    RETURNING id INTO lighting_category;

    INSERT INTO public.asset_categories (name, description)
    VALUES ('Stage Equipment', 'Equipment used for stage setup')
    RETURNING id INTO stage_category;

    INSERT INTO public.asset_categories (name, description)
    VALUES ('Tools', 'Tools used for festival setup and maintenance')
    RETURNING id INTO tools_category;

    INSERT INTO public.asset_categories (name, description)
    VALUES ('Communication Devices', 'Radios and communication equipment')
    RETURNING id INTO comms_category;

    INSERT INTO public.asset_categories (name, description)
    VALUES ('Safety Equipment', 'First aid kits, fire extinguishers, etc.')
    RETURNING id INTO safety_category;

    -- Create assets (individual inserts to capture IDs)
    INSERT INTO public.assets (festival_id, category_id, name, description, serial_number, acquisition_date, value, status, current_location_id, assigned_volunteer_id)
    VALUES (test_festival_id, sound_category, 'Main PA System', 'Complete PA system with speakers and mixer', 'PA20240001', '2024-01-15', 2500.00, 'in-use', main_stage_id, null)
    RETURNING id INTO pa_system_id;

    INSERT INTO public.assets (festival_id, category_id, name, description, serial_number, acquisition_date, value, status, current_location_id, assigned_volunteer_id)
    VALUES (test_festival_id, sound_category, 'Microphone Set', 'Set of 5 Shure SM58 microphones', 'MIC20240001', '2024-01-15', 500.00, 'in-use', main_stage_id, null)
    RETURNING id INTO mic_set_id;
    
    INSERT INTO public.assets (festival_id, category_id, name, description, serial_number, acquisition_date, value, status, current_location_id, assigned_volunteer_id)
    VALUES (test_festival_id, lighting_category, 'Stage Lights', 'LED stage lighting system', 'LGT20240001', '2024-01-20', 1200.00, 'in-use', main_stage_id, null)
    RETURNING id INTO stage_lights_id;
    
    INSERT INTO public.assets (festival_id, category_id, name, description, serial_number, acquisition_date, value, status, current_location_id, assigned_volunteer_id)
    VALUES (test_festival_id, comms_category, 'Two-way Radio', 'Two-way radio for staff communication', 'RAD20240001', '2024-02-01', 85.00, 'assigned', null, test_coord_volunteer_id)
    RETURNING id INTO radio_1_id;
    
    INSERT INTO public.assets (festival_id, category_id, name, description, serial_number, acquisition_date, value, status, current_location_id, assigned_volunteer_id)
    VALUES (test_festival_id, comms_category, 'Two-way Radio', 'Two-way radio for staff communication', 'RAD20240002', '2024-02-01', 85.00, 'assigned', null, test_coord_volunteer_id)
    RETURNING id INTO radio_2_id;
    
    INSERT INTO public.assets (festival_id, category_id, name, description, serial_number, acquisition_date, value, status, current_location_id, assigned_volunteer_id)
    VALUES (test_festival_id, safety_category, 'First Aid Kit', 'Complete emergency first aid kit', 'FA20240001', '2024-02-10', 75.00, 'available', volunteer_hq_id, null)
    RETURNING id INTO first_aid_kit_id;

    -- Create maintenance records (Using captured asset IDs and correct user IDs)
    INSERT INTO public.asset_maintenance (asset_id, maintenance_type, description, performed_by, maintenance_date, next_maintenance_date)
    VALUES (pa_system_id, 'inspection', 'Pre-festival sound system check', test_admin_id, '2024-07-10', '2024-07-15');

    INSERT INTO public.asset_maintenance (asset_id, maintenance_type, description, performed_by, maintenance_date, next_maintenance_date)
    VALUES (stage_lights_id, 'repair', 'Replaced faulty cable', test_admin_id, '2024-07-08', null);

    -- Create asset logs (Using captured asset IDs and correct volunteer IDs)
    INSERT INTO public.asset_logs (asset_id, volunteer_id, location_id, action, action_time, condition_notes)
    VALUES (radio_1_id, test_coord_volunteer_id, null, 'check_out', '2024-07-14 09:00:00', 'Good condition, fully charged');

    INSERT INTO public.asset_logs (asset_id, volunteer_id, location_id, action, action_time, condition_notes)
    VALUES (radio_2_id, test_coord_volunteer_id, null, 'check_out', '2024-07-14 09:00:00', 'Good condition, fully charged');

    -- Create weather forecasts
    INSERT INTO public.weather_forecasts (festival_id, forecast_time, temperature, conditions, precipitation_chance, wind_speed)
    VALUES 
        (test_festival_id, '2024-07-15 12:00:00', 75.0, 'Partly cloudy', 20, 8.5),
        (test_festival_id, '2024-07-15 18:00:00', 68.0, 'Clear', 10, 5.0),
        (test_festival_id, '2024-07-16 12:00:00', 72.0, 'Sunny', 0, 6.0);

END $$;

COMMIT; 