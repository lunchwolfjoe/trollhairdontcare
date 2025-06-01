# Fixing Supabase JWT Token Refresh Issues

## Problem
You're experiencing JWT token expiration issues with Supabase authentication. The error message indicates:
`invalid JWT: unable to parse or verify signature, token has invalid claims: token is expired`

## Root Causes

1. **Token Expiration**: The JWT token has expired and is not being automatically refreshed
2. **Multiple Client Instances**: The warning about "Multiple GoTrueClient instances" suggests conflicting auth states
3. **Middleware Issues**: The middleware might not be properly configured to handle token refreshing

## Solution

### 1. Update the Middleware

The middleware needs to properly handle cookie setting and token refreshing:

```javascript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          // Set cookies for the current response
          request.cookies.set({
            name,
            value,
            ...options,
          })
          
          // Set cookies for the browser
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh the session if it exists
  await supabase.auth.getUser()
  
  return response
}
```

### 2. Ensure Singleton Client Pattern

Use a singleton pattern for your Supabase client to avoid multiple instances:

```javascript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Create a singleton browser client
let supabaseInstance = null;

export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;
  
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage
      }
    }
  );
  
  return supabaseInstance;
};
```

### 3. Add Manual Token Refresh Handling

Update your auth context to handle token refreshing:

```javascript
// Add this to your auth code where you handle sessions
try {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    // Try to refresh the session if we get an error
    const { error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error('Failed to refresh session:', refreshError);
      throw refreshError;
    }
    
    // Try getting the user again after refresh
    const { data: refreshedData, error: refreshedError } = await supabase.auth.getUser();
    // Continue with the refreshed session...
  }
} catch (err) {
  // Handle error
}
```

### 4. Listen for Token Refresh Events

Make sure your code properly handles the TOKEN_REFRESHED event:

```javascript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED' && session) {
    // Update your application state with the refreshed token
    console.log('Token refreshed successfully');
  }
});
```

## Verifying the Fix

1. After implementing these changes, check your browser's console for any token-related errors
2. Verify that users remain logged in after the initial token expiration (typically after 1 hour)
3. Check that the middleware is correctly setting cookies by examining the Network tab

## References

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [GitHub Discussion on Token Refresh](https://github.com/orgs/supabase/discussions/26718)
- [@supabase/ssr Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs) 