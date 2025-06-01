# Supabase Database Schema and Functions

This directory contains SQL migrations and functions for the Supabase database used by the application.

## How to Deploy SQL Functions

### Using the Supabase Dashboard

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your project
3. Navigate to the SQL Editor
4. Create a new query
5. Copy and paste the contents of the SQL file you want to run (e.g., `migrations/20250404_create_get_table_definition.sql`)
6. Click "Run" to execute the SQL

### Using the Supabase CLI

If you have the Supabase CLI installed:

```bash
# Make sure you're authenticated
supabase login

# Navigate to your project directory
cd your-project-directory

# Apply the migrations
supabase db push
```

## Available SQL Functions

### `get_table_definition(table_name text)`

Returns detailed information about columns in a table, including data types, nullable status, and default values.

Example usage in the application:
```typescript
const { data, error } = await supabase.rpc('get_table_definition', { table_name: 'crews' });
```

### `check_table_columns(table_name text)`

A safer version that only returns column names for a given table.

Example usage:
```typescript
const { data, error } = await supabase.rpc('check_table_columns', { table_name: 'crews' });
```

### `run_sql(sql text)`

Executes arbitrary SQL commands. Restricted to admin users only for security reasons.

Example usage:
```typescript
const { data, error } = await supabase.rpc('run_sql', { 
  sql: 'CREATE TABLE IF NOT EXISTS my_table (id uuid primary key)' 
});
```

## Crews Table Schema

The expected schema for the `crews` table is:

```sql
CREATE TABLE crews (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  crew_type text,
  required_skills jsonb default '[]',
  min_headcount integer default 1,
  max_headcount integer default 1,
  shift_start_time text default '08:00',
  shift_end_time text default '16:00',
  shift_length_hours integer default 4,
  festival_id uuid references festivals(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
``` 