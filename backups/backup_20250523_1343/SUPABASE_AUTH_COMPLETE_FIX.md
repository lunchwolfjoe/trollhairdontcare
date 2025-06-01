# Complete Supabase Authentication Fix

This document provides a comprehensive solution to fix Supabase authentication issues, especially the persistent 401 errors during login and realtime subscriptions.

## The Problem

We identified three core issues:

1. **Authentication Token Misuse**: The code was incorrectly using the Supabase anon key as a Bearer token in authentication requests
2. **Prisma Permission Issues**: Prisma migrations were wiping out database grants, causing 401 errors
3. **Client Implementation**: The Supabase client implementation needed modernization

## Step 1: Fix Database Permissions

Run the SQL commands in `fix_database_permissions.sql` in your Supabase SQL Editor:

```sql
-- Fix schema permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant privileges on all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant privileges on all existing functions
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant privileges on all existing sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant privileges on all future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Grant privileges on all future functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- Grant privileges on all future sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
```

## Step 2: Check Supabase Dashboard Configuration

1. **URL Configuration**:
   - Go to Authentication → URL Configuration
   - Add all domains where your app will run:
     - `https://kfffast.vercel.app`
     - `https://kfffast-*.vercel.app` (for preview deployments)
     - `http://localhost:5173` (for local development)

2. **Realtime Configuration**:
   - Go to Database → Replication
   - Add your tables to the `supabase_realtime` publication

## Step 3: Implement Modern Supabase Client

We've created a modern Supabase client in `lib/supabase.ts` that:
- Uses a singleton pattern for better performance
- Properly handles authentication tokens
- Never uses the anon key for authentication

## Step 4: Update Auth Context

We've completely rewritten the authentication context to:
- Properly handle session state
- Use the correct authorization flow
- Not misuse the anon key

## Step 5: Test Authentication

1. Run the SQL fix script
2. Deploy the updated code
3. Try logging in again

## Common Errors and Solutions

### "401: invalid claim: missing sub"

This error occurs when:
- Using an API key instead of a session token for authentication
- Fixed by our updated client implementation

### "401: Not Unauthorized" for Realtime Subscriptions

This error occurs when:
- Database permissions are not set up correctly
- Fixed by our SQL script

## Future Considerations

1. **Prisma Migrations**: Add a post-migration hook to run the permission grants after each migration
2. **Server-Side Authentication**: Consider implementing server-side authentication using Supabase's SSR package if you need more security
3. **Auth Middleware**: For enhanced security, consider adding middleware to verify authentication state

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Troubleshooting 401 Auth Errors](https://supabase.com/docs/guides/troubleshooting/auth-error-401-invalid-claim-missing-sub--AFwMR)
- [GitHub Discussion on Realtime 401 Errors](https://github.com/orgs/supabase/discussions/26932) 