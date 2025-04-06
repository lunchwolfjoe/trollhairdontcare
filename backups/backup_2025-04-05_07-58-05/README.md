# TrollHairDontCare - Festival Management System

## Project Overview

TrollHairDontCare is a comprehensive web application designed for managing volunteer folk festivals. It aims to streamline various aspects of festival organization, including volunteer coordination, communication, mapping, and public interaction. This project is built from scratch, using Supabase for the backend and React/TypeScript for the frontend.

## Getting Started

### Prerequisites

To set up and run this project, you will need:

- Node.js (v18+)
- npm (v8+)
- Web browser

### 1. Supabase Configuration

This project is connected to a specific Supabase instance. The connection details are:

- Project ID: `ysljpqtpbpugekhrdocq`
- Supabase URL: `https://ysljpqtpbpugekhrdocq.supabase.co`

**IMPORTANT: Do not change the Supabase connection details without team approval.** 

See [SUPABASE_CONFIG_RULES.md](./SUPABASE_CONFIG_RULES.md) for detailed guidelines on working with our Supabase instance.

For local development with your own Supabase instance:
1. Use the `dev-with-local-supabase.bat` script
2. Create a `.env.local.dev` file with your own credentials

### 2. Setting Up the Frontend

1. Navigate to the frontend-new directory:
   ```bash
   cd frontend-new
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure the `.env.local` file contains the correct Supabase credentials (provided in the repository)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to the URL shown in the console (typically http://localhost:5173)

### 3. Verifying Supabase Connection

To verify that the Supabase connection is working correctly:

1. Run the verification script:
   ```bash
   .\verify-supabase.bat
   ```

2. Or visit the connection test page in the application:
   - http://localhost:5173/test-connection

## Project Structure

- `/frontend-new`: React.js frontend application with Kerrville branding
- `/frontend`: Original React.js frontend application (legacy)
- `/supabase`: Supabase-related configuration and migrations
  - `/migrations`: SQL migration files for database setup
- `/*.md`: Project documentation

## Documentation

- [README.md](./README.md): Main project documentation (this file)
- [FRONTEND.md](./FRONTEND.md): Frontend documentation and technical specifications
- [BACKEND_SUPABASE.md](./BACKEND_SUPABASE.md): Supabase backend setup and requirements
- [DEPLOYMENT.md](./DEPLOYMENT.md): Instructions for deploying the application
- [SUPABASE_CONFIG_RULES.md](./SUPABASE_CONFIG_RULES.md): Rules for Supabase configuration
- [INTEGRATION_PLAN.md](./INTEGRATION_PLAN.md): Plan for integrating frontend with backend

## Development Workflow

1. Make changes to the frontend code in the `/frontend-new` directory
2. Test changes locally using `npm run dev`
3. For database schema changes, create new migration files in `/supabase/migrations`
4. Apply schema changes to our Supabase project using the SQL Editor
5. Build the frontend for production with `npm run build` in the frontend directory
6. Deploy according to the instructions in [DEPLOYMENT.md](./DEPLOYMENT.md)

## Testing the Integration

1. Use the Supabase connection test at `/test-connection` to verify connectivity
2. Test authentication flows with temporary emails
3. Verify database operations are working with RLS policies

## Backup and Recovery

1. Use the `create-backup.bat` script to create timestamped backups
2. If needed, restore from backups using `restore-backup.bat`
3. Database backups should be handled through Supabase's backup features

## Next Steps

- Complete the implementation of all features described in FRONTEND.md
- Add comprehensive RLS policies for all tables
- Implement additional frontend pages for volunteer management, mapping, etc.
- Set up storage buckets in Supabase for file uploads
- Deploy the frontend to Vercel 