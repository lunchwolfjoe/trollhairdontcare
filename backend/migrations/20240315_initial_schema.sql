-- Enable necessary extensions
do $$ begin
  create extension if not exists "uuid-ossp";
  create extension if not exists "citext";
exception
  when others then null;
end $$;

-- Create custom types if they don't exist
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('admin', 'festival_manager', 'crew_leader', 'volunteer');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type task_priority as enum ('low', 'medium', 'high', 'urgent');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('pending', 'in_progress', 'completed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'asset_type') then
    create type asset_type as enum ('equipment', 'vehicle', 'supply', 'other');
  end if;
  if not exists (select 1 from pg_type where typname = 'asset_status') then
    create type asset_status as enum ('available', 'in_use', 'maintenance', 'retired');
  end if;
  if not exists (select 1 from pg_type where typname = 'message_priority') then
    create type message_priority as enum ('low', 'normal', 'high', 'urgent');
  end if;
  if not exists (select 1 from pg_type where typname = 'message_status') then
    create type message_status as enum ('unread', 'read', 'archived');
  end if;
end $$;

-- Create tables if they don't exist
do $$ begin
  if not exists (select 1 from pg_tables where tablename = 'profiles') then
    create table profiles (
      id uuid references auth.users on delete cascade primary key,
      email citext unique not null,
      full_name text not null,
      avatar_url text,
      phone text,
      created_at timestamptz default now() not null,
      updated_at timestamptz default now() not null
    );
  end if;

  if not exists (select 1 from pg_tables where tablename = 'roles') then
    create table roles (
      id uuid default uuid_generate_v4() primary key,
      name user_role not null unique,
      description text,
      created_at timestamptz default now() not null,
      updated_at timestamptz default now() not null
    );
  end if;

  if not exists (select 1 from pg_tables where tablename = 'user_roles') then
    create table user_roles (
      user_id uuid references profiles(id) on delete cascade,
      role_id uuid references roles(id) on delete cascade,
      created_at timestamptz default now() not null,
      primary key (user_id, role_id)
    );
  end if;

  if not exists (select 1 from pg_tables where tablename = 'festivals') then
    create table festivals (
      id uuid default uuid_generate_v4() primary key,
      name text not null,
      description text,
      start_date timestamptz not null,
      end_date timestamptz not null,
      location text not null,
      status text not null default 'draft',
      created_by uuid references profiles(id) on delete set null,
      created_at timestamptz default now() not null,
      updated_at timestamptz default now() not null
    );
  end if;

  if not exists (select 1 from pg_tables where tablename = 'locations') then
    create table locations (
      id uuid default uuid_generate_v4() primary key,
      festival_id uuid references festivals(id) on delete cascade not null,
      name text not null,
      description text,
      location_type text not null,
      coordinates point,
      created_at timestamptz default now() not null,
      updated_at timestamptz default now() not null
    );
  end if;

  if not exists (select 1 from pg_tables where tablename = 'crews') then
    create table crews (
      id uuid default uuid_generate_v4() primary key,
      festival_id uuid references festivals(id) on delete cascade not null,
      name text not null,
      description text,
      crew_type text not null,
      shift_start_time timestamptz not null,
      shift_end_time timestamptz not null,
      shift_length_hours integer not null,
      min_headcount integer not null,
      max_headcount integer not null,
      created_at timestamptz default now() not null,
      updated_at timestamptz default now() not null
    );
  end if;

  if not exists (select 1 from pg_tables where tablename = 'crew_members') then
    create table crew_members (
      id uuid default uuid_generate_v4() primary key,
      crew_id uuid references crews(id) on delete cascade not null,
      volunteer_id uuid references profiles(id) on delete cascade not null,
      role text not null,
      created_at timestamptz default now() not null,
      updated_at timestamptz default now() not null,
      unique(crew_id, volunteer_id)
    );
  end if;

  if not exists (select 1 from pg_tables where tablename = 'task_categories') then
    create table task_categories (
      id uuid default uuid_generate_v4() primary key,
      name text not null unique,
      description text,
      color text not null,
      created_at timestamptz default now() not null,
      updated_at timestamptz default now() not null
    );
  end if;

  if not exists (select 1 from pg_tables where tablename = 'tasks') then
    create table tasks (
      id uuid default uuid_generate_v4() primary key,
      title text not null,
      description text,
      category_id uuid references task_categories(id) on delete set null,
      location_id uuid references locations(id) on delete cascade not null,
      start_time timestamptz not null,
      end_time timestamptz not null,
      priority task_priority not null default 'medium',
      status task_status not null default 'pending',
      required_skills text[] default '{}',
      created_by uuid references profiles(id) on delete set null,
      created_at timestamptz default now() not null,
      updated_at timestamptz default now() not null
    );
  end if;

  if not exists (select 1 from pg_tables where tablename = 'task_assignments') then
    create table task_assignments (
      id uuid default uuid_generate_v4() primary key,
      task_id uuid references tasks(id) on delete cascade not null,
      volunteer_id uuid references profiles(id) on delete cascade not null,
      assigned_by uuid references profiles(id) on delete set null,
      status text not null default 'assigned',
      notes text,
      created_at timestamptz default now() not null,
      updated_at timestamptz default now() not null,
      unique(task_id, volunteer_id)
    );
  end if;

  if not exists (select 1 from pg_tables where tablename = 'assets') then
    create table assets (
      id uuid default uuid_generate_v4() primary key,
      name text not null,
      description text,
      asset_type asset_type not null,
      status asset_status not null default 'available',
      location_id uuid references locations(id) on delete cascade not null,
      current_holder_id uuid references profiles(id) on delete set null,
      purchase_date timestamptz,
      last_maintenance timestamptz,
      next_maintenance timestamptz,
      notes text,
      created_at timestamptz default now() not null,
      updated_at timestamptz default now() not null
    );
  end if;

  if not exists (select 1 from pg_tables where tablename = 'asset_assignments') then
    create table asset_assignments (
      id uuid default uuid_generate_v4() primary key,
      asset_id uuid references assets(id) on delete cascade not null,
      assigned_to uuid references profiles(id) on delete cascade not null,
      assigned_by uuid references profiles(id) on delete set null,
      start_time timestamptz not null,
      end_time timestamptz,
      status text not null default 'active',
      notes text,
      created_at timestamptz default now() not null,
      updated_at timestamptz default now() not null
    );
  end if;

  -- Drop and recreate messages table to ensure proper structure
  drop table if exists messages cascade;
  create table messages (
    id uuid default uuid_generate_v4() primary key,
    sender_id uuid references profiles(id) on delete cascade not null,
    recipient_id uuid references profiles(id) on delete cascade not null,
    subject text not null,
    content text not null,
    priority message_priority not null default 'normal',
    status message_status not null default 'unread',
    parent_message_id uuid references messages(id) on delete set null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
  );

  -- Create indexes for messages table
  create index if not exists idx_messages_sender on messages(sender_id);
  create index if not exists idx_messages_recipient on messages(recipient_id);
  create index if not exists idx_messages_parent on messages(parent_message_id);
end $$;

-- Commit the transaction to ensure tables are created
commit;

-- Create indexes if they don't exist and columns exist
do $$ begin
  -- Profiles indexes
  if exists (select 1 from pg_tables where tablename = 'profiles') and
     exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'email') and
     not exists (select 1 from pg_indexes where indexname = 'idx_profiles_email') then
    create index idx_profiles_email on profiles(email);
  end if;

  -- User roles indexes
  if exists (select 1 from pg_tables where tablename = 'user_roles') then
    if exists (select 1 from information_schema.columns where table_name = 'user_roles' and column_name = 'user_id') and
       not exists (select 1 from pg_indexes where indexname = 'idx_user_roles_user_id') then
      create index idx_user_roles_user_id on user_roles(user_id);
    end if;
    if exists (select 1 from information_schema.columns where table_name = 'user_roles' and column_name = 'role_id') and
       not exists (select 1 from pg_indexes where indexname = 'idx_user_roles_role_id') then
      create index idx_user_roles_role_id on user_roles(role_id);
    end if;
  end if;

  -- Festivals indexes
  if exists (select 1 from pg_tables where tablename = 'festivals') and
     exists (select 1 from information_schema.columns where table_name = 'festivals' and column_name = 'start_date') and
     exists (select 1 from information_schema.columns where table_name = 'festivals' and column_name = 'end_date') and
     not exists (select 1 from pg_indexes where indexname = 'idx_festivals_dates') then
    create index idx_festivals_dates on festivals(start_date, end_date);
  end if;

  -- Locations indexes
  if exists (select 1 from pg_tables where tablename = 'locations') and
     exists (select 1 from information_schema.columns where table_name = 'locations' and column_name = 'festival_id') and
     not exists (select 1 from pg_indexes where indexname = 'idx_locations_festival') then
    create index idx_locations_festival on locations(festival_id);
  end if;

  -- Crews indexes
  if exists (select 1 from pg_tables where tablename = 'crews') and
     exists (select 1 from information_schema.columns where table_name = 'crews' and column_name = 'festival_id') and
     not exists (select 1 from pg_indexes where indexname = 'idx_crews_festival') then
    create index idx_crews_festival on crews(festival_id);
  end if;

  -- Crew members indexes
  if exists (select 1 from pg_tables where tablename = 'crew_members') then
    if exists (select 1 from information_schema.columns where table_name = 'crew_members' and column_name = 'crew_id') and
       not exists (select 1 from pg_indexes where indexname = 'idx_crew_members_crew') then
      create index idx_crew_members_crew on crew_members(crew_id);
    end if;
    if exists (select 1 from information_schema.columns where table_name = 'crew_members' and column_name = 'volunteer_id') and
       not exists (select 1 from pg_indexes where indexname = 'idx_crew_members_volunteer') then
      create index idx_crew_members_volunteer on crew_members(volunteer_id);
    end if;
  end if;

  -- Tasks indexes
  if exists (select 1 from pg_tables where tablename = 'tasks') then
    if exists (select 1 from information_schema.columns where table_name = 'tasks' and column_name = 'location_id') and
       not exists (select 1 from pg_indexes where indexname = 'idx_tasks_location') then
      create index idx_tasks_location on tasks(location_id);
    end if;
    if exists (select 1 from information_schema.columns where table_name = 'tasks' and column_name = 'category_id') and
       not exists (select 1 from pg_indexes where indexname = 'idx_tasks_category') then
      create index idx_tasks_category on tasks(category_id);
    end if;
  end if;

  -- Task assignments indexes
  if exists (select 1 from pg_tables where tablename = 'task_assignments') then
    if exists (select 1 from information_schema.columns where table_name = 'task_assignments' and column_name = 'task_id') and
       not exists (select 1 from pg_indexes where indexname = 'idx_task_assignments_task') then
      create index idx_task_assignments_task on task_assignments(task_id);
    end if;
    if exists (select 1 from information_schema.columns where table_name = 'task_assignments' and column_name = 'volunteer_id') and
       not exists (select 1 from pg_indexes where indexname = 'idx_task_assignments_volunteer') then
      create index idx_task_assignments_volunteer on task_assignments(volunteer_id);
    end if;
  end if;

  -- Assets indexes
  if exists (select 1 from pg_tables where tablename = 'assets') then
    if exists (select 1 from information_schema.columns where table_name = 'assets' and column_name = 'location_id') and
       not exists (select 1 from pg_indexes where indexname = 'idx_assets_location') then
      create index idx_assets_location on assets(location_id);
    end if;
    if exists (select 1 from information_schema.columns where table_name = 'assets' and column_name = 'current_holder_id') and
       not exists (select 1 from pg_indexes where indexname = 'idx_assets_holder') then
      create index idx_assets_holder on assets(current_holder_id);
    end if;
  end if;

  -- Asset assignments indexes
  if exists (select 1 from pg_tables where tablename = 'asset_assignments') then
    if exists (select 1 from information_schema.columns where table_name = 'asset_assignments' and column_name = 'asset_id') and
       not exists (select 1 from pg_indexes where indexname = 'idx_asset_assignments_asset') then
      create index idx_asset_assignments_asset on asset_assignments(asset_id);
    end if;
    if exists (select 1 from information_schema.columns where table_name = 'asset_assignments' and column_name = 'assigned_to') and
       not exists (select 1 from pg_indexes where indexname = 'idx_asset_assignments_volunteer') then
      create index idx_asset_assignments_volunteer on asset_assignments(assigned_to);
    end if;
  end if;
