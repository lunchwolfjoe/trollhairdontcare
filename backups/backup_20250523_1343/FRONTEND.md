# TrollHairDontCare - Frontend Documentation

## Overview

This document outlines the requirements, architecture, and technical specifications for the **newly built** frontend application of the TrollHairDontCare Festival Management System. The frontend will provide the user interface for all festival management features, interacting exclusively with the Supabase backend for data and authentication.

## Core Requirements

The frontend must implement user interfaces for the following core functional requirements (derived from the original KFF app):

-   **Authentication**: Login, signup, password reset flows.
-   **Role-Based Views**: Display different UI elements and accessible features based on the logged-in user's role (Admin, Coordinator, Volunteer).
-   **Dashboard**: A central dashboard appropriate for the user's role (e.g., overview for Admin/Coordinator, assignments/schedule for Volunteer).
-   **Volunteer Management UI**: Forms for volunteer application/registration, tables/lists to view/filter volunteers (Admin/Coordinator view), interface for assigning roles/shifts.
-   **Mapping Interface**: An interactive map (using Leaflet) displaying festival layout, key locations, and potentially asset locations.
-   **Real-time Updates**: Reflect real-time changes pushed from Supabase (e.g., new messages, assignment updates) without requiring manual refreshes.
-   **Communication UI**: Interface for viewing announcements or messages.
-   **Profile Management**: Allow users to view/edit their profile information.
-   **Waiver Handling**: Display and allow digital signing of waivers.
-   **Responsive Design**: The application must be usable across different screen sizes (desktop, tablet, mobile).

## Proposed Tech Stack

-   **Framework**: React.js (v18+) with TypeScript
-   **UI Library**: Material UI (MUI) v5 (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`)
-   **State Management**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
-   **Routing**: React Router v6 (`react-router-dom`)
-   **Mapping**: Leaflet (`leaflet`, `react-leaflet`)
-   **API Client**: Supabase Client JS (`@supabase/supabase-js`)
-   **Build Tool**: Vite or Create React App (TBD)

## Proposed Project Structure (`frontend/src`)

```
src/
├── App.tsx             # Main application component (routing, layout)
├── main.tsx / index.tsx # Entry point (renders App, sets up Store)
├── assets/             # Static assets (images, etc.)
├── components/         # Shared, reusable UI components (atomic design principle)
│   └── common/         # General components (Button, Modal, Input)
│   └── layout/         # Layout components (Navbar, Sidebar, PageWrapper)
├── config/             # Configuration files
│   └── supabaseClient.ts # Initialize and export Supabase client
├── features/           # Modules for distinct application features
│   ├── auth/           # Authentication components, hooks, state
│   ├── volunteers/     # Volunteer management components, hooks, state
│   ├── map/            # Map components, hooks, state
│   └── ...             # Other feature modules
├── hooks/              # Global custom React hooks
├── lib/                # Core libraries, API interaction layer
│   └── supabase.ts     # Functions abstracting Supabase client calls
├── layouts/            # High-level page layout structures
├── pages/              # Page-level components (assembled from features/components)
├── store/              # Redux Toolkit store setup
│   ├── index.ts        # Root store configuration
│   ├── slices/         # Feature-based slices (managed within features/*)
│   └── hooks.ts        # Typed Redux hooks
├── styles/             # Global styles, theme
│   └── theme.ts        # MUI theme customization
├── types/              # Global TypeScript types
│   └── supabase.ts     # Auto-generated Supabase types
└── utils/              # Global utility functions
```
*Note: This structure promotes modularity using a feature-based approach.* 

## Key Implementation Details

-   **UI Components**: Build reusable components using MUI, adhering to the defined theme.
-   **State Management**: Utilize Redux Toolkit with a feature-slice structure. Each feature module in `src/features/` should contain its own slice definition.
-   **Routing**: Implement routing using React Router v6, defining page routes likely in `App.tsx`.
-   **API Interaction**: All Supabase interactions should be channeled through abstraction functions defined in `src/lib/supabase.ts`. These functions will use the Supabase JS client.
-   **Mapping**: Implement map features using `react-leaflet`, fetching necessary geo-data from Supabase.
-   **Styling**: Leverage MUI's styling solutions (`sx` prop, `styled`).
-   **Environment Variables**: Use `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` (or `VITE_` prefix if using Vite) stored in `.env.local` and Vercel.
-   **Type Safety**: Strictly use TypeScript. Generate Supabase types using the CLI and leverage them throughout the application.

## Build & Development

-   **Initialization**: Use `npx create-react-app frontend --template typescript` or `npm create vite@latest frontend -- --template react-ts`.
-   **Dependencies**: `npm install @mui/material @emotion/react @emotion/styled @mui/icons-material @reduxjs/toolkit react-redux react-router-dom leaflet react-leaflet @supabase/supabase-js`.
-   **Run Dev Server**: `npm run dev` (Vite) or `npm start` (CRA).
-   **Build**: `npm run build`.

---
*This documentation outlines the plan for building the new TrollHairDontCare frontend.* 