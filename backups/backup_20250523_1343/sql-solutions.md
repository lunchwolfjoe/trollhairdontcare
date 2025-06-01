# SQL Solutions for Supabase Auth Issues

## Email Confirmation Bypass

If you're experiencing issues with email confirmation in Supabase Auth, you can use the following SQL commands to manually confirm user emails in your database. This is useful for development and testing purposes.

### 1. Check User Status

First, check the current status of users in your Supabase Auth system:

```sql
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users;
```

### 2. Manually Confirm User Email

To manually confirm a specific user's email:

```sql
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'user@example.com';
```

Or to confirm by user ID:

```sql
UPDATE auth.users
SET email_confirmed_at = now()
WHERE id = '0f23cd88-5998-4de9-8511-54c8b7918357';
```

### 3. Confirm All Unconfirmed Emails

To confirm all pending email confirmations (use with caution in production):

```sql
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;
```

### 4. Create a DB Function to Auto-Confirm Emails

You can create a trigger to automatically confirm emails for new users:

```sql
-- Create the function
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.auto_confirm_email();
```

## Testing Authentication Without Email Confirmation

For development purposes, you can create a function to add a test user with confirmed email:

```sql
-- Function to create a test user with confirmed email
CREATE OR REPLACE FUNCTION public.create_test_user(
  test_email TEXT,
  test_password TEXT
) RETURNS uuid AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Insert the user with a confirmed email
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    test_email,
    crypt(test_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email"}',
    '{"full_name": "Test User"}'
  )
  RETURNING id INTO user_id;
  
  -- Create a profile for the user
  INSERT INTO public.profiles (id, full_name)
  VALUES (user_id, 'Test User');
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Example usage:
```sql
SELECT * FROM public.create_test_user('test@example.com', 'securepassword123');
```

## Other Helpful Supabase Auth Commands

### List Users with Roles
```sql
SELECT 
  u.id,
  u.email,
  r.name as role_name
FROM 
  auth.users u
LEFT JOIN 
  public.user_roles ur ON u.id = ur.user_id
LEFT JOIN 
  public.roles r ON ur.role_id = r.id;
```

### Assign Role to User
```sql
-- First get role ID
SELECT id FROM public.roles WHERE name = 'volunteer';

-- Then assign role to user
INSERT INTO public.user_roles (user_id, role_id)
VALUES ('user-id-here', 'role-id-here');
```

These solutions are based on common workarounds for Supabase email confirmation issues as discussed in [GitHub Issue #5113](https://github.com/supabase/supabase/issues/5113). 