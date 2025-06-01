# Supabase Authentication Fix Guide

This guide addresses the common authentication issues you're experiencing with Supabase, including:
- 401 Unauthorized errors when signing in
- Missing sub claim errors
- Realtime subscription permission issues

## Root Cause

There are two main issues:

1. **Authentication Token Misuse**: Your code is incorrectly using the Supabase anon key as a Bearer token for authentication requests, which causes the `401: invalid claim: missing sub` error. The anon key should only be used for initializing the Supabase client, not for authentication.

2. **Missing Database Permissions**: Your database tables likely don't have the required permissions for the anon and authenticated roles to access them for realtime subscriptions.

## Solution Steps

### 1. Fix Authentication Context

The `SimpleAuthContext.tsx` file has been updated to:
- Remove the anon key from authorization headers
- Only use proper session tokens for authentication
- Correctly handle token management

### 2. Set Up Database Permissions

Run the SQL commands in the `supabase_permissions_fix.sql` file in your Supabase SQL Editor:

```sql
-- Grant select permissions for tables you want to use with realtime
GRANT SELECT ON public.user_roles TO anon, authenticated;
GRANT SELECT ON public.roles TO anon, authenticated;
-- Add more GRANT statements for other tables you need to subscribe to
```

### 3. Configure Your Supabase Dashboard

1. **Set Up Site URLs**:
   - Go to Authentication → URL Configuration
   - Add all domains where your app will run (including localhost, vercel preview URLs, etc.)
   - Don't forget to include `https://` prefix for production URLs

2. **Enable Realtime for Your Tables**:
   - Go to Database → Replication
   - Add your tables to the `supabase_realtime` publication

### 4. Testing Authentication

1. Try logging in with valid credentials
2. Check the browser console for any token-related errors
3. If using realtime subscriptions, test by inserting data and verifying the subscription works

## Debugging Tips

If you still encounter issues:

1. **Check Browser Network Tab**: Look for the specific request that's failing and examine its headers and payload
2. **Verify Environment Variables**: Ensure your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
3. **Inspect Token Claims**: Use [jwt.io](https://jwt.io) to check if your tokens have the required claims
4. **Review RLS Policies**: Make sure your Row Level Security policies aren't blocking access

## Common Error Messages and Solutions

### "401: invalid claim: missing sub"
- This means you're using an API key instead of a session token for auth calls
- Solution: Use proper session tokens from Supabase auth, not the anon key

### "Error 401: Not Unauthorized" for Realtime Subscriptions
- This means your database permissions are not set up correctly
- Solution: Run the grant statements for tables you want to subscribe to

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Troubleshooting Auth Error 401](https://supabase.com/docs/guides/troubleshooting/auth-error-401-invalid-claim-missing-sub--AFwMR) 