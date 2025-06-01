# TrollHairDontCare - Deployment Documentation

## Overview

This document provides instructions for deploying the **newly built** TrollHairDontCare frontend application to Vercel and configuring a custom domain managed via Namecheap.

## Prerequisites

-   A Supabase project created and configured according to `BACKEND_SUPABASE.md`.
-   A Vercel account ([https://vercel.com/](https://vercel.com/)).
-   A Namecheap account with a registered domain ([https://www.namecheap.com/](https://www.namecheap.com/)).
-   A Git repository (e.g., on GitHub) initialized for the `TrollHairDontCare` project, containing the `frontend` directory with the **new React application code**.
-   Supabase Project URL and Anon Key available.

## Deployment to Vercel

Vercel integrates with Git providers for streamlined deployment.

1.  **Push Code to Git Repository**: Ensure the latest code for the **new** frontend application in the `frontend` directory is committed and pushed to your Git repository.

2.  **Create New Vercel Project**:
    *   Log in to your Vercel dashboard.
    *   Click "Add New..." > "Project".
    *   Import the `TrollHairDontCare` Git repository.

3.  **Configure Project Settings**:
    *   **Framework Preset**: Vercel should automatically detect "Create React App" or "Vite". Verify this is correct.
    *   **Root Directory**: Set this to `frontend` since the application code resides in that subdirectory.
    *   **Build and Output Settings**: Vercel's defaults for CRA/Vite are usually sufficient.
        *   Build Command: `npm run build` (or `yarn build`).
        *   Output Directory: `build` (for CRA) or `dist` (for Vite).
        *   Install Command: `npm install` (or `yarn install`).

4.  **Configure Environment Variables**:
    *   In the Vercel project settings, go to "Environment Variables".
    *   Add the Supabase keys needed by the frontend:
        *   Name: `REACT_APP_SUPABASE_URL` (for CRA) or `VITE_SUPABASE_URL` (for Vite), Value: `YOUR_SUPABASE_PROJECT_URL`
        *   Name: `REACT_APP_SUPABASE_ANON_KEY` (for CRA) or `VITE_SUPABASE_ANON_KEY` (for Vite), Value: `YOUR_SUPABASE_ANON_KEY`
    *   *(Ensure the variable names match the prefix required by your build tool and how you access them in code, e.g., `process.env.REACT_APP_...` or `import.meta.env.VITE_...`)*.

5.  **Deploy**:
    *   Click "Deploy".
    *   Vercel will build and deploy the application from the `frontend` directory.
    *   Note the provided Vercel deployment URL (e.g., `trollhairdontcare-*.vercel.app`).

6.  **Verify Deployment**: Test the Vercel URL to ensure the newly built application works as expected.

## Connecting Custom Domain (Namecheap)

1.  **Add Domain to Vercel**:
    *   Go to Vercel Project Settings > Domains.
    *   Add your custom domain (e.g., `trollhairdontcare.com`).
    *   Follow Vercel's instructions for DNS configuration (it will provide the required A or CNAME records).

2.  **Configure DNS Records in Namecheap**:
    *   Log in to Namecheap > Domain List > Manage > Advanced DNS.
    *   Remove any conflicting default DNS records (`@`, `www`).
    *   Add the `A` or `CNAME` record provided by Vercel.
    *   Add any required `TXT` verification records if requested by Vercel.
    *   Save changes.

3.  **Wait for DNS Propagation**: Allow time for DNS changes to take effect (minutes to hours).

4.  **Verify Domain in Vercel**: Vercel will automatically detect the updated DNS records and validate the domain configuration.

## Redeployments

Pushing changes to the main branch of your Git repository will automatically trigger a new deployment on Vercel.

---
*This documentation outlines the deployment process for the newly built TrollHairDontCare frontend.* 