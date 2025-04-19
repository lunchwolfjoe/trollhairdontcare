import { ApiResponse, handleError } from './api';
import { Database } from '../types/supabase';
import { supabase } from '../supabaseClient';

type Guest = Database['public']['Tables']['guests']['Row'];
type GuestInsert = Database['public']['Tables']['guests']['Insert'];
type GuestUpdate = Database['public']['Tables']['guests']['Update'];

export class GuestService {
  private readonly tableName = 'guests';

  async getGuests(festivalId: string): Promise<ApiResponse<Guest[]>> {
    try {
      const { data, error } = await supabase.from(this.tableName)
        .select('*')
        .eq('festival_id', festivalId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: handleError(error) };
      }
      return { data: data as Guest[], error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  async getGuest(id: string): Promise<ApiResponse<Guest>> {
    try {
      const { data, error } = await supabase.from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: handleError(error) };
      }
      return { data: data as Guest | null, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  async createGuest(guestData: GuestInsert): Promise<ApiResponse<Guest>> {
    try {
      const { data, error } = await supabase.from(this.tableName)
        .insert(guestData)
        .select()
        .single();
      if (error) throw error;
      return { data: data as Guest | null, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  async updateGuest(id: string, guestData: GuestUpdate): Promise<ApiResponse<Guest>> {
    try {
      const { data, error } = await supabase.from(this.tableName)
        .update(guestData)
        .eq('id', id)
        .select()
        .single();
       if (error) throw error;
      return { data: data as Guest | null, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }
  
  async deleteGuest(id: string): Promise<ApiResponse<null>> {
     try {
        const { data, error } = await supabase.from(this.tableName).delete().eq('id', id);
        if (error) {
           return { data: null, error: handleError(error) };
        }
        return { data: null, error: null };
     } catch (error) {
        return { data: null, error: handleError(error) };
     }
  }

  async checkInGuest(id: string): Promise<ApiResponse<Guest>> {
    try {
      const updateData = {
          checked_in: true,
          // checked_in_at: new Date().toISOString(), // Ensure this field exists
        };
      const { data, error } = await supabase.from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data: data as Guest | null, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  async getGuestStats(festivalId: string): Promise<ApiResponse<{ total: number; checkedIn: number }>> {
    try {
      const [totalResponse, checkedInResponse] = await Promise.all([
        supabase.from(this.tableName).select('id', { count: 'exact' }).eq('festival_id', festivalId),
        supabase.from(this.tableName).select('id', { count: 'exact' }).eq('festival_id', festivalId).eq('checked_in', true),
      ]);
      // Handle potential errors from promises if needed
      const total = totalResponse.count || 0;
      const checkedIn = checkedInResponse.count || 0;
      return { data: { total, checkedIn }, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }
}

export const guestService = new GuestService(); 