import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to get the current user's profile
export const getCurrentUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }

    return profile;
};

// Helper function to check if a user has a specific role
export const hasRole = async (roleName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: roles, error } = await supabase
        .from('user_roles')
        .select(`
      role:roles (
        name
      )
    `)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error checking user role:', error);
        return false;
    }

    return roles.some(r => r.role?.name === roleName);
};

// Helper function to check if a user is an admin
export const isAdmin = async () => {
    return hasRole('admin');
};

// Helper function to check if a user is a coordinator
export const isCoordinator = async () => {
    return hasRole('coordinator');
}; 