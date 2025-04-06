-- Create a function that retrieves table column information
CREATE OR REPLACE FUNCTION public.get_table_definition(table_name text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Query the information_schema to get column definitions
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable,
        'column_default', column_default
      )
    ) INTO result
  FROM 
    information_schema.columns
  WHERE 
    table_schema = 'public' 
    AND table_name = get_table_definition.table_name;
    
  -- If table doesn't exist, return empty array
  IF result IS NULL THEN
    result := '[]'::jsonb;
  END IF;
  
  RETURN result;
END;
$$;

-- Also create a function to run arbitrary SQL (for admin use only)
CREATE OR REPLACE FUNCTION public.run_sql(sql text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if caller has admin role
  IF NOT (SELECT EXISTS (
    SELECT 1 FROM pg_roles 
    WHERE rolname = current_user 
    AND (rolsuper OR rolinherit)
  )) THEN
    RAISE EXCEPTION 'Permission denied. Only admin users can run this function.';
  END IF;
  
  -- Execute the provided SQL
  EXECUTE sql;
  
  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'code', SQLSTATE
    );
END;
$$;

-- Allow authenticated users to call the get_table_definition function
GRANT EXECUTE ON FUNCTION public.get_table_definition(text) TO authenticated;

-- Allow only postgres & service_role to call run_sql
REVOKE ALL ON FUNCTION public.run_sql(text) FROM public;
REVOKE ALL ON FUNCTION public.run_sql(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.run_sql(text) TO postgres;
GRANT EXECUTE ON FUNCTION public.run_sql(text) TO service_role;

-- Add a safer function to check table columns that any authenticated user can call
CREATE OR REPLACE FUNCTION public.check_table_columns(table_name text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Query the information_schema to get column names
  SELECT 
    jsonb_build_object(
      'columns', jsonb_agg(column_name)
    ) INTO result
  FROM 
    information_schema.columns
  WHERE 
    table_schema = 'public' 
    AND table_name = check_table_columns.table_name;
    
  -- If table doesn't exist, return empty array
  IF result IS NULL THEN
    result := jsonb_build_object('columns', '[]'::jsonb);
  END IF;
  
  RETURN result;
END;
$$;

-- Allow authenticated users to call the check_table_columns function
GRANT EXECUTE ON FUNCTION public.check_table_columns(text) TO authenticated; 