# Fixing the Crews Table Schema

There's a mismatch between the database schema and what the application code expects. The application is trying to use fields like `required_skills` (JSONB), and text-based time fields (`shift_start_time` and `shift_end_time`), but the database schema has different field types.

## Option 1: Apply the Migration Script

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your project (ysljpqtpbpugekhrdocq)
3. Navigate to the SQL Editor
4. Create a new query
5. Copy and paste the contents of the file: `supabase/migrations/20250404_update_crews_schema.sql`
6. Click "Run" to execute the SQL

This will:
- Back up your existing crew data
- Recreate the crews table with the correct schema
- Restore your data
- Set default values for any missing fields

## Option 2: Use the Rebuild Table Button

A simpler alternative is to use the "Rebuild Crews Table" button in the application:

1. Start the application using `npm run dev`
2. Navigate to the Crew Management screen
3. Scroll to the bottom where the development tools are shown
4. Click the "Rebuild Crews Table" button
5. Confirm the action

This will drop and recreate the crews table with the correct schema, but will delete any existing crew data.

## Schema Details

The correct schema for the crews table should be:

```sql
CREATE TABLE public.crews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  crew_type TEXT,
  required_skills JSONB DEFAULT '[]',
  min_headcount INTEGER DEFAULT 1,
  max_headcount INTEGER DEFAULT 1,
  shift_start_time TEXT DEFAULT '08:00',
  shift_end_time TEXT DEFAULT '16:00',
  shift_length_hours INTEGER DEFAULT 4,
  festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

The key changes are:
1. Adding the `required_skills` column (JSONB type)
2. Changing `shift_start_time` and `shift_end_time` from TIME type to TEXT
3. Setting appropriate default values for all fields 