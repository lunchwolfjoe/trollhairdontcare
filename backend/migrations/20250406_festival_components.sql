-- Create tables for additional festival components
BEGIN;

-- Create musical acts table
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

-- Create performance schedules table
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

-- Create crews table
CREATE TABLE public.crews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    crew_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create crew members table
CREATE TABLE public.crew_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_id UUID REFERENCES public.crews(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(crew_id, volunteer_id)
);

-- Create shifts table
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

-- Create shift assignments table
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

-- Create weather forecasts table
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

-- Enable Row Level Security
ALTER TABLE public.musical_acts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_forecasts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view musical acts"
    ON public.musical_acts FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage musical acts"
    ON public.musical_acts FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view performance schedules"
    ON public.performance_schedules FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage performance schedules"
    ON public.performance_schedules FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view crews"
    ON public.crews FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage crews"
    ON public.crews FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view crew members"
    ON public.crew_members FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage crew members"
    ON public.crew_members FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view shifts"
    ON public.shifts FOR SELECT
    USING (true);

CREATE POLICY "Admins and coordinators can manage shifts"
    ON public.shifts FOR ALL
    USING (is_admin(auth.uid()) OR is_coordinator(auth.uid()));

CREATE POLICY "Anyone can view shift assignments"
    ON public.shift_assignments FOR SELECT
    USING (true);

CREATE POLICY "Admins and coordinators can manage shift assignments"
    ON public.shift_assignments FOR ALL
    USING (is_admin(auth.uid()) OR is_coordinator(auth.uid()));

CREATE POLICY "Anyone can view weather forecasts"
    ON public.weather_forecasts FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage weather forecasts"
    ON public.weather_forecasts FOR ALL
    USING (is_admin(auth.uid()));

-- Seed data for the new tables
DO $$
DECLARE
    test_festival_id UUID;
    main_stage_id UUID;
    folk_tent_id UUID;
    test_admin_id UUID;
    test_coordinator_id UUID;
BEGIN
    -- Get existing IDs
    SELECT id INTO test_festival_id FROM public.festivals WHERE name = 'TrollHairDontCare Festival 2024';
    SELECT id INTO main_stage_id FROM public.locations WHERE name = 'Main Stage' AND festival_id = test_festival_id;
    SELECT id INTO folk_tent_id FROM public.locations WHERE name = 'Folk Tent' AND festival_id = test_festival_id;
    SELECT id INTO test_admin_id FROM public.volunteers WHERE notes = 'Experienced stage manager' AND festival_id = test_festival_id;
    SELECT id INTO test_coordinator_id FROM public.volunteers WHERE notes = 'Volunteer coordinator' AND festival_id = test_festival_id;

    -- Insert musical acts
    INSERT INTO public.musical_acts (festival_id, name, description, genre, performance_duration)
    VALUES 
        (test_festival_id, 'The Folk Brothers', 'Traditional folk music duo', 'Folk', '01:00:00'),
        (test_festival_id, 'Acoustic Dreams', 'Contemporary acoustic ensemble', 'Acoustic', '01:30:00'),
        (test_festival_id, 'Mountain Strings', 'Bluegrass quartet', 'Bluegrass', '01:00:00')
    RETURNING id INTO act1_id, act2_id, act3_id;

    -- Insert performance schedules
    INSERT INTO public.performance_schedules (festival_id, act_id, location_id, start_time, end_time)
    VALUES 
        (test_festival_id, act1_id, main_stage_id, '2024-07-15 14:00:00', '2024-07-15 15:00:00'),
        (test_festival_id, act2_id, folk_tent_id, '2024-07-15 15:30:00', '2024-07-15 17:00:00'),
        (test_festival_id, act3_id, main_stage_id, '2024-07-15 18:00:00', '2024-07-15 19:00:00');

    -- Insert crews
    INSERT INTO public.crews (festival_id, name, description, crew_type)
    VALUES 
        (test_festival_id, 'Stage Crew', 'Handles stage setup and teardown', 'technical'),
        (test_festival_id, 'Sound Crew', 'Manages sound equipment and mixing', 'technical'),
        (test_festival_id, 'Security Crew', 'Ensures festival safety', 'operations'),
        (test_festival_id, 'Medical Crew', 'Provides first aid and medical support', 'operations')
    RETURNING id INTO stage_crew_id, sound_crew_id, security_crew_id, medical_crew_id;

    -- Insert crew members
    INSERT INTO public.crew_members (crew_id, volunteer_id, role)
    VALUES 
        (stage_crew_id, test_admin_id, 'Crew Leader'),
        (sound_crew_id, test_coordinator_id, 'Sound Manager');

    -- Insert shifts
    INSERT INTO public.shifts (festival_id, crew_id, location_id, start_time, end_time, required_volunteers)
    VALUES 
        (test_festival_id, stage_crew_id, main_stage_id, '2024-07-15 08:00:00', '2024-07-15 16:00:00', 4),
        (test_festival_id, sound_crew_id, main_stage_id, '2024-07-15 12:00:00', '2024-07-15 20:00:00', 2),
        (test_festival_id, security_crew_id, main_stage_id, '2024-07-15 10:00:00', '2024-07-15 18:00:00', 3);

    -- Insert shift assignments
    INSERT INTO public.shift_assignments (shift_id, volunteer_id, status)
    SELECT s.id, v.id, 'scheduled'
    FROM public.shifts s
    CROSS JOIN public.volunteers v
    WHERE s.festival_id = test_festival_id
    AND v.application_status = 'approved'
    LIMIT 5;

    -- Insert weather forecasts
    INSERT INTO public.weather_forecasts (festival_id, forecast_time, temperature, conditions, precipitation_chance, wind_speed)
    VALUES 
        (test_festival_id, '2024-07-15 12:00:00', 75.0, 'Partly cloudy', 20, 8.5),
        (test_festival_id, '2024-07-15 18:00:00', 68.0, 'Clear', 10, 5.0),
        (test_festival_id, '2024-07-16 12:00:00', 72.0, 'Sunny', 0, 6.0);

END $$;

COMMIT; 