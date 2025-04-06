-- Check if the function exists
SELECT EXISTS (
    SELECT 1 
    FROM pg_proc 
    WHERE proname = 'make_user_admin'
) as function_exists;

-- Check if roles exist
SELECT name, id 
FROM public.roles 
WHERE name IN ('admin', 'coordinator', 'volunteer'); 