-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES auth.users(id),
    sender_name TEXT,
    recipient_id UUID REFERENCES auth.users(id) NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    read BOOLEAN DEFAULT false,
    festival_id UUID REFERENCES public.festivals(id),
    message_type TEXT DEFAULT 'direct' CHECK (message_type IN ('direct', 'announcement', 'notification')),
    title TEXT,
    important BOOLEAN DEFAULT false,
    audience JSONB DEFAULT '["all"]'::jsonb,
    archived BOOLEAN DEFAULT false
);

-- Add RLS policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy for inserting messages (only authenticated users)
CREATE POLICY "Users can insert messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for updating messages (only recipient or sender can update)
CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (
    auth.uid() = sender_id OR 
    (recipient_id IS NOT NULL AND auth.uid() = recipient_id)
);

-- Policy for deleting messages (only sender can delete)
CREATE POLICY "Users can delete their own messages"
ON public.messages
FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);

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

-- Index for performance
CREATE INDEX IF NOT EXISTS messages_recipient_id_idx ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_festival_id_idx ON public.messages(festival_id);
CREATE INDEX IF NOT EXISTS messages_message_type_idx ON public.messages(message_type);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at); 