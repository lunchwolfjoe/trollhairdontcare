import { supabase } from '../lib/supabase';

/**
 * Test the connection to Supabase
 * @returns A promise that resolves with the connection status
 */
export const testSupabaseConnection = async (): Promise<{
  connected: boolean;
  message: string;
  error?: any;
  details?: any;
}> => {
  try {
    // Try a simple query to test the connection
    const { data, error } = await supabase.from('roles').select('*').limit(1);
    
    if (error) {
      return {
        connected: false,
        message: 'Connection failed: ' + error.message,
        error
      };
    }
    
    // Try to check authentication
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      return {
        connected: true,
        message: 'Connected to database, but auth service error: ' + authError.message,
        error: authError
      };
    }
    
    return {
      connected: true,
      message: 'Successfully connected to Supabase',
      details: {
        roles: data,
        session: authData.session ? 'Active' : 'No active session'
      }
    };
  } catch (error: any) {
    return {
      connected: false,
      message: 'Connection test failed with an exception: ' + error.message,
      error
    };
  }
};

export const testDatabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    // Test 1: Check if we can connect to Supabase by querying the roles table
    console.log('Testing Supabase connection...');
    const { data: connectionData, error: connectionError } = await supabase.from('roles').select('*').limit(1);
    
    if (connectionError) {
      console.error('Connection error:', connectionError);
      return {
        success: false,
        message: 'Failed to connect to Supabase',
        details: connectionError
      };
    }
    
    console.log('Successfully connected to Supabase');
    
    // Test 2: Check if roles table exists and has data
    console.log('Checking roles table...');
    const { data: roles, error: rolesError } = await supabase.from('roles').select('*');
    
    if (rolesError) {
      console.error('Roles table error:', rolesError);
      return {
        success: false,
        message: 'Roles table not found or not accessible',
        details: rolesError
      };
    }
    
    if (!roles || roles.length === 0) {
      console.error('No roles found in the database');
      return {
        success: false,
        message: 'No roles found in the database. Run the SQL setup script.',
        details: { roles }
      };
    }
    
    console.log('Roles table exists with data:', roles);
    
    // Test 3: Check if profiles table exists
    console.log('Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*').limit(1);
    
    if (profilesError) {
      console.error('Profiles table error:', profilesError);
      return {
        success: false,
        message: 'Profiles table not found or not accessible',
        details: profilesError
      };
    }
    
    console.log('Profiles table exists');
    
    // Test 4: Check if user_roles table exists
    console.log('Checking user_roles table...');
    const { data: userRoles, error: userRolesError } = await supabase.from('user_roles').select('*').limit(1);
    
    if (userRolesError) {
      console.error('User roles table error:', userRolesError);
      return {
        success: false,
        message: 'User roles table not found or not accessible',
        details: userRolesError
      };
    }
    
    console.log('User roles table exists');
    
    // Test 5: Test RLS policies by trying to insert a test user role
    // This should fail if RLS is properly set up and the user is not authenticated
    console.log('Testing RLS policies...');
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const { data: testRole } = await supabase.from('roles').select('id').eq('name', 'volunteer').single();
    
    if (testRole) {
      const { error: insertError } = await supabase.from('user_roles').insert({
        user_id: testUserId,
        role_id: testRole.id,
        created_at: new Date().toISOString()
      });
      
      console.log('RLS policy test result:', insertError ? 'Protected by RLS' : 'NOT protected by RLS');
    }
    
    return {
      success: true,
      message: 'Database is properly configured',
      details: {
        roles,
        profilesCount: profiles?.length || 0,
        userRolesCount: userRoles?.length || 0
      }
    };
  } catch (error) {
    console.error('Database test failed:', error);
    return {
      success: false,
      message: 'Database test failed with an unexpected error',
      details: error
    };
  }
}; 