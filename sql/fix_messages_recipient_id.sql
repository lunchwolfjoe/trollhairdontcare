-- Script to fix messages table with recipient_id issues

-- Modify the messages table to allow null recipient_id
ALTER TABLE public.messages
ALTER COLUMN recipient_id DROP NOT NULL;

-- Drop the existing RLS policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Re-create the policies with the fixes
-- Policy for updating messages (only recipient or sender can update)
CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (
    auth.uid() = sender_id OR 
    (recipient_id IS NOT NULL AND auth.uid() = recipient_id)
);

-- Policy for viewing messages (only recipient or sender can view)
CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
    -- For direct messages, only sender or recipient can view
    (message_type = 'direct' AND (auth.uid() = sender_id OR auth.uid() = recipient_id))
    OR
    -- For announcements, don't check recipient_id since it's not relevant
    (
        message_type = 'announcement'
        AND
        (
            -- Coordinators and admins can see all announcements
            EXISTS (
                SELECT 1 FROM user_roles ur
                JOIN public.roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid()
                AND r.name IN ('coordinator', 'admin')
            )
            OR
            -- Volunteers can only see announcements targeted to their roles or to 'all'
            (
                audience @> '["all"]'::jsonb
                OR
                EXISTS (
                    SELECT 1 FROM user_roles ur
                    JOIN public.roles r ON ur.role_id = r.id
                    WHERE ur.user_id = auth.uid()
                    AND audience @> format('["%%"]', r.name)::jsonb
                )
                OR
                EXISTS (
                    SELECT 1 FROM crew_members cm
                    JOIN crews c ON cm.crew_id = c.id
                    WHERE cm.profile_id = auth.uid()
                    AND audience @> format('["%%"]', c.name)::jsonb
                )
            )
        )
    )
);

-- Update any existing announcements to have NULL recipient_id
UPDATE public.messages
SET recipient_id = NULL
WHERE message_type = 'announcement';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Messages table fixed successfully!';
END $$; 