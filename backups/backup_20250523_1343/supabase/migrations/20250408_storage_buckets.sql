-- Create and configure Supabase storage buckets
BEGIN;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('profile-avatars', 'Profile Avatars', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']),
    ('signed-waivers', 'Signed Waivers', false, 10485760, ARRAY['application/pdf']),
    ('festival-maps', 'Festival Maps', true, 20971520, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
    ('performance-media', 'Performance Media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg']);

-- Create storage policies

-- Profile Avatars Policies
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES
    ('profile-avatars', 'Avatar Public Read', '{"roleName":"anon","allowedOperations":["SELECT"],"bucketId":"profile-avatars","objects":["**"],"permissions":["READ"]}'),
    ('profile-avatars', 'Avatar User Read', '{"roleName":"authenticated","allowedOperations":["SELECT"],"bucketId":"profile-avatars","objects":["**"],"permissions":["READ"]}'),
    ('profile-avatars', 'Avatar Owner Upload', '{"roleName":"authenticated","allowedOperations":["INSERT","UPDATE"],"bucketId":"profile-avatars","objects":["${auth.uid()}/**"],"permissions":["READ","INSERT","UPDATE"]}'),
    ('profile-avatars', 'Avatar Admin All', '{"roleName":"authenticated","allowedOperations":["SELECT","INSERT","UPDATE","DELETE"],"bucketId":"profile-avatars","objects":["**"],"permissions":["READ","WRITE"],"condition":"(storage.foldername(name))[1] = ''${auth.uid()}'' OR ((SELECT COUNT(*) FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = ''admin'') > 0)"}');

-- Signed Waivers Policies
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES
    ('signed-waivers', 'Waivers Admin Read', '{"roleName":"authenticated","allowedOperations":["SELECT"],"bucketId":"signed-waivers","objects":["**"],"permissions":["READ"],"condition":"((SELECT COUNT(*) FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = ''admin'') > 0)"}'),
    ('signed-waivers', 'Waivers Coordinator Read', '{"roleName":"authenticated","allowedOperations":["SELECT"],"bucketId":"signed-waivers","objects":["**"],"permissions":["READ"],"condition":"((SELECT COUNT(*) FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = ''coordinator'') > 0)"}'),
    ('signed-waivers', 'Waivers Own Read', '{"roleName":"authenticated","allowedOperations":["SELECT"],"bucketId":"signed-waivers","objects":["${auth.uid()}/**"],"permissions":["READ"]}'),
    ('signed-waivers', 'Waivers Own Upload', '{"roleName":"authenticated","allowedOperations":["INSERT","UPDATE"],"bucketId":"signed-waivers","objects":["${auth.uid()}/**"],"permissions":["READ","INSERT","UPDATE"]}'),
    ('signed-waivers', 'Waivers Admin All', '{"roleName":"authenticated","allowedOperations":["SELECT","INSERT","UPDATE","DELETE"],"bucketId":"signed-waivers","objects":["**"],"permissions":["READ","WRITE"],"condition":"((SELECT COUNT(*) FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = ''admin'') > 0)"}');

-- Festival Maps Policies
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES
    ('festival-maps', 'Maps Public Read', '{"roleName":"anon","allowedOperations":["SELECT"],"bucketId":"festival-maps","objects":["**"],"permissions":["READ"]}'),
    ('festival-maps', 'Maps User Read', '{"roleName":"authenticated","allowedOperations":["SELECT"],"bucketId":"festival-maps","objects":["**"],"permissions":["READ"]}'),
    ('festival-maps', 'Maps Admin All', '{"roleName":"authenticated","allowedOperations":["SELECT","INSERT","UPDATE","DELETE"],"bucketId":"festival-maps","objects":["**"],"permissions":["READ","WRITE"],"condition":"((SELECT COUNT(*) FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = ''admin'') > 0)"}'),
    ('festival-maps', 'Maps Coordinator Upload Update', '{"roleName":"authenticated","allowedOperations":["INSERT","UPDATE"],"bucketId":"festival-maps","objects":["**"],"permissions":["READ","INSERT","UPDATE"],"condition":"((SELECT COUNT(*) FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = ''coordinator'') > 0)"}');

-- Performance Media Policies
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES
    ('performance-media', 'Media Public Read', '{"roleName":"anon","allowedOperations":["SELECT"],"bucketId":"performance-media","objects":["**"],"permissions":["READ"]}'),
    ('performance-media', 'Media User Read', '{"roleName":"authenticated","allowedOperations":["SELECT"],"bucketId":"performance-media","objects":["**"],"permissions":["READ"]}'),
    ('performance-media', 'Media Admin All', '{"roleName":"authenticated","allowedOperations":["SELECT","INSERT","UPDATE","DELETE"],"bucketId":"performance-media","objects":["**"],"permissions":["READ","WRITE"],"condition":"((SELECT COUNT(*) FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = ''admin'') > 0)"}'),
    ('performance-media', 'Media Coordinator Upload', '{"roleName":"authenticated","allowedOperations":["INSERT","UPDATE"],"bucketId":"performance-media","objects":["**"],"permissions":["READ","INSERT","UPDATE"],"condition":"((SELECT COUNT(*) FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = ''coordinator'') > 0)"}');

-- Create functions to track file uploads and relate them to entities
CREATE OR REPLACE FUNCTION public.handle_storage_event()
RETURNS TRIGGER AS $$
DECLARE
    bucket_name TEXT;
    file_path TEXT;
    file_name TEXT;
    entity_type TEXT;
    entity_id TEXT;
BEGIN
    bucket_name := TG_ARGV[0]::TEXT;
    file_path := NEW.name;
    file_name := storage.filename(NEW.name);
    
    -- Extract information from the file path
    -- Expected format varies by bucket:
    -- profile-avatars: {user_id}/profile.jpg
    -- signed-waivers: {user_id}/{waiver_id}.pdf
    -- festival-maps: {festival_id}/map.jpg
    -- performance-media: {festival_id}/{performance_id}/{media_type}/{filename}
    
    IF bucket_name = 'profile-avatars' THEN
        -- Update user's profile with the new avatar URL
        UPDATE public.profiles
        SET avatar_url = storage.generate_presigned_url(bucket_name, file_path, 1800)::TEXT
        WHERE id = (storage.foldername(file_path))[1]::UUID;
        
    ELSIF bucket_name = 'signed-waivers' THEN
        -- Extract user_id and potentially waiver_id
        entity_id := (storage.foldername(file_path))[2];
        IF entity_id IS NOT NULL AND entity_id != '' THEN
            -- Update waiver record with the file path
            UPDATE public.waivers
            SET signed_document_path = file_path,
                signed_at = NOW()
            WHERE id = entity_id::UUID
            AND volunteer_id IN (
                SELECT id FROM public.volunteers 
                WHERE profile_id = (storage.foldername(file_path))[1]::UUID
            );
        END IF;
        
    ELSIF bucket_name = 'festival-maps' THEN
        -- Extract festival_id
        entity_id := (storage.foldername(file_path))[1];
        IF entity_id IS NOT NULL AND entity_id != '' THEN
            -- Update festival with map URL
            UPDATE public.festivals
            SET map_url = storage.generate_presigned_url(bucket_name, file_path, 1800)::TEXT
            WHERE id = entity_id::UUID;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for each bucket
CREATE TRIGGER handle_profile_avatar_upload
AFTER INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'profile-avatars')
EXECUTE FUNCTION public.handle_storage_event('profile-avatars');

CREATE TRIGGER handle_signed_waiver_upload
AFTER INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'signed-waivers')
EXECUTE FUNCTION public.handle_storage_event('signed-waivers');

CREATE TRIGGER handle_festival_map_upload
AFTER INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'festival-maps')
EXECUTE FUNCTION public.handle_storage_event('festival-maps');

COMMIT; 