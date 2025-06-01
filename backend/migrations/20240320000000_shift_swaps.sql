-- Create shift_swap_requests table
CREATE TABLE shift_swap_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
    requesting_volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    proposed_volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ
);

-- Create RLS policies for shift_swap_requests
ALTER TABLE shift_swap_requests ENABLE ROW LEVEL SECURITY;

-- Volunteers can view their own swap requests
CREATE POLICY "Volunteers can view their own swap requests"
    ON shift_swap_requests FOR SELECT
    USING (
        requesting_volunteer_id IN (
            SELECT id FROM volunteers WHERE user_id = auth.uid()
        )
    );

-- Volunteers can create swap requests
CREATE POLICY "Volunteers can create swap requests"
    ON shift_swap_requests FOR INSERT
    WITH CHECK (
        requesting_volunteer_id IN (
            SELECT id FROM volunteers WHERE user_id = auth.uid()
        )
    );

-- Coordinators can view all swap requests
CREATE POLICY "Coordinators can view all swap requests"
    ON shift_swap_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role_id = (SELECT id FROM roles WHERE name = 'coordinator')
        )
    );

-- Coordinators can update swap requests
CREATE POLICY "Coordinators can update swap requests"
    ON shift_swap_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role_id = (SELECT id FROM roles WHERE name = 'coordinator')
        )
    );

-- Create function to handle shift swap approval
CREATE OR REPLACE FUNCTION handle_shift_swap_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        -- Update the original shift with the new volunteer
        UPDATE shifts
        SET assigned_to = NEW.proposed_volunteer_id
        WHERE id = NEW.original_shift_id;

        -- Update the approved_by and approved_at fields
        NEW.approved_by = auth.uid();
        NEW.approved_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for shift swap approval
CREATE TRIGGER shift_swap_approval_trigger
    BEFORE UPDATE ON shift_swap_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_shift_swap_approval(); 