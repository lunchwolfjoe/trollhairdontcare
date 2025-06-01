-- Additional RLS policies for the TrollHairDontCare application

-- Enable RLS on all tables
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY['roles', 'user_roles', 'festivals', 'locations', 'volunteers', 
                          'assignments', 'assets', 'waivers', 'messages', 'channels', 
                          'channel_messages'];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

-- Helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = uid AND r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user is a coordinator
CREATE OR REPLACE FUNCTION public.is_coordinator(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = uid AND r.name = 'coordinator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user is a volunteer
CREATE OR REPLACE FUNCTION public.is_volunteer(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = uid AND r.name = 'volunteer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Roles policies
CREATE POLICY "Roles are readable by all authenticated users"
ON public.roles FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Roles can only be managed by admins"
ON public.roles FOR ALL
USING (public.is_admin(auth.uid()));

-- User Roles policies
CREATE POLICY "User roles are viewable by admins and coordinators"
ON public.user_roles FOR SELECT
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "User roles can only be managed by admins"
ON public.user_roles FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "User roles can be updated by admins"
ON public.user_roles FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "User roles can be deleted by admins"
ON public.user_roles FOR DELETE
USING (public.is_admin(auth.uid()));

-- Festivals policies
CREATE POLICY "Festivals are readable by all authenticated users"
ON public.festivals FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Festivals can only be managed by admins and coordinators"
ON public.festivals FOR INSERT
WITH CHECK (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

CREATE POLICY "Festivals can be updated by admins and coordinators"
ON public.festivals FOR UPDATE
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

CREATE POLICY "Festivals can be deleted by admins"
ON public.festivals FOR DELETE
USING (public.is_admin(auth.uid()));

-- Locations policies
CREATE POLICY "Locations are readable by all authenticated users"
ON public.locations FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Locations can only be managed by admins and coordinators"
ON public.locations FOR INSERT
WITH CHECK (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

CREATE POLICY "Locations can be updated by admins and coordinators"
ON public.locations FOR UPDATE
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

CREATE POLICY "Locations can be deleted by admins and coordinators"
ON public.locations FOR DELETE
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

-- Volunteers policies
CREATE POLICY "Volunteers are viewable by admins and coordinators"
ON public.volunteers FOR SELECT
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

CREATE POLICY "Volunteers can view their own records"
ON public.volunteers FOR SELECT
USING (profile_id = auth.uid());

CREATE POLICY "Volunteers can be created by admins, coordinators, or self-registration"
ON public.volunteers FOR INSERT
WITH CHECK (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid()) OR
  profile_id = auth.uid()
);

CREATE POLICY "Volunteers can be updated by admins, coordinators, or themselves"
ON public.volunteers FOR UPDATE
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid()) OR
  profile_id = auth.uid()
);

CREATE POLICY "Volunteers can be deleted by admins or coordinators"
ON public.volunteers FOR DELETE
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

-- Assignments policies
CREATE POLICY "Assignments are viewable by admins and coordinators"
ON public.assignments FOR SELECT
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

CREATE POLICY "Volunteers can view their own assignments"
ON public.assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.volunteers v
    WHERE v.id = volunteer_id AND v.profile_id = auth.uid()
  )
);

CREATE POLICY "Assignments can be managed by admins and coordinators"
ON public.assignments FOR ALL
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

-- Assets policies
CREATE POLICY "Assets are viewable by all authenticated users"
ON public.assets FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Assets can be managed by admins and coordinators"
ON public.assets FOR ALL
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

-- Waivers policies
CREATE POLICY "Waivers are viewable by admins and coordinators"
ON public.waivers FOR SELECT
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

CREATE POLICY "Volunteers can view their own waivers"
ON public.waivers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.volunteers v
    WHERE v.id = volunteer_id AND v.profile_id = auth.uid()
  )
);

CREATE POLICY "Waivers can be created by admins and coordinators"
ON public.waivers FOR INSERT
WITH CHECK (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

CREATE POLICY "Waivers can be signed by the volunteer"
ON public.waivers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.volunteers v
    WHERE v.id = volunteer_id AND v.profile_id = auth.uid()
  )
);

CREATE POLICY "Waivers can be managed by admins and coordinators"
ON public.waivers FOR ALL
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

-- Messages policies
CREATE POLICY "Messages are viewable by all authenticated users"
ON public.messages FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Messages can be created by authenticated users"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  sender_id = auth.uid()
);

CREATE POLICY "Messages can be managed by admins and their creators"
ON public.messages FOR UPDATE
USING (
  public.is_admin(auth.uid()) OR
  sender_id = auth.uid()
);

CREATE POLICY "Messages can be deleted by admins and their creators"
ON public.messages FOR DELETE
USING (
  public.is_admin(auth.uid()) OR
  sender_id = auth.uid()
);

-- Channels policies
CREATE POLICY "Channels are viewable by all authenticated users"
ON public.channels FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Channels can be managed by admins and coordinators"
ON public.channels FOR ALL
USING (
  public.is_admin(auth.uid()) OR
  public.is_coordinator(auth.uid())
);

-- Channel Messages policies
CREATE POLICY "Channel messages are viewable by all authenticated users"
ON public.channel_messages FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Channel messages can be created by authenticated users"
ON public.channel_messages FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  sender_id = auth.uid()
);

CREATE POLICY "Channel messages can be updated by admins and their creators"
ON public.channel_messages FOR UPDATE
USING (
  public.is_admin(auth.uid()) OR
  sender_id = auth.uid()
);

CREATE POLICY "Channel messages can be deleted by admins and their creators"
ON public.channel_messages FOR DELETE
USING (
  public.is_admin(auth.uid()) OR
  sender_id = auth.uid()
); 