end $$;

-- Commit the transaction to ensure indexes are created
commit;

-- Enable RLS on all tables
do $$ begin
  alter table if exists profiles enable row level security;
  alter table if exists roles enable row level security;
  alter table if exists user_roles enable row level security;
  alter table if exists festivals enable row level security;
  alter table if exists locations enable row level security;
  alter table if exists crews enable row level security;
  alter table if exists crew_members enable row level security;
  alter table if exists task_categories enable row level security;
  alter table if exists tasks enable row level security;
  alter table if exists task_assignments enable row level security;
  alter table if exists assets enable row level security;
  alter table if exists asset_assignments enable row level security;
  alter table if exists messages enable row level security;
end $$;

-- Commit the transaction to ensure RLS is enabled
commit;

-- Insert default roles if they don't exist
do $$ begin
  if not exists (select 1 from roles where name = 'admin') then
    insert into roles (name, description) values
      ('admin', 'System administrator with full access'),
      ('festival_manager', 'Can manage festivals, locations, and crews'),
      ('crew_leader', 'Can manage crew members and tasks'),
      ('volunteer', 'Can view and update assigned tasks and assets');
  end if;
end $$;

-- Commit the transaction to ensure roles are created
commit;

-- Create or replace the user creation function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );

  -- Assign volunteer role by default
  insert into public.user_roles (user_id, role_id)
  select new.id, id from public.roles where name = 'volunteer';

  return new;
