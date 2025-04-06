# Environment Variable Fixes

## Problem

The application was using `process.env` references which are not directly available in Vite applications. This was causing errors like:

```
ReferenceError: process is not defined
```

## Solution

I've updated all environment variable references to use the Vite-compatible `import.meta.env` syntax:

### 1. Changed environment variable access:

| Before | After |
|--------|-------|
| `process.env.REACT_APP_SUPABASE_KEY` | `import.meta.env.VITE_SUPABASE_KEY` |
| `process.env.NODE_ENV === 'development'` | `import.meta.env.MODE === 'development'` |

### 2. Fixed files:

- `frontend-new/src/features/coordinator/AutoScheduler.tsx`
- `frontend-new/src/pages/Login.tsx`
- `frontend-new/src/contexts/AuthContext.tsx`
- `frontend-new/src/components/DevHelpers/CreateTestUser.tsx`
- `frontend-new/src/components/DevHelpers/RoleFixer.tsx`
- `frontend-new/src/App.tsx`

### 3. Environment Variables in Vite

Vite uses the following naming conventions for environment variables:

- All environment variables must be prefixed with `VITE_` to be accessible in the frontend code
- Access environment variables using `import.meta.env.VITE_*` instead of `process.env.*`
- Use `import.meta.env.MODE` instead of `process.env.NODE_ENV` to check the current mode

### 4. .env File Update

Make sure your `.env` file uses the correct prefix for Vite:

```
# Before (Create React App style)
REACT_APP_SUPABASE_URL=https://ysljpqtpbpugekhrdocq.supabase.co
REACT_APP_SUPABASE_KEY=your-key-here

# After (Vite style)
VITE_SUPABASE_URL=https://ysljpqtpbpugekhrdocq.supabase.co
VITE_SUPABASE_KEY=your-key-here
```

## Additional Fixes

We also fixed import paths for the Supabase client:

| Before | After |
|--------|-------|
| `import { supabase } from "../../lib/supabase"` | `import { supabase } from "../../lib/supabaseClient"` | 