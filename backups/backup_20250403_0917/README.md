# TrollHairDontCare - Festival Management System

## Project Overview

TrollHairDontCare is a comprehensive web application designed for managing volunteer folk festivals. It aims to streamline various aspects of festival organization, including volunteer coordination, communication, mapping, and public interaction. This project is built from scratch, using Supabase for the backend and React/TypeScript for the frontend.

## Getting Started

### Prerequisites

To set up and run this project, you will need:

- Node.js (v18+)
- npm (v8+)
- A Supabase account (free tier is sufficient for development)
- Web browser

### 1. Setting Up Supabase

1. Create a new Supabase project at https://app.supabase.com
2. Once your project is created, go to Project Settings > API to get your:
   - Project URL
   - anon/public API key

3. Set up the database schema:
   - Go to the SQL Editor in your Supabase project
   - Run the SQL script from `supabase/migrations/20250401_initial_schema.sql`
   - This will create all necessary tables, relationships, and RLS policies

4. Configure Authentication:
   - Go to Authentication > Settings
   - Configure Sign-in settings as needed (email confirmation, etc.)
   - Set up redirect URLs for your frontend application

### 2. Setting Up the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to the URL shown in the console (typically http://localhost:5173)

## Project Structure

- `/frontend`: React.js frontend application
  - See the [Frontend README](./frontend/README.md) for detailed structure
- `/supabase`: Supabase-related configuration and migrations
  - `/migrations`: SQL migration files for database setup
- `/*.md`: Project documentation

## Documentation

- [README.md](./README.md): Main project documentation (this file)
- [FRONTEND.md](./FRONTEND.md): Frontend documentation and technical specifications
- [BACKEND_SUPABASE.md](./BACKEND_SUPABASE.md): Supabase backend setup and requirements
- [DEPLOYMENT.md](./DEPLOYMENT.md): Instructions for deploying the application

## Development Workflow

1. Make changes to the frontend code in the `/frontend` directory
2. Test changes locally using `npm run dev`
3. For database schema changes, create new migration files in `/supabase/migrations`
4. Apply schema changes to your Supabase project using the SQL Editor
5. Build the frontend for production with `npm run build` in the frontend directory
6. Deploy according to the instructions in [DEPLOYMENT.md](./DEPLOYMENT.md)

## Next Steps

- Complete the implementation of all features described in FRONTEND.md
- Add comprehensive RLS policies for all tables
- Implement additional frontend pages for volunteer management, mapping, etc.
- Set up storage buckets in Supabase for file uploads
- Deploy the frontend to Vercel 