end;
$$ language plpgsql security definer;

-- Drop and recreate the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Commit the transaction to ensure trigger is created
commit;

-- Drop existing policies if they exist
do $$ begin
  -- Drop all policies in reverse order of dependencies
  drop policy if exists "Users can update their own messages" on messages;
  drop policy if exists "Users can create messages" on messages;
  drop policy if exists "Users can view their own messages" on messages;
  drop policy if exists "Only crew leaders and above can create asset assignments" on asset_assignments;
  drop policy if exists "Volunteers can update their own asset assignments" on asset_assignments;
  drop policy if exists "Asset assignments are viewable by everyone" on asset_assignments;
  drop policy if exists "Only crew leaders and above can modify assets" on assets;
  drop policy if exists "Assets are viewable by everyone" on assets;
  drop policy if exists "Only crew leaders and above can create task assignments" on task_assignments;
  drop policy if exists "Volunteers can update their own task assignments" on task_assignments;
  drop policy if exists "Task assignments are viewable by everyone" on task_assignments;
  drop policy if exists "Only crew leaders and above can modify tasks" on tasks;
  drop policy if exists "Tasks are viewable by everyone" on tasks;
  drop policy if exists "Only festival managers and admins can modify task categories" on task_categories;
  drop policy if exists "Task categories are viewable by everyone" on task_categories;
  drop policy if exists "Only crew leaders and above can modify crew members" on crew_members;
  drop policy if exists "Crew members are viewable by everyone" on crew_members;
  drop policy if exists "Only crew leaders and above can modify crews" on crews;
  drop policy if exists "Crews are viewable by everyone" on crews;
  drop policy if exists "Only festival managers and admins can modify locations" on locations;
  drop policy if exists "Locations are viewable by everyone" on locations;
  drop policy if exists "Only festival managers and admins can modify festivals" on festivals;
  drop policy if exists "Festivals are viewable by everyone" on festivals;
  drop policy if exists "Only admins can modify user roles" on user_roles;
  drop policy if exists "User roles are viewable by everyone" on user_roles;
  drop policy if exists "Only admins can modify roles" on roles;
  drop policy if exists "Roles are viewable by everyone" on roles;
  drop policy if exists "Users can update own profile" on profiles;
  drop policy if exists "Public profiles are viewable by everyone" on profiles;
