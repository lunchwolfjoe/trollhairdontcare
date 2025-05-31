import { supabase } from '../lib/supabaseClient';

// Helper function to create an admin user for testing
export const createAdminUser = async (email: string, password: string) => {
  try {
    // First, sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw authError;
    }

    if (authData.user) {
      console.log('Admin user created successfully:', authData.user.email);
      return authData.user;
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Helper function to sign in as admin
export const signInAsAdmin = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    console.log('Admin signed in successfully:', data.user?.email);
    return data.user;
  } catch (error) {
    console.error('Error signing in as admin:', error);
    throw error;
  }
};

// Default admin credentials for testing
export const DEFAULT_ADMIN = {
  email: 'admin@trollhairdontcare.com',
  password: 'admin123456',
}; 