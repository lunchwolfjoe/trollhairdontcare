-- Seed Data Script
-- This script will load realistic test data into the database

BEGIN;

-- Create a test admin user
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

-- Create a test coordinator
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

-- Assign roles to test users
INSERT INTO public.user_roles (user_id, role_id)
SELECT test_admin_id, id FROM public.roles WHERE name = 'admin';

INSERT INTO public.user_roles (user_id, role_id)
SELECT test_coordinator_id, id FROM public.roles WHERE name = 'coordinator';

-- Create a test festival
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

-- Create festival locations
INSERT INTO public.locations (festival_id, name, description, location_type)
VALUES 
    (test_festival_id, 'Main Stage', 'The primary stage for headline acts', 'stage'),
    (test_festival_id, 'Folk Tent', 'Intimate performances in an acoustic setting', 'stage'),
    (test_festival_id, 'Food Court', 'Various food vendors and seating area', 'amenity'),
    (test_festival_id, 'Volunteer HQ', 'Central location for volunteer coordination', 'admin'),
    (test_festival_id, 'First Aid Station', 'Medical assistance and emergency care', 'amenity')
RETURNING id INTO main_stage_id, folk_tent_id, food_court_id, volunteer_hq_id, first_aid_id;

-- Create test volunteers
INSERT INTO public.volunteers (profile_id, festival_id, application_status, notes, availability_start, availability_end)
VALUES 
    (test_admin_id, test_festival_id, 'approved', 'Experienced stage manager', '2024-07-14', '2024-07-18'),
    (test_coordinator_id, test_festival_id, 'approved', 'Volunteer coordinator', '2024-07-14', '2024-07-18');

-- Create more test volunteers
DO $$
DECLARE
    i INTEGER;
    volunteer_id UUID;
BEGIN
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
END $$;

-- Create volunteer assignments
INSERT INTO public.assignments (
    volunteer_id,
    location_id,
    task_description,
    start_time,
    end_time,
    status
)
SELECT 
    v.id,
    l.id,
    CASE 
        WHEN l.location_type = 'stage' THEN 'Stage Management'
        WHEN l.location_type = 'amenity' THEN 'Facility Support'
        ELSE 'Administrative Support'
    END,
    '2024-07-15 09:00:00',
    '2024-07-15 17:00:00',
    'scheduled'
FROM public.volunteers v
CROSS JOIN public.locations l
WHERE v.application_status = 'approved'
AND l.festival_id = test_festival_id
LIMIT 5;

-- Create a test waiver
INSERT INTO public.waivers (
    festival_id,
    template_content,
    version,
    volunteer_id,
    signed_at,
    signature
)
SELECT 
    test_festival_id,
    'I, the undersigned, agree to participate as a volunteer in the TrollHairDontCare Festival...',
    '1.0',
    v.id,
    CASE WHEN v.application_status = 'approved' THEN now() ELSE NULL END,
    CASE WHEN v.application_status = 'approved' THEN 'Digital Signature' ELSE NULL END
FROM public.volunteers v
WHERE v.festival_id = test_festival_id;

-- Create test messages
INSERT INTO public.messages (
    festival_id,
    sender_id,
    content,
    message_type
)
VALUES 
    (test_festival_id, test_admin_id, 'Welcome to TrollHairDontCare Festival 2024!', 'announcement'),
    (test_festival_id, test_coordinator_id, 'Volunteer orientation will be held on July 14th.', 'announcement');

-- Create test channels
INSERT INTO public.channels (
    festival_id,
    name,
    description
)
VALUES 
    (test_festival_id, 'General', 'General discussion for all volunteers'),
    (test_festival_id, 'Stage Crew', 'Discussion for stage management volunteers'),
    (test_festival_id, 'First Aid', 'Important updates for first aid volunteers');

-- Create test channel messages
INSERT INTO public.channel_messages (
    channel_id,
    sender_id,
    content
)
SELECT 
    c.id,
    test_coordinator_id,
    'Welcome to the ' || c.name || ' channel!'
FROM public.channels c
WHERE c.festival_id = test_festival_id;

COMMIT; 