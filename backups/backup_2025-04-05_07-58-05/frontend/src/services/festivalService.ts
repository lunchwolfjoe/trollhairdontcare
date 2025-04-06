import { supabase } from '../lib/supabase';

export interface Festival {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FestivalCreate {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: Festival['status'];
  location: string;
  max_volunteers: number;
}

export interface FestivalUpdate extends Partial<FestivalCreate> {
  id: string;
}

export const festivalService = {
  // Get all festivals
  async getFestivals(): Promise<Festival[]> {
    const { data, error } = await supabase
      .from('festivals')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get upcoming festivals
  async getUpcomingFestivals(): Promise<Festival[]> {
    const { data, error } = await supabase
      .from('festivals')
      .select('*')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get active festivals
  async getActiveFestivals(): Promise<Festival[]> {
    const { data, error } = await supabase
      .from('festivals')
      .select('*')
      .eq('status', 'active')
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get festival by ID
  async getFestivalById(id: string): Promise<Festival> {
    const { data, error } = await supabase
      .from('festivals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new festival
  async createFestival(festival: Omit<Festival, 'id' | 'created_at' | 'updated_at'>): Promise<Festival> {
    const { data, error } = await supabase
      .from('festivals')
      .insert([festival])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a festival
  async updateFestival(id: string, updates: Partial<Festival>): Promise<Festival> {
    const { data, error } = await supabase
      .from('festivals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a festival
  async deleteFestival(id: string): Promise<void> {
    const { error } = await supabase
      .from('festivals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Subscribe to festival updates
  subscribeToFestivals(callback: (payload: any) => void) {
    return supabase
      .channel('festival_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'festivals',
        },
        callback
      )
      .subscribe();
  },

  async getRecentFestivals(limit: number = 5): Promise<Festival[]> {
    const { data, error } = await supabase
      .from('festivals')
      .select('*')
      .order('start_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
}; 