-- Create notification_templates table
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES notification_templates(id) ON DELETE CASCADE,
    shift_swap_request_id UUID REFERENCES shift_swap_requests(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

-- Insert notification templates
INSERT INTO notification_templates (type, subject, body) VALUES
    ('shift_swap_requested', 'New Shift Swap Request', 'A new shift swap request has been submitted for your approval.'),
    ('shift_swap_approved', 'Shift Swap Approved', 'Your shift swap request has been approved.'),
    ('shift_swap_rejected', 'Shift Swap Rejected', 'Your shift swap request has been rejected.'),
    ('shift_swap_conflict', 'Shift Swap Conflict', 'A shift swap request has been submitted but there is a scheduling conflict.');

-- Create function to handle shift swap notifications
CREATE OR REPLACE FUNCTION handle_shift_swap_notifications()
RETURNS TRIGGER AS $$
DECLARE
    template_id UUID;
    coordinator_id UUID;
    volunteer_id UUID;
BEGIN
    -- Get the template ID based on the status
    SELECT id INTO template_id
    FROM notification_templates
    WHERE type = CASE
        WHEN NEW.status = 'pending' THEN 'shift_swap_requested'
        WHEN NEW.status = 'approved' THEN 'shift_swap_approved'
        WHEN NEW.status = 'rejected' THEN 'shift_swap_rejected'
    END;

    -- Get the coordinator ID
    SELECT user_id INTO coordinator_id
    FROM user_roles
    WHERE role_id = (SELECT id FROM roles WHERE name = 'coordinator')
    LIMIT 1;

    -- Get the volunteer ID
    SELECT user_id INTO volunteer_id
    FROM volunteers
    WHERE id = NEW.requesting_volunteer_id;

    -- Create notifications
    IF NEW.status = 'pending' THEN
        -- Notify coordinator
        INSERT INTO notifications (user_id, template_id, shift_swap_request_id)
        VALUES (coordinator_id, template_id, NEW.id);
    ELSE
        -- Notify volunteer
        INSERT INTO notifications (user_id, template_id, shift_swap_request_id)
        VALUES (volunteer_id, template_id, NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for shift swap notifications
CREATE TRIGGER shift_swap_notification_trigger
    AFTER UPDATE ON shift_swap_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_shift_swap_notifications(); 