-- Create a database function to confirm a user's email
-- This is primarily for development purposes
CREATE OR REPLACE FUNCTION public.confirm_user_email(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update the auth.users table to set email_confirmed_at to now()
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = user_id AND email_confirmed_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to the function
-- Note: In production, you would want to restrict this more carefully
GRANT EXECUTE ON FUNCTION public.confirm_user_email(UUID) TO anon, authenticated, service_role;

-- For security, you might want to add a comment explaining this is for development only
COMMENT ON FUNCTION public.confirm_user_email IS 
  'Development helper function to confirm a user email without requiring the confirmation link.
   This should be carefully restricted in production environments.'; 