# Supabase Setup Instructions

This document provides step-by-step instructions for resetting and configuring your existing Supabase project for the TrollHairDontCare application.

## Obtaining Supabase Credentials

1. Log in to your Supabase account at https://app.supabase.com
2. Select your existing project
3. Go to Project Settings > API
4. Copy the following information:
   - **Project URL**: This will be used as your `VITE_SUPABASE_URL` value
   - **anon/public** key: This will be used as your `VITE_SUPABASE_ANON_KEY` value

## Setting Up the Database Schema

### Option 1: Using the Simplified Initialization Script (Recommended)

If you encountered errors with the original scripts, use this simplified approach:

1. In your Supabase dashboard, navigate to the SQL Editor
2. Open a new query
3. Copy the contents of `supabase/migrations/20250401_simple_init.sql`
4. Paste the SQL into the editor
5. Run the query

This script:
- Creates all necessary tables with proper relationships
- Adds default roles
- Creates a test festival record
- Sets up user profile creation trigger
- Adds helper functions for RLS
- Configures basic RLS policies

### Option 2: Complete Reset and Migration (Use with Caution)

If you want to completely reset your database (removing all existing data):

1. In your Supabase dashboard, navigate to the SQL Editor
2. Open a new query
3. Copy the contents of `supabase/migrations/20250401_reset_and_migrate.sql`
4. Paste the SQL into the editor
5. **IMPORTANT**: This script will delete all existing data. Make sure this is what you want.
6. Run the query

If you encounter errors with ALTER PUBLICATION statements, use Option 1 instead.

## Adding Additional Security Policies

After setting up the base schema:

1. Open a new query in the SQL Editor
2. Copy the contents of `supabase/migrations/20250402_additional_policies.sql`
3. Paste the SQL into the editor 
4. Run the query

This script adds comprehensive Row Level Security (RLS) policies to all tables, ensuring proper access control based on user roles.

## Configuring Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure the following settings:
   - Site URL: Use your frontend application URL (in development, this is typically http://localhost:5173)
   - Redirect URLs: Add the following:
     - http://localhost:5173/**
     - http://localhost:5173/login
     - http://localhost:5173/dashboard
3. Under Email Auth, ensure "Enable Email Signup" is checked
4. You may want to disable "Enable Email Confirmations" during development

## Updating Frontend Environment Variables

1. In the frontend directory, locate the `.env.local` file
2. Update it with your actual Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_actual_project_url
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key
   ```

## Creating an Admin User

After setting up the database and configuring authentication:

1. Start the frontend application: `cd frontend && npm run dev`
2. Navigate to the application in your browser (typically http://localhost:5173)
3. Register a new user through the signup form
4. Go back to your Supabase SQL Editor and run the following query, replacing `[USER_ID]` with the actual UUID of the user you just created:

```sql
-- Get the user ID (if you don't know it)
SELECT id FROM auth.users LIMIT 1;

-- Assign the admin role
INSERT INTO public.user_roles (user_id, role_id)
SELECT '[USER_ID]', id FROM public.roles WHERE name = 'admin';
```

You should now have an admin user that can access all features of the application.

## Storage Buckets Setup

Once your database is set up, you'll need to create storage buckets for file uploads:

1. In your Supabase dashboard, navigate to Storage
2. Create the following buckets:
   - `profile-avatars` - for user profile pictures
   - `signed-waivers` - for storing signed waiver documents
   - `festival-maps` - for festival map images or files

3. Set up appropriate bucket policies. For example, for the `profile-avatars` bucket:
   - Click on the bucket
   - Go to Policies
   - Add a new policy:
     - Policy name: "Authenticated users can upload their own avatars"
     - Allowed operations: select, insert
     - Using policy expression: `(auth.uid() = owner) OR is_admin(auth.uid())`

Repeat similar policies for the other buckets as needed.

## Troubleshooting Common Issues

### SQL Syntax Errors

If you encounter SQL syntax errors, particularly with commands like `ALTER PUBLICATION`:

1. Use the simplified initialization script (Option 1) instead
2. Run commands individually rather than as one large script
3. For specific syntax errors, check the Supabase/PostgreSQL version compatibility

### RLS Policy Errors

If you receive errors about policies already existing:

1. First drop the existing policies:
   ```sql
   DROP POLICY IF EXISTS "Policy Name" ON public.table_name;
   ```
2. Then create the new policy 