import { supabase } from '../supabaseClient';
import { BaseService } from './api';

export interface Guest {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  rv_spot_number?: string;
  ticket_type: 'Full Festival' | 'Weekend' | 'Day Pass' | 'VIP' | 'Artist';
  tow_vehicle_permit: boolean;
  sleeper_vehicle_permit: boolean;
  credentials_issued: boolean;
  created_at: string;
  updated_at?: string;
  festival_id: string;
}

export interface GuestFilters {
  festival_id?: string;
  ticket_type?: string;
  credentials_issued?: boolean;
  search?: string;
}

export interface GuestStatistics {
  totalGuests: number;
  checkedInGuests: number;
  pendingGuests: number;
  checkinPercentage: number;
}

class GuestService extends BaseService {
  /**
   * Get all guests for a festival with optional filtering
   */
  async getGuests(filters: GuestFilters, pagination?: { page: number; pageSize: number }) {
    try {
      let query = supabase
        .from('guests')
        .select('*');
      
      // Apply filters
      if (filters.festival_id) {
        query = query.eq('festival_id', filters.festival_id);
      }
      
      if (filters.ticket_type) {
        query = query.eq('ticket_type', filters.ticket_type);
      }
      
      if (filters.credentials_issued !== undefined) {
        query = query.eq('credentials_issued', filters.credentials_issued);
      }
      
      if (filters.search) {
        query = query.ilike('full_name', `%${filters.search}%`);
      }
      
      // Apply pagination if specified
      if (pagination) {
        const { page, pageSize } = pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }
      
      // Execute query
      const { data, error } = await query.order('full_name');
      
      if (error) {
        throw this.handleError(error);
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  /**
   * Get a single guest by ID
   */
  async getGuestById(id: string) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw this.handleError(error);
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  /**
   * Create a new guest
   */
  async createGuest(guest: Omit<Guest, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert(guest)
        .select()
        .single();
      
      if (error) {
        throw this.handleError(error);
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  /**
   * Update a guest record
   */
  async updateGuest(id: string, updates: Partial<Omit<Guest, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw this.handleError(error);
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  /**
   * Check in a guest (mark credentials as issued)
   */
  async checkInGuest(id: string) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .update({ credentials_issued: true })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw this.handleError(error);
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  /**
   * Update guest vehicle permits
   */
  async updateGuestPermits(id: string, towVehiclePermit: boolean, sleeperVehiclePermit: boolean) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .update({
          tow_vehicle_permit: towVehiclePermit,
          sleeper_vehicle_permit: sleeperVehiclePermit
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw this.handleError(error);
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  /**
   * Count guests matching certain filters
   */
  async countGuests(filters: GuestFilters) {
    try {
      let query = supabase
        .from('guests')
        .select('id', { count: 'exact' });
      
      // Apply filters
      if (filters.festival_id) {
        query = query.eq('festival_id', filters.festival_id);
      }
      
      if (filters.ticket_type) {
        query = query.eq('ticket_type', filters.ticket_type);
      }
      
      if (filters.credentials_issued !== undefined) {
        query = query.eq('credentials_issued', filters.credentials_issued);
      }
      
      if (filters.search) {
        query = query.ilike('full_name', `%${filters.search}%`);
      }
      
      // Execute query
      const { count, error } = await query;
      
      if (error) {
        throw this.handleError(error);
      }
      
      return { data: count || 0, error: null };
    } catch (error) {
      return { data: 0, error };
    }
  }
  
  /**
   * Get check-in statistics for a festival
   */
  async getCheckInStatistics(festivalId: string): Promise<{ data: GuestStatistics | null, error: Error | null }> {
    try {
      // Get total guest count
      const { data: totalCount, error: totalError } = await this.countGuests({ festival_id: festivalId });
      
      if (totalError) {
        throw this.handleError(totalError);
      }
      
      // Get checked-in guest count
      const { data: checkedInCount, error: checkedInError } = await this.countGuests({
        festival_id: festivalId,
        credentials_issued: true
      });
      
      if (checkedInError) {
        throw this.handleError(checkedInError);
      }
      
      // Calculate statistics
      const stats: GuestStatistics = {
        totalGuests: totalCount,
        checkedInGuests: checkedInCount,
        pendingGuests: totalCount - checkedInCount,
        checkinPercentage: totalCount > 0 ? (checkedInCount / totalCount) * 100 : 0
      };
      
      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const guestService = new GuestService(); 