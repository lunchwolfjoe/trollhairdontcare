-- Create the guests table
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    festival_id UUID NOT NULL REFERENCES public.festivals(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    rv_spot_number TEXT,
    ticket_type TEXT NOT NULL CHECK (ticket_type IN ('Full Festival', 'Weekend', 'Day Pass', 'VIP', 'Artist')),
    tow_vehicle_permit BOOLEAN NOT NULL DEFAULT FALSE,
    sleeper_vehicle_permit BOOLEAN NOT NULL DEFAULT FALSE,
    credentials_issued BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS guests_festival_id_idx ON public.guests(festival_id);
CREATE INDEX IF NOT EXISTS guests_full_name_idx ON public.guests(full_name);
CREATE INDEX IF NOT EXISTS guests_credential_status_idx ON public.guests(credentials_issued);

-- Create view for checked-in guests reporting
CREATE OR REPLACE VIEW public.checked_in_guests AS
SELECT 
    g.*,
    f.name AS festival_name,
    f.start_date AS festival_start_date,
    f.end_date AS festival_end_date
FROM 
    public.guests g
JOIN 
    public.festivals f ON g.festival_id = f.id
WHERE 
    g.credentials_issued = TRUE;

-- Create view for pending check-ins
CREATE OR REPLACE VIEW public.pending_checkins AS
SELECT 
    g.*,
    f.name AS festival_name,
    f.start_date AS festival_start_date,
    f.end_date AS festival_end_date
FROM 
    public.guests g
JOIN 
    public.festivals f ON g.festival_id = f.id
WHERE 
    g.credentials_issued = FALSE;

-- Add RLS policies for the guests table
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Policy for coordinators and admins to see all guests
CREATE POLICY guests_view_policy ON public.guests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN (
                SELECT id FROM roles WHERE name IN ('coordinator', 'admin')
            )
        )
    );

-- Policy for coordinators and admins to insert guests
CREATE POLICY guests_insert_policy ON public.guests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN (
                SELECT id FROM roles WHERE name IN ('coordinator', 'admin')
            )
        )
    );

-- Policy for coordinators and admins to update guests
CREATE POLICY guests_update_policy ON public.guests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN (
                SELECT id FROM roles WHERE name IN ('coordinator', 'admin')
            )
        )
    );

-- Create trigger to update the updated_at timestamp when a guest record is updated
CREATE OR REPLACE FUNCTION update_guests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guests_updated_at_trigger
BEFORE UPDATE ON public.guests
FOR EACH ROW
EXECUTE FUNCTION update_guests_updated_at();

-- Create function to check in a guest
CREATE OR REPLACE FUNCTION check_in_guest(guest_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    success BOOLEAN;
BEGIN
    UPDATE public.guests
    SET 
        credentials_issued = TRUE,
        updated_at = NOW()
    WHERE id = guest_id;
    
    GET DIAGNOSTICS success = ROW_COUNT;
    RETURN success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 