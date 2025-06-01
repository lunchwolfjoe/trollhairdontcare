-- Check if user exists in auth.users
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'admin@trollhairdontcare.com';

-- If no user exists, we need to create one
INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
)
VALUES (
    'admin@trollhairdontcare.com',
    crypt('Admin123!', gen_salt('bf')),
    now(),
    '{"role": "admin"}'::jsonb
)
ON CONFLICT (email) DO UPDATE
SET 
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data; 