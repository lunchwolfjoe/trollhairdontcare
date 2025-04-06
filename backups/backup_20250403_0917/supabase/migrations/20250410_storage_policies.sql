-- Storage Policies for TrollHairDontCare
-- This script sets up RLS policies for storage buckets

BEGIN;

-- Profile Avatars Bucket Policies
CREATE POLICY "Profile avatars are publicly viewable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'profile-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'profile-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Signed Waivers Bucket Policies
CREATE POLICY "Signed waivers are viewable by admins and the signing volunteer"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'signed-waivers' AND
        (
            is_admin(auth.uid()) OR
            auth.uid()::text = (storage.foldername(name))[1]
        )
    );

CREATE POLICY "Only admins can upload signed waivers"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'signed-waivers' AND
        is_admin(auth.uid())
    );

CREATE POLICY "Only admins can update signed waivers"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'signed-waivers' AND
        is_admin(auth.uid())
    );

-- Festival Maps Bucket Policies
CREATE POLICY "Festival maps are publicly viewable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'festival-maps');

CREATE POLICY "Only admins can manage festival maps"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'festival-maps' AND
        is_admin(auth.uid())
    );

-- Performance Media Bucket Policies
CREATE POLICY "Performance media is publicly viewable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'performance-media');

CREATE POLICY "Only admins and coordinators can upload performance media"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'performance-media' AND
        (is_admin(auth.uid()) OR is_coordinator(auth.uid()))
    );

CREATE POLICY "Only admins and coordinators can update performance media"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'performance-media' AND
        (is_admin(auth.uid()) OR is_coordinator(auth.uid()))
    );

COMMIT; 