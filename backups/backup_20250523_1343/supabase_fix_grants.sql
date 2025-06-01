-- Fix Supabase permissions that Prisma might have overridden
-- First, grant schema usage
grant usage on schema public to postgres, anon, authenticated, service_role;

-- Grant permissions on tables, functions, and sequences
grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;

-- Set up default privileges for future objects
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;

-- Special auth-specific grants needed for authentication
grant select on auth.users to anon, authenticated;
grant select on auth.sessions to anon, authenticated; 