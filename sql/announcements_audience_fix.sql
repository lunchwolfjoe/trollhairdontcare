-- Add audience column to messages table for storing audience targeting information
DO $$
BEGIN
    -- Check if the audience column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'messages'
        AND column_name = 'audience'
    ) THEN
        -- Add the audience column as a JSONB array
        ALTER TABLE public.messages
        ADD COLUMN audience JSONB DEFAULT '["all"]'::jsonb;
        
        RAISE NOTICE 'Added audience column to messages table';
    ELSE
        RAISE NOTICE 'Audience column already exists in messages table';
    END IF;
END $$;

-- Create a new announcements view that includes audience information
CREATE OR REPLACE VIEW public.announcements_view AS
SELECT 
    id,
    festival_id,
    sender_id,
    content as announcement_content,
    audience,
    created_at,
    updated_at
FROM 
    public.messages
WHERE 
    message_type = 'announcement';

-- Example of how to query announcements for a specific audience
COMMENT ON VIEW public.announcements_view IS 
'To query announcements for a specific audience, use:
SELECT * FROM announcements_view 
WHERE audience @> ''["all"]''::jsonb 
   OR audience @> ''["stage_crew"]''::jsonb';

-- Set up RLS policy for announcements to respect audience targeting
DO $$
BEGIN
    DROP POLICY IF EXISTS "Volunteers can only view announcements targeted to them" ON public.messages;
    
    CREATE POLICY "Volunteers can only view announcements targeted to them"
    ON public.messages
    FOR SELECT
    TO authenticated
    USING (
        -- Coordinators and admins can see all announcements
        (
            EXISTS (
                SELECT 1 FROM user_roles ur
                JOIN public.roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid()
                AND r.name IN ('coordinator', 'admin')
            )
        )
        OR
        -- Volunteers can only see announcements targeted to their roles or to 'all'
        (
            message_type = 'announcement'
            AND
            (
                audience @> '["all"]'::jsonb
                OR
                EXISTS (
                    SELECT 1 FROM user_roles ur
                    JOIN public.roles r ON ur.role_id = r.id
                    WHERE ur.user_id = auth.uid()
                    AND (
                        audience @> format('["%%"]', r.name)::jsonb
                        OR EXISTS (
                            -- Check if volunteer is a member of a crew that is targeted
                            SELECT 1 
                            FROM volunteers v 
                            JOIN crew_members cm ON v.id = cm.volunteer_id
                            JOIN crews c ON cm.crew_id = c.id
                            WHERE v.profile_id = auth.uid()
                            AND audience @> format('["%%"]', c.name)::jsonb
                        )
                    )
                )
            )
        )
    );
END $$; 