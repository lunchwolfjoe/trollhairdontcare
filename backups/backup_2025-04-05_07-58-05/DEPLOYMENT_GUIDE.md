# Deployment Guide: Fixing the RPC Function and Path Issues

This guide provides step-by-step instructions for fixing the errors in the crew management system.

## Issue Summary

1. **Import Path Errors**: Several components were importing the Supabase client from an incorrect path (`'../../lib/supabase'` instead of `'../../lib/supabaseClient'`).

2. **Missing RPC Function**: The application was trying to call a Supabase RPC function `get_table_definition` that doesn't exist, resulting in a 404 error.

3. **Port Conflicts**: There were issues with port 5173 already being in use when trying to start the development server.

4. **Duplicated Vite Config Settings**: The vite.config.ts file had duplicate settings that were causing warnings.

## Solution Steps

### 1. Fix Import Paths

We've already fixed the incorrect imports in:
- `src/components/DevHelpers/CheckTableSchema.tsx`
- `src/features/coordinator/CrewManagement.tsx` 
- `src/features/coordinator/AutoScheduler.tsx`

### 2. Deploy the RPC Functions to Supabase

To create the required RPC function in Supabase:

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select the project "ysljpqtpbpugekhrdocq"
3. Navigate to the SQL Editor
4. Create a new query
5. Copy and paste the contents of the `supabase/migrations/20250404_create_get_table_definition.sql` file
6. Click "Run" to execute the SQL

This will create three functions:
- `get_table_definition(table_name)`: Retrieves detailed column information
- `check_table_columns(table_name)`: Gets only column names
- `run_sql(sql)`: Executes arbitrary SQL (admin-only)

### 3. Run the Application with a Safe Start Script

We've created helper scripts to safely start the application:

**Using PowerShell:**
```
npm run dev:safe
```

**Using Batch File:**
```
npm run dev:bat
```

These scripts will automatically:
1. Kill existing Node processes that might be using port 5173
2. Find an available port
3. Start the application on that port

### 4. Fixed Vite Configuration

We updated the `vite.config.ts` file to:
1. Remove duplicate settings
2. Set `strictPort: false` to allow using alternative ports
3. Simplify the HMR configuration

## Verifying the Fix

After completing these steps:

1. Start the application with `npm run dev:safe`
2. Navigate to the Crew Management screen
3. Use the "Check Schema" button in the development helpers section
4. Verify that the table schema is correctly displayed
5. Create and edit crews to ensure everything works properly

If you encounter any issues with the crews table structure, use the "Rebuild Crews Table" button in the development helpers section.

## Updating the Database Schema

If the database schema doesn't match what the application expects, use the provided tool in the `CheckTableSchema` component to initialize or rebuild the table. 