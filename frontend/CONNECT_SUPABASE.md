# Connecting to Your Existing Supabase Instance

This guide will help you connect the TrollHairDontCare frontend to your existing Supabase instance.

## Prerequisites

1. You have an existing Supabase project
2. You have access to the Supabase project settings
3. The frontend code has been set up as per the project instructions

## Step 1: Get Your Supabase Credentials

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your project
3. Go to Project Settings > API
4. You'll need:
   - **Project URL**: Find this in the "Project URL" field
   - **anon/public key**: Find this in the "Project API keys" section

## Step 2: Update Your Environment Variables

1. In the frontend directory, open the `.env.local` file (create it if it doesn't exist)
2. Add or update the following variables:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Replace `your_project_url` and `your_anon_key` with the values from Step 1
4. Save the file

## Step 3: Reset and Configure Your Supabase Database

1. Follow the instructions in `../SUPABASE_SETUP.md` to:
   - Reset your database schema
   - Apply the migration scripts
   - Configure authentication settings
   - Set up storage buckets

## Step 4: Test the Connection

1. Start the development server:
   ```
   npm run dev
   ```
2. Open the application in your browser (usually at http://localhost:5173)
3. You should see the Connection Tester component at the top of the page
4. If the connection is successful, you'll see a success message
5. If there's an issue, the component will display an error message to help diagnose the problem

## Common Issues

### CORS Errors

If you see CORS-related errors in the console, ensure you've set up the correct site URL in your Supabase project:

1. Go to Supabase dashboard > Authentication > Settings
2. In the "Site URL" field, enter your frontend URL (e.g., http://localhost:5173)
3. Add the same URL to the "Redirect URLs" list with a wildcard (e.g., http://localhost:5173/**)

### Authentication Issues

If the database connection works but authentication doesn't:

1. Ensure your Supabase project has "Email Auth" enabled
2. Consider disabling "Email Confirmation" during development
3. Check that the correct auth redirect URLs are configured

### Database Permission Issues

If you see permission errors when querying data:

1. Make sure you've applied the RLS (Row Level Security) policies from the migration scripts
2. Ensure you've created and assigned the proper user roles
3. Review the RLS policies for any tables you're trying to access

## Next Steps

Once the connection is working:

1. Create a user account through the signup form
2. Use the SQL query in the `../SUPABASE_SETUP.md` file to assign admin role to your user
3. Continue with the development of the festival management features 