end $$;

-- Commit the transaction to ensure policies are dropped
commit;

-- Create policies for each table in order of dependencies
-- Profiles policies
do $$ begin
  create policy "Public profiles are viewable by everyone"
    on profiles for select
    using (true);

  create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id);
end $$;
commit;

-- Roles policies
do $$ begin
  create policy "Roles are viewable by everyone"
    on roles for select
    using (true);

  create policy "Only admins can modify roles"
    on roles for all
    using (
      exists (
        select 1 from user_roles ur
        join roles r on r.id = ur.role_id
        where ur.user_id = auth.uid()
        and r.name = 'admin'
      )
    );
end $$;
commit;

-- User roles policies
do $$ begin
  create policy "User roles are viewable by everyone"
    on user_roles for select
    using (true);

  create policy "Only admins can modify user roles"
    on user_roles for all
    using (
      exists (
        select 1 from user_roles ur
        join roles r on r.id = ur.role_id
        where ur.user_id = auth.uid()
        and r.name = 'admin'
      )
    );
end $$;
commit;

-- Festivals policies
do $$ begin
  create policy "Festivals are viewable by everyone"
    on festivals for select
    using (true);

  create policy "Only festival managers and admins can modify festivals"
    on festivals for all
    using (
      exists (
        select 1 from user_roles ur
        join roles r on r.id = ur.role_id
        where ur.user_id = auth.uid()
        and r.name in ('admin', 'festival_manager')
      )
    );
end $$;
commit;

-- Locations policies
do $$ begin
  create policy "Locations are viewable by everyone"
    on locations for select
    using (true);

  create policy "Only festival managers and admins can modify locations"
    on locations for all
    using (
      exists (
        select 1 from user_roles ur
        join roles r on r.id = ur.role_id
        where ur.user_id = auth.uid()
        and r.name in ('admin', 'festival_manager')
      )
    );
