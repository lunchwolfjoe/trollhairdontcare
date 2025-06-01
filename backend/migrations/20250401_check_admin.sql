-- Check if user exists
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'admin@trollhairdontcare.com';

-- Check if role exists
SELECT id, name 
FROM public.roles 
WHERE name = 'admin';

-- Check if user has admin role
SELECT ur.user_id, ur.role_id, r.name as role_name
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'admin@trollhairdontcare.com'; 