# TrollHairDontCare - Backend (Supabase) Requirements & Setup

## Overview

This document specifies the requirements for configuring Supabase as the backend for the **newly built** TrollHairDontCare Festival Management System. Supabase will handle the database, authentication, real-time features, storage, and potential serverless functions.

## Core Supabase Service Requirements

-   **Database**: Define and implement a PostgreSQL schema within Supabase to store all application data.
-   **Authentication**: Configure Supabase Auth to manage user identities and roles securely.
-   **Row Level Security (RLS)**: Implement **strict** RLS policies on all relevant tables to enforce data access rules based on user roles and ownership.
-   **Real-time Subscriptions**: Enable and utilize for features requiring live data updates (e.g., chat, notifications).
-   **Storage**: Configure buckets and policies for managing necessary file uploads (e.g., waivers, profile images).
-   **Edge Functions**: Develop and deploy if specific backend logic is required that cannot be handled by database operations or RLS alone (e.g., complex integrations, email sending).

## Authentication Requirements (Supabase Auth)

-   **Provider**: Enable Email/Password authentication. Consider adding social providers later if needed.
-   **User Metadata**: Store user roles (e.g., 'admin', 'coordinator', 'volunteer') associated with their `auth.users` entry. This can be done via a dedicated `user_roles` table or using the `app_metadata` field.
-   **Security**: Enable email confirmation, configure secure password requirements, potentially enable MFA if required.
-   **Access Control**: All data access must be controlled via RLS policies linked to the authenticated user's ID (`auth.uid()`) and their role.

## Database Requirements (Supabase PostgreSQL)

-   **Schema Definition**: Design and create tables necessary to fulfill the core functional requirements. This includes, but is not limited to:
    -   `profiles`: Extends `auth.users` (public user data, linked 1:1 to `auth.users.id`).
    -   `roles`: Defines available roles (id, name).
    -   `user_roles`: Maps users to roles (user_id, role_id).
    -   `festivals`: Core festival information (id, name, start_date, end_date, ...).
    -   `volunteers`: Volunteer-specific information, potentially linking to profiles (profile_id, application_status, notes, ...).
    -   `assignments`: Linking volunteers to tasks/shifts/locations (id, volunteer_id, task_description, start_time, end_time, location_id, ...).
    -   `locations`: Geographic or logical locations within the festival (id, name, description, coordinates (geometry/GeoJSON), type).
    -   `assets`: Trackable assets (id, name, description, current_location_id, assigned_volunteer_id, ...).
    -   `waivers`: Waiver templates and signing status (id, template_content, version, volunteer_id, signed_at, ...).
    -   `messages` / `channels`: For communication features.
    *(Schema needs detailed design based on exact features)*.
-   **Relationships**: Define appropriate foreign key constraints between tables.
-   **Indexes**: Create indexes on frequently queried columns (e.g., foreign keys, columns used in RLS policies or `WHERE` clauses).
-   **Row Level Security (RLS)**: **MANDATORY**. Define policies for **ALL** tables containing sensitive or user-specific data. Policies must ensure users can only perform actions (SELECT, INSERT, UPDATE, DELETE) on data they are authorized for based on their `auth.uid()` and role.
    -   *Default Deny*: Tables should generally have RLS enabled with no default `USING` or `WITH CHECK` clauses, requiring explicit policies for access.
-   **Database Functions/Triggers**: Consider using Postgres functions or triggers within Supabase for tasks like automatically creating a user profile row when a new user signs up.

## Real-time Requirements

-   Identify features requiring real-time updates (e.g., notifications feed, live map updates, chat).
-   Enable Supabase Realtime on the necessary tables.
-   Ensure RLS policies correctly filter real-time messages.

## Storage Requirements

-   Define required storage buckets (e.g., `signed-waivers`, `profile-pictures`, `festival-maps`).
-   Implement strict access policies for each bucket (e.g., authenticated users can upload to `profile-pictures`, specific roles can upload to `festival-maps`, signed waivers might have restricted access).

## Serverless Function Requirements (Edge Functions)

-   Identify any backend logic unsuitable for direct database operations or RLS. Potential candidates:
    -   Sending transactional emails (e.g., welcome email, assignment notifications) via a third-party service (SendGrid, etc.).
    -   Complex data aggregation or processing triggered by events.
    -   Integration with external APIs.
-   If required, develop, test, and deploy these functions using the Supabase CLI.

## Development Workflow Integration

-   **Supabase CLI**: Use the CLI for managing the local development environment, database migrations, and type generation.
-   **Migrations**: Maintain database schema changes in version-controlled migration files (`supabase/migrations`).
-   **Type Generation**: Regularly generate TypeScript types from the database schema (`supabase gen types typescript --project-id <your-project-id> --schema public > frontend/src/types/supabase.ts`) and commit them.

---
*This documentation outlines the Supabase setup requirements for the new TrollHairDontCare project.* 