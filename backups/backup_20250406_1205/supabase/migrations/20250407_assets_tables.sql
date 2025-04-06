-- Create tables for assets tracking and maintenance
BEGIN;

-- Create asset categories table
CREATE TABLE public.asset_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create assets table
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

-- Create asset maintenance table
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

-- Create asset check-in/check-out log
CREATE TABLE public.asset_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'check_in' or 'check_out'
    action_time TIMESTAMPTZ DEFAULT now(),
    condition_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view asset categories"
    ON public.asset_categories FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage asset categories"
    ON public.asset_categories FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view assets"
    ON public.assets FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage assets"
    ON public.assets FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Coordinators can update assets"
    ON public.assets FOR UPDATE
    USING (is_coordinator(auth.uid()));

CREATE POLICY "Anyone can view asset maintenance records"
    ON public.asset_maintenance FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage asset maintenance"
    ON public.asset_maintenance FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Coordinators can add and update maintenance records"
    ON public.asset_maintenance FOR INSERT
    WITH CHECK (is_coordinator(auth.uid()));

CREATE POLICY "Coordinators can update maintenance records"
    ON public.asset_maintenance FOR UPDATE
    USING (is_coordinator(auth.uid()));

CREATE POLICY "Anyone can view asset logs"
    ON public.asset_logs FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage asset logs"
    ON public.asset_logs FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Volunteers can create asset logs"
    ON public.asset_logs FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT profile_id FROM public.volunteers 
        WHERE id = volunteer_id
    ));

-- Seed data for assets tables
DO $$
DECLARE
    test_festival_id UUID;
    main_stage_id UUID;
    volunteer_hq_id UUID;
    test_admin_id UUID;
    volunteer_id UUID;
BEGIN
    -- Get existing IDs
    SELECT id INTO test_festival_id FROM public.festivals WHERE name = 'TrollHairDontCare Festival 2024';
    SELECT id INTO main_stage_id FROM public.locations WHERE name = 'Main Stage' AND festival_id = test_festival_id;
    SELECT id INTO volunteer_hq_id FROM public.locations WHERE name = 'Volunteer HQ' AND festival_id = test_festival_id;
    SELECT profile_id INTO test_admin_id FROM public.volunteers WHERE notes = 'Experienced stage manager' AND festival_id = test_festival_id;
    
    -- Get a volunteer ID for assignments
    SELECT id INTO volunteer_id FROM public.volunteers WHERE application_status = 'approved' AND festival_id = test_festival_id LIMIT 1;

    -- Insert asset categories
    INSERT INTO public.asset_categories (name, description)
    VALUES 
        ('Sound Equipment', 'Audio equipment including microphones, speakers, amps, etc.'),
        ('Lighting', 'Stage lighting equipment'),
        ('Stage Equipment', 'Equipment used for stage setup'),
        ('Tools', 'Tools used for festival setup and maintenance'),
        ('Communication Devices', 'Radios and communication equipment'),
        ('Safety Equipment', 'First aid kits, fire extinguishers, etc.')
    RETURNING id INTO sound_category, lighting_category, stage_category, tools_category, comms_category, safety_category;

    -- Insert assets
    INSERT INTO public.assets (
        festival_id, 
        category_id, 
        name, 
        description, 
        serial_number, 
        acquisition_date, 
        value, 
        status, 
        current_location_id,
        assigned_volunteer_id
    )
    VALUES 
        (test_festival_id, sound_category, 'Main PA System', 'Complete PA system with speakers and mixer', 'PA20240001', '2024-01-15', 2500.00, 'in-use', main_stage_id, null),
        (test_festival_id, sound_category, 'Microphone Set', 'Set of 5 Shure SM58 microphones', 'MIC20240001', '2024-01-15', 500.00, 'in-use', main_stage_id, null),
        (test_festival_id, lighting_category, 'Stage Lights', 'LED stage lighting system', 'LGT20240001', '2024-01-20', 1200.00, 'in-use', main_stage_id, null),
        (test_festival_id, comms_category, 'Two-way Radio', 'Two-way radio for staff communication', 'RAD20240001', '2024-02-01', 85.00, 'assigned', null, volunteer_id),
        (test_festival_id, comms_category, 'Two-way Radio', 'Two-way radio for staff communication', 'RAD20240002', '2024-02-01', 85.00, 'assigned', null, volunteer_id),
        (test_festival_id, safety_category, 'First Aid Kit', 'Complete emergency first aid kit', 'FA20240001', '2024-02-10', 75.00, 'available', volunteer_hq_id, null)
    RETURNING id INTO pa_system_id, mic_set_id, stage_lights_id, radio_1_id, radio_2_id, first_aid_id;

    -- Insert maintenance records
    INSERT INTO public.asset_maintenance (
        asset_id,
        maintenance_type,
        description,
        performed_by,
        maintenance_date,
        next_maintenance_date
    )
    VALUES 
        (pa_system_id, 'inspection', 'Pre-festival sound system check', test_admin_id, '2024-07-10', '2024-07-15'),
        (stage_lights_id, 'repair', 'Replaced faulty cable', test_admin_id, '2024-07-08', null);

    -- Insert asset logs
    INSERT INTO public.asset_logs (
        asset_id,
        volunteer_id,
        location_id,
        action,
        action_time,
        condition_notes
    )
    VALUES 
        (radio_1_id, volunteer_id, null, 'check_out', '2024-07-14 09:00:00', 'Good condition, fully charged'),
        (radio_2_id, volunteer_id, null, 'check_out', '2024-07-14 09:00:00', 'Good condition, fully charged');

END $$;

-- Create asset inventory view for easy querying
CREATE OR REPLACE VIEW public.asset_inventory AS
SELECT 
    a.id,
    a.name,
    a.description,
    a.serial_number,
    ac.name as category,
    a.status,
    l.name as current_location,
    CASE 
        WHEN a.assigned_volunteer_id IS NOT NULL THEN
            (SELECT u.raw_user_meta_data->>'full_name' 
             FROM auth.users u 
             JOIN volunteers v ON u.id = v.profile_id 
             WHERE v.id = a.assigned_volunteer_id)
        ELSE NULL
    END as assigned_to,
    a.value,
    a.acquisition_date,
    a.festival_id,
    a.created_at,
    a.updated_at
FROM 
    public.assets a
LEFT JOIN 
    public.asset_categories ac ON a.category_id = ac.id
LEFT JOIN 
    public.locations l ON a.current_location_id = l.id;

COMMIT; 