# Kerrville Folk Festival Volunteer Management System
# Vercel Deployment Guide

**Version 1.0**  
**Last Updated: April 6, 2025**

This guide provides a step-by-step process for deploying the Kerrville Folk Festival Volunteer Management System to Vercel.

## Prerequisites

Before starting the deployment process, ensure you have:

1. A [GitHub](https://github.com) account with the project repository
2. A [Vercel](https://vercel.com) account (you can sign up using your GitHub account)
3. A [Supabase](https://supabase.com) project set up with the required tables and policies
4. Access to the production build of the application

## Step 1: Preparing for Deployment

1. Ensure your project repository is up to date on GitHub:
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push
   ```

2. Make sure you have the production environment files ready:
   - `.env.production` should be in the `frontend-new` directory
   - `vercel.json` should be in the `frontend-new` directory

## Step 2: Setting Up Vercel

1. **Sign in to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign In" or "Sign Up" if you don't have an account
   - Choose to sign in with GitHub

2. **Import Repository**:
   - Once logged in, click "Add New..." > "Project"
   - Connect your GitHub account if not already connected
   - Select the repository containing the Kerrville Folk Festival project
   - Click "Import"

## Step 3: Configure Project Settings

1. **Set Project Name**:
   - Enter a project name or use the suggested one
   - This will determine the URL of your application (e.g., `kerrville-volunteer-system.vercel.app`)

2. **Configure Root Directory**:
   - Set "Root Directory" to `frontend-new`
   - This ensures Vercel only deploys the React application, not the entire monorepo

3. **Configure Build Settings**:
   - Framework Preset: Vite
   - Build Command: `npm run build:prod` (should be auto-detected from vercel.json)
   - Output Directory: `dist` (should be auto-detected from vercel.json)

4. **Set Environment Variables**:
   - Click "Environment Variables"
   - Add the following environment variables:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
     - `VITE_PUBLIC_URL`: The URL of your Vercel deployment (same as the project name with .vercel.app)
     - `VITE_ENV`: Set to `production`
     - `VITE_USE_MOCK_DATA`: Set to `true` (for initial deployment)

5. **Advanced Settings** (Optional):
   - Click "Show Advanced"
   - Configure custom domains if you have one
   - Set up build cache settings if needed

6. **Deploy**:
   - Click "Deploy"
   - Wait for the build process to complete (this may take a few minutes)

## Step 4: Verify Deployment

1. **Check Deployment Status**:
   - Monitor the build logs for any errors
   - Once complete, Vercel will show "Deployment Complete"

2. **Test the Application**:
   - Click "Visit" to open your deployed application
   - Test all major functionality:
     - User authentication (login/signup)
     - Dashboard loading
     - Volunteer management
     - Festival management
     - Communications
     - Task management

3. **Check Console for Errors**:
   - Open the browser dev tools (F12)
   - Check the console for any JavaScript errors
   - Test on multiple browsers (Chrome, Firefox, Edge)

## Step 5: Configure Custom Domain (Optional)

1. **Add Custom Domain**:
   - In your project on Vercel, go to "Settings" > "Domains"
   - Click "Add"
   - Enter your domain name

2. **Configure DNS**:
   - Follow Vercel's instructions to update your DNS settings
   - This typically involves adding CNAME or A records at your domain registrar

3. **Verify Domain**:
   - Wait for DNS propagation (can take up to 48 hours)
   - Vercel will automatically secure your domain with an SSL certificate

## Step 6: Ongoing Maintenance

1. **Automatic Deployments**:
   - Vercel is set up to automatically deploy when changes are pushed to the main branch
   - Vercel creates preview deployments for pull requests

2. **Environment Variables**:
   - Update environment variables as needed in the Vercel dashboard
   - Changes will require redeployment

3. **Monitoring**:
   - Check the "Analytics" tab in your Vercel project to monitor traffic and errors
   - Set up integration with external monitoring tools if needed

4. **Enable Real Data**:
   - Once testing is successful, change `VITE_USE_MOCK_DATA` to `false` to use real Supabase data

## Troubleshooting Common Issues

### Build Failures

1. **TypeScript Errors**:
   - The production build uses `build:prod` which skips type checking
   - If there are still build errors, check the build logs for details

2. **Missing Dependencies**:
   - Ensure all required packages are in `package.json`
   - Try adding missing dependencies and redeploying

### Runtime Errors

1. **Supabase Connection Issues**:
   - Verify Supabase URL and anon key in environment variables
   - Check Supabase RLS policies and ensure they allow proper access

2. **Authentication Problems**:
   - Ensure Supabase auth redirect URLs are set to include your Vercel domain
   - Check for CORS issues in the browser console

3. **Refresh Page 404 Errors**:
   - The `vercel.json` configuration should handle this with the wildcard route
   - If still occurring, check the route configuration

## Security Considerations

1. **Supabase Anon Key**:
   - The anon key is safe to expose in the client-side code
   - Ensure proper RLS policies are in place to protect data

2. **Environment Variables**:
   - Sensitive variables in Vercel are encrypted and secure
   - Never commit sensitive keys directly to the repository

3. **API Routes**:
   - Consider moving sensitive operations to server-side functions
   - Vercel Serverless Functions or Supabase Edge Functions can help

## Conclusion

Your Kerrville Folk Festival Volunteer Management System should now be successfully deployed to Vercel and accessible worldwide. The automatic deployment features of Vercel make it easy to maintain and update the application as needed.

For additional support, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/) 