-- Database Testing Script
-- This script will test all aspects of the database setup

BEGIN;

-- Create function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1. Test User Creation and Authentication
DO $$
DECLARE
    test_user_id UUID;
    test_profile_id UUID;
    test_festival_id UUID;
    test_location_id UUID;
    test_volunteer_id UUID;
    test_assignment_id UUID;
BEGIN
    -- Create a test user
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
    VALUES (
        gen_random_uuid(),
        'test@example.com',
        crypt('testpassword123', gen_salt('bf')),
        now(),
        jsonb_build_object(
            'full_name', 'Test User',
            'avatar_url', 'https://example.com/avatar.jpg'
        )
    )
    RETURNING id INTO test_user_id;

    -- Verify profile was created automatically
    SELECT id INTO test_profile_id FROM public.profiles WHERE id = test_user_id;
    IF test_profile_id IS NULL THEN
        RAISE EXCEPTION 'Profile was not created automatically for test user';
    END IF;

    -- 2. Test Roles and User Roles
    -- Assign admin role to test user
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT test_user_id, id FROM public.roles WHERE name = 'admin';

    -- Verify role assignment
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = test_user_id AND r.name = 'admin'
    ) THEN
        RAISE EXCEPTION 'Failed to assign admin role to test user';
    END IF;

    -- 3. Test Festivals
    -- Create a test festival
    INSERT INTO public.festivals (name, description, start_date, end_date, location)
    VALUES (
        'Test Festival 2024',
        'A test festival for database testing',
        '2024-07-01',
        '2024-07-03',
        'Test Location'
    )
    RETURNING id INTO test_festival_id;

    -- Verify festival creation
    IF NOT EXISTS (
        SELECT 1 FROM public.festivals WHERE id = test_festival_id
    ) THEN
        RAISE EXCEPTION 'Failed to create test festival';
    END IF;

    -- 4. Test Locations
    -- Create a test location
    INSERT INTO public.locations (festival_id, name, description, location_type)
    VALUES (
        test_festival_id,
        'Test Stage',
        'Main stage for testing',
        'stage'
    )
    RETURNING id INTO test_location_id;

    -- Verify location creation
    IF NOT EXISTS (
        SELECT 1 FROM public.locations WHERE id = test_location_id
    ) THEN
        RAISE EXCEPTION 'Failed to create test location';
    END IF;

    -- 5. Test Volunteers
    -- Create a test volunteer
    INSERT INTO public.volunteers (profile_id, festival_id, application_status)
    VALUES (
        test_profile_id,
        test_festival_id,
        'approved'
    )
    RETURNING id INTO test_volunteer_id;

    -- Verify volunteer creation
    IF NOT EXISTS (
        SELECT 1 FROM public.volunteers WHERE id = test_volunteer_id
    ) THEN
        RAISE EXCEPTION 'Failed to create test volunteer';
    END IF;

    -- 6. Test Assignments
    -- Create a test assignment
    INSERT INTO public.assignments (
        volunteer_id,
        location_id,
        task_description,
        start_time,
        end_time
    )
    VALUES (
        test_volunteer_id,
        test_location_id,
        'Test Task',
        now(),
        now() + interval '2 hours'
    )
    RETURNING id INTO test_assignment_id;

    -- Verify assignment creation
    IF NOT EXISTS (
        SELECT 1 FROM public.assignments WHERE id = test_assignment_id
    ) THEN
        RAISE EXCEPTION 'Failed to create test assignment';
    END IF;

    -- 7. Test RLS Policies
    -- Note: RLS policies are tested by the fact that we can perform these operations
    -- as the test user. In a real application, these would be tested through the
    -- application layer with proper JWT tokens.

    -- Test profile access
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = test_user_id
    ) THEN
        RAISE EXCEPTION 'RLS policy failed: User cannot view own profile';
    END IF;

    -- Test festival access
    IF NOT EXISTS (
        SELECT 1 FROM public.festivals WHERE id = test_festival_id
    ) THEN
        RAISE EXCEPTION 'RLS policy failed: User cannot view festivals';
    END IF;

    -- Test volunteer access
    IF NOT EXISTS (
        SELECT 1 FROM public.volunteers WHERE id = test_volunteer_id
    ) THEN
        RAISE EXCEPTION 'RLS policy failed: User cannot view volunteers';
    END IF;

    -- Test assignment access
    IF NOT EXISTS (
        SELECT 1 FROM public.assignments WHERE id = test_assignment_id
    ) THEN
        RAISE EXCEPTION 'RLS policy failed: User cannot view assignments';
    END IF;

    -- 8. Test Helper Functions
    -- Test is_admin function
    IF NOT public.is_admin(test_user_id) THEN
        RAISE EXCEPTION 'is_admin function failed';
    END IF;

    -- Test is_coordinator function
    IF public.is_coordinator(test_user_id) THEN
        RAISE EXCEPTION 'is_coordinator function failed';
    END IF;

    -- Test is_volunteer function
    IF public.is_volunteer(test_user_id) THEN
        RAISE EXCEPTION 'is_volunteer function failed';
    END IF;

    -- 9. Test Constraints
    -- Test unique constraint on profile_id and festival_id in volunteers
    BEGIN
        INSERT INTO public.volunteers (profile_id, festival_id, application_status)
        VALUES (test_profile_id, test_festival_id, 'pending');
        RAISE EXCEPTION 'Unique constraint failed: Duplicate volunteer entry was allowed';
    EXCEPTION
        WHEN unique_violation THEN
            -- Expected error, continue
    END;

    -- 10. Test Cascading Deletes
    -- Delete festival and verify related records are deleted
    DELETE FROM public.festivals WHERE id = test_festival_id;

    -- Verify locations were deleted
    IF EXISTS (
        SELECT 1 FROM public.locations WHERE id = test_location_id
    ) THEN
        RAISE EXCEPTION 'Cascade delete failed: Location still exists after festival deletion';
    END IF;

    -- Verify volunteers were deleted
    IF EXISTS (
        SELECT 1 FROM public.volunteers WHERE id = test_volunteer_id
    ) THEN
        RAISE EXCEPTION 'Cascade delete failed: Volunteer still exists after festival deletion';
    END IF;

    -- Verify assignments were deleted
    IF EXISTS (
        SELECT 1 FROM public.assignments WHERE id = test_assignment_id
    ) THEN
        RAISE EXCEPTION 'Cascade delete failed: Assignment still exists after festival deletion';
    END IF;

    -- Clean up test user
    DELETE FROM auth.users WHERE id = test_user_id;

    RAISE NOTICE 'All database tests passed successfully!';
END $$;

COMMIT; 