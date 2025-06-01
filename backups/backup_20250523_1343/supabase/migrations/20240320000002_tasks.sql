-- Create task categories table
CREATE TABLE task_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES task_categories(id),
    location TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    required_skills TEXT[],
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task assignments table
CREATE TABLE task_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id),
    status TEXT CHECK (status IN ('assigned', 'accepted', 'completed', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, volunteer_id)
);

-- Create task comments table
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for task_categories
CREATE POLICY "Task categories are viewable by all authenticated users"
    ON task_categories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only coordinators can manage task categories"
    ON task_categories FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

-- Create policies for tasks
CREATE POLICY "Tasks are viewable by all authenticated users"
    ON tasks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only coordinators can create tasks"
    ON tasks FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

CREATE POLICY "Only coordinators can update tasks"
    ON tasks FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

CREATE POLICY "Only coordinators can delete tasks"
    ON tasks FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

-- Create policies for task_assignments
CREATE POLICY "Volunteers can view their own task assignments"
    ON task_assignments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM volunteers
            WHERE id = task_assignments.volunteer_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Coordinators can view all task assignments"
    ON task_assignments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

CREATE POLICY "Only coordinators can create task assignments"
    ON task_assignments FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

CREATE POLICY "Volunteers can update their own task assignment status"
    ON task_assignments FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM volunteers
            WHERE id = task_assignments.volunteer_id
            AND user_id = auth.uid()
        )
    );

-- Create policies for task_comments
CREATE POLICY "Task comments are viewable by all authenticated users"
    ON task_comments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create task comments"
    ON task_comments FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update their own task comments"
    ON task_comments FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own task comments"
    ON task_comments FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Create function to handle task status updates
CREATE OR REPLACE FUNCTION handle_task_status_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update task status based on assignments
    IF EXISTS (
        SELECT 1 FROM task_assignments
        WHERE task_id = NEW.id
    ) THEN
        -- If all assignments are completed, mark task as completed
        IF NOT EXISTS (
            SELECT 1 FROM task_assignments
            WHERE task_id = NEW.id
            AND status != 'completed'
        ) THEN
            NEW.status := 'completed';
        -- If any assignment is in progress, mark task as in progress
        ELSIF EXISTS (
            SELECT 1 FROM task_assignments
            WHERE task_id = NEW.id
            AND status = 'in_progress'
        ) THEN
            NEW.status := 'in_progress';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task status updates
CREATE TRIGGER task_status_update_trigger
    AFTER UPDATE ON task_assignments
    FOR EACH ROW
    EXECUTE FUNCTION handle_task_status_update();

-- Insert default task categories
INSERT INTO task_categories (name, description, color) VALUES
    ('Setup', 'Tasks related to festival setup and preparation', '#FF9800'),
    ('Operations', 'Tasks related to festival operations and management', '#2196F3'),
    ('Cleanup', 'Tasks related to festival cleanup and breakdown', '#4CAF50'),
    ('Emergency', 'Tasks related to emergency response and safety', '#F44336'),
    ('Administrative', 'Tasks related to administrative duties', '#9C27B0'); 