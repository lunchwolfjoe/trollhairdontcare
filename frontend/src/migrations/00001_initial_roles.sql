-- Create roles if they don't exist
INSERT INTO public.roles (id, name, description, created_at)
VALUES 
  (gen_random_uuid(), 'admin', 'System administrator with full access', NOW()),
  (gen_random_uuid(), 'coordinator', 'Festival coordinator with management capabilities', NOW()),
  (gen_random_uuid(), 'volunteer', 'Regular volunteer user', NOW())
ON CONFLICT (name) DO NOTHING; 