end $$;
commit;

-- Crews policies
do $$ begin
  create policy "Crews are viewable by everyone"
    on crews for select
    using (true);

  create policy "Only crew leaders and above can modify crews"
    on crews for all
    using (
      exists (
        select 1 from user_roles ur
        join roles r on r.id = ur.role_id
        where ur.user_id = auth.uid()
        and r.name in ('admin', 'festival_manager', 'crew_leader')
      )
    );
end $$;
commit;

-- Crew members policies
do $$ begin
  create policy "Crew members are viewable by everyone"
    on crew_members for select
    using (true);

  create policy "Only crew leaders and above can modify crew members"
    on crew_members for all
    using (
      exists (
        select 1 from user_roles ur
        join roles r on r.id = ur.role_id
        where ur.user_id = auth.uid()
        and r.name in ('admin', 'festival_manager', 'crew_leader')
      )
    );
end $$;
commit;

-- Task categories policies
do $$ begin
  create policy "Task categories are viewable by everyone"
    on task_categories for select
    using (true);

  create policy "Only festival managers and admins can modify task categories"
    on task_categories for all
    using (
      exists (
        select 1 from user_roles ur
        join roles r on r.id = ur.role_id
        where ur.user_id = auth.uid()
        and r.name in ('admin', 'festival_manager')
      )
    );
end $$;
commit;

-- Tasks policies
do $$ begin
  create policy "Tasks are viewable by everyone"
    on tasks for select
    using (true);

  create policy "Only crew leaders and above can modify tasks"
    on tasks for all
    using (
      exists (
        select 1 from user_roles ur
        join roles r on r.id = ur.role_id
        where ur.user_id = auth.uid()
        and r.name in ('admin', 'festival_manager', 'crew_leader')
      )
    );
end $$;
commit;

-- Task assignments policies
do $$ begin
  create policy "Task assignments are viewable by everyone"
    on task_assignments for select
    using (true);

  create policy "Volunteers can update their own task assignments"
    on task_assignments for update
    using (volunteer_id = auth.uid());

  create policy "Only crew leaders and above can create task assignments"
    on task_assignments for insert
    with check (
      exists (
        select 1 from user_roles ur
        join roles r on r.id = ur.role_id
        where ur.user_id = auth.uid()
        and r.name in ('admin', 'festival_manager', 'crew_leader')
      )
    );
end $$;
commit;

-- Assets policies
do $$ begin
  create policy "Assets are viewable by everyone"
    on assets for select
    using (true);

  create policy "Only crew leaders and above can modify assets"
    on assets for all
    using (
      exists (
        select 1 from user_roles ur
        join roles r on r.id = ur.role_id
        where ur.user_id = auth.uid()
        and r.name in ('admin', 'festival_manager', 'crew_leader')
      )
    );
end $$;
commit;

-- Asset assignments policies
do $$ begin
  create policy "Asset assignments are viewable by everyone"
    on asset_assignments for select
    using (true);

  create policy "Volunteers can update their own asset assignments"
    on asset_assignments for update
    using (assigned_to = auth.uid());

  create policy "Only crew leaders and above can create asset assignments"
    on asset_assignments for insert
    with check (
      exists (
        select 1 from user_roles ur
        join roles r on r.id = ur.role_id
        where ur.user_id = auth.uid()
        and r.name in ('admin', 'festival_manager', 'crew_leader')
      )
    );
end $$;
commit;

-- Messages policies
do $$ 
declare
  messages_table_exists boolean;
  recipient_id_exists boolean;
begin
  -- Check if messages table exists
  select exists (
    select 1 
    from information_schema.tables 
    where table_schema = 'public' 
    and table_name = 'messages'
  ) into messages_table_exists;

  -- Check if recipient_id column exists
  select exists (
    select 1 
    from information_schema.columns 
    where table_schema = 'public'
    and table_name = 'messages' 
    and column_name = 'recipient_id'
  ) into recipient_id_exists;

  -- Only create policies if both table and column exist
  if messages_table_exists and recipient_id_exists then
    -- Drop existing policies first
    drop policy if exists "Users can view their own messages" on messages;
    drop policy if exists "Users can create messages" on messages;
    drop policy if exists "Users can update their own messages" on messages;

    -- Create new policies
    create policy "Users can view their own messages"
      on messages for select
      using (auth.uid() in (sender_id, recipient_id));

    create policy "Users can create messages"
      on messages for insert
      with check (auth.uid() = sender_id);

    create policy "Users can update their own messages"
      on messages for update
      using (auth.uid() = sender_id);
  end if;
end $$;
commit; 