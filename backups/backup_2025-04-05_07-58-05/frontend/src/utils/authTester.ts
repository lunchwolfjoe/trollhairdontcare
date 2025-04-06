import { supabase } from '../lib/supabase';

/**
 * Tests if a user exists in the authentication system
 */
export const checkUserExists = async (email: string): Promise<{ exists: boolean; message: string; details?: any }> => {
  try {
    console.log('Checking if user exists:', email);
    
    // Try to get users from auth.users (requires admin privileges)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error checking user existence:', error);
      return {
        exists: false,
        message: `Error checking if user exists: ${error.message}`,
        details: error
      };
    }
    
    if (!data) {
      return {
        exists: false,
        message: 'User does not exist in the profiles table'
      };
    }
    
    // Try to check if the user exists in auth.users indirectly
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Current session:', session);
    
    return {
      exists: true,
      message: 'User exists in the profiles table',
      details: {
        profile: data,
        session: session || null
      }
    };
  } catch (error) {
    console.error('Unexpected error checking user existence:', error);
    return {
      exists: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      details: error
    };
  }
};

/**
 * Tests a direct login attempt with provided credentials
 */
export const testLogin = async (email: string, password: string): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    console.log('Testing login with credentials...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Login test failed:', error);
      return {
        success: false,
        message: `Login failed: ${error.message}`,
        details: error
      };
    }
    
    return {
      success: true,
      message: 'Login successful',
      details: data
    };
  } catch (error) {
    console.error('Unexpected error during login test:', error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      details: error
    };
  }
}; 