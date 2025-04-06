import { supabase } from '../lib/supabase';
import { UserProfile } from './profileService';

export interface UserStats {
  total_users: number;
  active_volunteers: number;
  total_festivals: number;
  upcoming_festivals: number;
  total_shifts: number;
  filled_shifts: number;
}

export interface UserManagementData {
  id: string;
  email: string;
  role: string;
  profile: UserProfile | null;
  created_at: string;
  last_sign_in: string | null;
}

export const adminService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<UserStats> {
    const [
      { count: total_users },
      { count: active_volunteers },
      { count: total_festivals },
      { count: upcoming_festivals },
      { count: total_shifts },
      { count: filled_shifts },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('festivals').select('*', { count: 'exact', head: true }),
      supabase
        .from('festivals')
        .select('*', { count: 'exact', head: true })
        .gte('start_date', new Date().toISOString()),
      supabase.from('shifts').select('*', { count: 'exact', head: true }),
      supabase
        .from('shifts')
        .select('*', { count: 'exact', head: true })
        .not('volunteer_id', 'is', null),
    ]);

    return {
      total_users: total_users || 0,
      active_volunteers: active_volunteers || 0,
      total_festivals: total_festivals || 0,
      upcoming_festivals: upcoming_festivals || 0,
      total_shifts: total_shifts || 0,
      filled_shifts: filled_shifts || 0,
    };
  },

  // Get all users with their profiles
  async getUsers(): Promise<UserManagementData[]> {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        created_at,
        last_sign_in_at,
        profiles (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profiles,
      created_at: user.created_at,
      last_sign_in: user.last_sign_in_at,
    }));
  },

  // Update user role
  async updateUserRole(userId: string, newRole: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) throw error;
  },

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  },

  // Get system logs
  async getSystemLogs(limit: number = 100): Promise<any[]> {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Subscribe to admin events
  subscribeToAdminEvents(callback: (payload: any) => void) {
    return supabase
      .channel('admin_events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        callback
      )
      .subscribe();
  }
}; 