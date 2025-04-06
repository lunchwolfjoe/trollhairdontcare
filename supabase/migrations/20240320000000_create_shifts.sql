-- Create shifts table
CREATE TABLE shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    assigned_to UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'completed', 'cancelled')),
    completion_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON shifts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Coordinators can view all shifts
CREATE POLICY "Coordinators can view all shifts"
    ON shifts FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

-- Coordinators can insert shifts
CREATE POLICY "Coordinators can insert shifts"
    ON shifts FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

-- Coordinators can update shifts
CREATE POLICY "Coordinators can update shifts"
    ON shifts FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

-- Coordinators can delete shifts
CREATE POLICY "Coordinators can delete shifts"
    ON shifts FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

-- Volunteers can view their assigned shifts
CREATE POLICY "Volunteers can view their assigned shifts"
    ON shifts FOR SELECT
    TO authenticated
    USING (
        assigned_to = auth.uid()
        AND EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'volunteer'
        )
    );

-- Volunteers can update their assigned shifts status
CREATE POLICY "Volunteers can update their assigned shifts status"
    ON shifts FOR UPDATE
    TO authenticated
    USING (
        assigned_to = auth.uid()
        AND EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'volunteer'
        )
    )
    WITH CHECK (
        assigned_to = auth.uid()
        AND EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'volunteer'
        )
    );

-- Create indexes
CREATE INDEX shifts_assigned_to_idx ON shifts(assigned_to);
CREATE INDEX shifts_status_idx ON shifts(status);
CREATE INDEX shifts_start_time_idx ON shifts(start_time);
CREATE INDEX shifts_end_time_idx ON shifts(end_time); 