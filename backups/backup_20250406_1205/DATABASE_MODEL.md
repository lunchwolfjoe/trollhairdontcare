# TrollHairDontCare Database Model Documentation

## Database Schema Overview

### Core Tables

#### Users and Authentication
- `profiles` (extends `auth.users`)
  - Primary key: `id` (UUID, references auth.users)
  - Fields: full_name, display_name, email, phone, bio, avatar_url
  - Relationships: One-to-many with volunteers, user_roles

- `roles`
  - Primary key: `id` (UUID)
  - Fields: name, description
  - Default roles: admin, coordinator, volunteer

- `user_roles`
  - Composite key: (user_id, role_id)
  - Links profiles to roles
  - Enables role-based access control

#### Festival Management
- `festivals`
  - Primary key: `id` (UUID)
  - Fields: name, description, start_date, end_date, location, status, map_url
  - Central entity that most other tables reference

- `locations`
  - Primary key: `id` (UUID)
  - Foreign key: festival_id
  - Fields: name, description, location_type, coordinates (JSONB)
  - Used by: assignments, shifts, performance_schedules

#### Volunteer Management
- `volunteers`
  - Primary key: `id` (UUID)
  - Foreign keys: profile_id, festival_id
  - Fields: application_status, notes, availability_start/end
  - Unique constraint: (profile_id, festival_id)

- `assignments`
  - Primary key: `id` (UUID)
  - Foreign keys: volunteer_id, location_id
  - Fields: task_description, start_time, end_time, status, notes

### Performance Management

#### Musical Acts
- `musical_acts`
  - Primary key: `id` (UUID)
  - Foreign key: festival_id
  - Fields: name, description, genre, website_url, social_media, performance_duration

- `performance_schedules`
  - Primary key: `id` (UUID)
  - Foreign keys: festival_id, act_id, location_id
  - Fields: start_time, end_time, status, notes
  - Unique constraint: (act_id, start_time)

### Crew Management

#### Crews and Shifts
- `crews`
  - Primary key: `id` (UUID)
  - Foreign key: festival_id
  - Fields: name, description, crew_type

- `crew_members`
  - Primary key: `id` (UUID)
  - Foreign keys: crew_id, volunteer_id
  - Fields: role
  - Unique constraint: (crew_id, volunteer_id)

- `shifts`
  - Primary key: `id` (UUID)
  - Foreign keys: festival_id, crew_id, location_id
  - Fields: start_time, end_time, required_volunteers, status, notes

- `shift_assignments`
  - Primary key: `id` (UUID)
  - Foreign keys: shift_id, volunteer_id
  - Fields: status, notes
  - Unique constraint: (shift_id, volunteer_id)

### Asset Management

#### Assets and Categories
- `asset_categories`
  - Primary key: `id` (UUID)
  - Fields: name, description

- `assets`
  - Primary key: `id` (UUID)
  - Foreign keys: festival_id, category_id, current_location_id, assigned_volunteer_id
  - Fields: name, description, serial_number, acquisition_date, value, status, qr_code

- `asset_maintenance`
  - Primary key: `id` (UUID)
  - Foreign keys: asset_id, performed_by
  - Fields: maintenance_type, description, maintenance_date, next_maintenance_date, cost

- `asset_logs`
  - Primary key: `id` (UUID)
  - Foreign keys: asset_id, volunteer_id, location_id
  - Fields: action, action_time, condition_notes

### Communication

#### Messaging System
- `messages`
  - Primary key: `id` (UUID)
  - Foreign keys: festival_id, sender_id
  - Fields: content, message_type

- `channels`
  - Primary key: `id` (UUID)
  - Foreign key: festival_id
  - Fields: name, description

- `channel_messages`
  - Primary key: `id` (UUID)
  - Foreign keys: channel_id, sender_id
  - Fields: content

### Additional Features

#### Weather Tracking
- `weather_forecasts`
  - Primary key: `id` (UUID)
  - Foreign key: festival_id
  - Fields: forecast_time, temperature, conditions, precipitation_chance, wind_speed, wind_direction, uv_index

#### Document Management
- `waivers`
  - Primary key: `id` (UUID)
  - Foreign keys: festival_id, volunteer_id
  - Fields: template_content, version, signed_at, signature, signed_document_path

## Key Relationships

1. Festival-Centric Structure
   - Most tables reference `festivals` table
   - Enables multi-festival support
   - Facilitates festival-specific data isolation

2. Volunteer Management Flow
   - `profiles` → `volunteers` → `assignments`/`crew_members`
   - Tracks volunteer participation across festivals

3. Asset Tracking Chain
   - `asset_categories` → `assets` → `asset_maintenance`/`asset_logs`
   - Complete asset lifecycle management

4. Location-Based Operations
   - `locations` referenced by:
     - `assignments`
     - `performance_schedules`
     - `shifts`
     - `assets` (current_location)

5. Communication Structure
   - Direct messages: `messages` table
   - Channel-based: `channels` → `channel_messages`

## Row Level Security (RLS)

All tables have RLS enabled with policies based on:
- User authentication status
- User roles (admin, coordinator, volunteer)
- Resource ownership
- Festival association

## Helper Functions

1. Role Checking
   - `is_admin(user_id UUID)`
   - `is_coordinator(user_id UUID)`

2. Automatic Profile Creation
   - `handle_new_user()` trigger function
   - Creates profile on user signup

## Storage Buckets

1. Profile Avatars
   - Access: Authenticated users (own), Admins (all)

2. Signed Waivers
   - Access: Authenticated users (own), Admins (all)

3. Festival Maps
   - Access: Public (read), Admins (write)

4. Performance Media
   - Access: Public (read), Admins (write)

---

*This documentation provides a comprehensive overview of the TrollHairDontCare database schema, relationships, and access controls. For specific implementation details, refer to the migration files in the `supabase/migrations` directory.* 