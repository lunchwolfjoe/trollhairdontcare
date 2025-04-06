# Kerrville Folk Festival Volunteer Management System
# Deployment Guide

**Version 1.0**  
**Last Updated: April 6, 2025**

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Local Setup](#local-setup)
4. [Supabase Configuration](#supabase-configuration)
5. [Vercel Deployment](#vercel-deployment)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## Introduction

This guide provides step-by-step instructions for deploying the Kerrville Folk Festival Volunteer Management System to production using Vercel for hosting and Supabase as the backend. It covers the entire process from initial setup to post-deployment testing and maintenance.

---

## Prerequisites

Before beginning the deployment process, ensure you have access to the following:

1. **GitHub Account**: Access to the project repository
2. **Vercel Account**: For hosting the frontend application
3. **Supabase Account**: For the backend database and authentication
4. **Domain Name** (optional): A custom domain to use for your application
5. **Development Environment**: Node.js (v16+) and npm installed on your local machine
6. **Environment Variables**: Configuration values for both development and production

### Required Tools

- Git
- Node.js (v16 or higher)
- npm (v7 or higher)
- Supabase CLI (optional but recommended)

---

## Local Setup

Before deploying to production, make sure the application works correctly in your local environment.

### Clone the Repository

```bash
git clone https://github.com/your-organization/kerrville-volunteer-system.git
cd kerrville-volunteer-system
```

### Install Dependencies

```bash
# Install root dependencies
npm install

# Navigate to the frontend directory and install dependencies
cd frontend-new
npm install
```

### Configure Environment Variables

1. Create a `.env.local` file in the `frontend-new` directory
2. Add the following environment variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PUBLIC_URL=http://localhost:5173
```

### Run Locally

```bash
# Start the development server
npm run dev
```

Verify that the application runs correctly on your local machine before proceeding with deployment.

---

## Supabase Configuration

### Create a Supabase Project

1. Log in to your Supabase account: [https://app.supabase.io/](https://app.supabase.io/)
2. Click "New Project"
3. Enter project details:
   - Name: `kerrville-volunteer-system-prod` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Select the region closest to your users
4. Click "Create New Project"

### Database Setup

1. After project creation, navigate to the SQL Editor in Supabase
2. Run the database setup scripts in the following order:
   - `sql/minimal_db_setup.sql` - Creates basic tables and relationships
   - `sql/db_setup.sql` - Adds additional functionality
   - `sql/final_fix_corrected.sql` - Applies any patches or fixes

### Auth Configuration

1. In the Supabase dashboard, go to "Authentication" → "Settings"
2. Configure auth providers:
   - Email Auth: Enable/disable email confirmations based on your preference
   - External OAuth providers (optional): Configure Google, Facebook, etc.
3. Setup redirect URLs:
   - Add your local development URL: `http://localhost:5173`
   - Add your production URL: `https://your-production-domain.com`

### Row-Level Security (RLS) Policies

1. Go to "Table Editor" in the Supabase dashboard
2. For each table, ensure appropriate RLS policies are configured:
   - Click on a table
   - Go to "Policies" tab
   - Review and configure policies for each user role
   - Ensure volunteers can only access their own data
   - Ensure coordinators can only access their crew data

### Storage Configuration

1. Go to "Storage" in the Supabase dashboard
2. Create the following buckets:
   - `profile-images`: For user profile pictures
   - `festival-assets`: For festival-related files
   - `documents`: For general documents
3. Set appropriate RLS policies for each bucket

---

## Vercel Deployment

### Connect to Vercel

1. Sign in to [Vercel](https://vercel.com/)
2. Click "New Project"
3. Import from the GitHub repository
4. Select the repository containing your project

### Configure Project

1. Select the `frontend-new` directory as the root directory
2. Set the build command:
   ```
   npm run build
   ```
3. Set the output directory:
   ```
   dist
   ```

### Environment Variables

1. Add all required environment variables in Vercel:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_PUBLIC_URL`: Your production URL
   - Any other environment-specific variables

### Deploy

1. Click "Deploy"
2. Wait for the build process to complete
3. Vercel will provide a preview URL once deployment is finished

### Custom Domain (Optional)

1. In your Vercel project, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS settings with your domain provider
4. Wait for DNS propagation to complete

---

## Post-Deployment Configuration

### Verify Deployment

1. Visit your deployed site
2. Test login and registration functionality
3. Verify that database operations are working correctly
4. Test all major features of the application

### Create Admin User

1. Access the Supabase SQL Editor
2. Run the `create_admin_user.sql` script, modified with your desired admin credentials:
   ```sql
   -- Replace with your desired admin email and password
   SELECT create_admin_user('admin@kerrvillefestival.org', 'StrongPasswordHere');
   ```

### Set Up Analytics (Optional)

1. In Vercel, go to "Analytics"
2. Configure Web Analytics to track site performance
3. Set up additional analytics tools as needed (Google Analytics, etc.)

### Configure Automated Backups

1. In the Supabase dashboard, set up scheduled backups
2. Alternatively, use the Supabase CLI to create automated backup scripts

---

## Troubleshooting

### Common Deployment Issues

#### Build Failures

1. Check build logs in Vercel
2. Verify that all dependencies are correctly specified in package.json
3. Ensure environment variables are correctly set
4. Confirm that the build commands are correct

#### Authentication Issues

1. Verify Supabase URL and anon key in environment variables
2. Check redirect URLs in Supabase auth settings
3. Test authentication using Supabase dashboard

#### Database Connection Issues

1. Ensure Supabase project is active
2. Check database RLS policies
3. Verify that the database schema matches the expected structure

### Error Logs

1. Check Vercel deployment logs
2. Review Supabase logs in the dashboard
3. Enable client-side error tracking for detailed frontend errors

---

## Maintenance

### Regular Updates

1. Keep dependencies updated:
   ```bash
   npm outdated
   npm update
   ```

2. Apply security patches promptly

### Monitoring

1. Set up uptime monitoring with Vercel or third-party services
2. Monitor database usage and performance in Supabase
3. Set up alerts for critical errors

### Backup Strategy

1. Regular database backups via Supabase
2. Export critical data periodically
3. Document backup restoration procedures

### Scaling Considerations

1. Monitor Supabase usage limits
2. Consider upgrading plans as usage increases
3. Optimize database queries for performance

---

## Appendix

### Useful Commands

```bash
# Run local development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Helpful Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)

---

*End of Document* 