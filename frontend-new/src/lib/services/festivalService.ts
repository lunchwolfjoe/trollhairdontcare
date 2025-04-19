import { ApiResponse, handleError, PaginationParams } from './api';
import { Festival } from '../types/models';
import { Database } from '../types/supabase';
import { supabase } from '../supabaseClient';

/**
 * Filter options for festivals
 */
export interface FestivalFilter {
  status?: 'planning' | 'active' | 'completed' | 'cancelled';
  search?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

type FestivalInsert = Database['public']['Tables']['festivals']['Insert'];
type FestivalUpdate = Database['public']['Tables']['festivals']['Update'];

/**
 * Service for handling festival operations
 */
export class FestivalService {
  private readonly tableName = 'festivals';

  /**
   * Get all festivals with optional filtering and pagination
   */
  async getFestivals(filter?: FestivalFilter, pagination?: PaginationParams): Promise<ApiResponse<Festival[]>> {
    try {
      console.log('Starting festivals fetch with filter:', filter);
      
      // Use supabase directly instead of going through the query builder
      let query = supabase.from('festivals').select('*') as any;
      
      // Apply filters
      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      if (filter?.search) {
        query = query.ilike('name', `%${filter.search}%`);
      }

      if (filter?.startDateFrom) {
        query = query.gte('start_date', filter.startDateFrom);
      }

      if (filter?.startDateTo) {
        query = query.lte('start_date', filter.startDateTo);
      }

      // Manually apply pagination if needed
      if (pagination?.pageSize) {
        const { page = 1, pageSize = 10 } = pagination;
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        query = query.range(start, end);
      }

      console.log('Executing festivals query...');
      
      // Execute the query
      const { data, error } = await query.order('start_date', { ascending: false });
      
      if (error) {
        console.error('Festival query error:', error);
        return {
          data: null,
          error: handleError(error)
        };
      }
      
      return {
        data: data || [],
        error: null
      };
    } catch (error) {
      console.error('Error in getFestivals:', error);
      return {
        data: [],
        error: handleError(error)
      };
    }
  }

  /**
   * Get active festivals (status = 'active')
   */
  async getActiveFestivals(pagination: PaginationParams = {}): Promise<ApiResponse<Festival[]>> {
    return this.getFestivals({ status: 'active' }, pagination);
  }

  /**
   * Get upcoming festivals (start_date in the future)
   */
  async getUpcomingFestivals(pagination: PaginationParams = {}): Promise<ApiResponse<Festival[]>> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return this.getFestivals({ startDateFrom: today }, pagination);
  }

  /**
   * Get a festival by ID
   */
  async getFestivalById(id: string): Promise<ApiResponse<Festival>> {
    try {
      const { data, error } = await supabase.from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        return { data: null, error: handleError(error) };
      }
      return { data: data as Festival | null, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Create a new festival
   */
  async createFestival(festivalInput: Partial<Festival>): Promise<ApiResponse<Festival>> {
    try {
      console.log('Creating festival with input (will NOT send user_id explicitly):', festivalInput);
      
      // Prepare data WITHOUT the user_id. Let DB handle it via RLS/triggers.
      const festivalData = {
        name: festivalInput.name || 'Unnamed Festival',
        start_date: festivalInput.start_date || new Date().toISOString().split('T')[0],
        end_date: festivalInput.end_date || new Date().toISOString().split('T')[0],
        description: festivalInput.description || '',
        location: festivalInput.location || '',
        status: festivalInput.status || 'planning',
      };
      
      // First try to get the user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No active session found. User must be authenticated to create festivals.');
        return { 
          data: null, 
          error: { message: 'Authentication required. Please log in to create festivals.' }
        };
      }
      
      // Try Supabase client first - this handles authentication automatically
      try {
        console.log('Attempting to create festival using Supabase client');
        const { data, error } = await supabase
          .from('festivals')
          .insert([festivalData])
          .select()
          .single();
        
        if (error) {
          console.error('Supabase client error:', error);
          throw error;
        }
        
        console.log('Festival created successfully via Supabase client:', data);
        return { data, error: null };
      } catch (supabaseError) {
        console.error('Supabase client approach failed, trying direct API with auth token:', supabaseError);
        
        // Fall back to direct API call with proper authentication
        const response = await fetch(`${supabase.supabaseUrl}/rest/v1/festivals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${session.access_token}`, // Use session token for auth
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(festivalData)
        });
        
        console.log('Direct API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Direct API error:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            console.error('Parsed API error:', errorJson);
            throw new Error(errorJson.message || `API error: ${response.status}`);
          } catch(e) {
            throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
          }
        }
        
        const data = await response.json();
        console.log('Festival created via direct API:', data);
        return { data: data[0], error: null };
      }
    } catch (error) {
      console.error('Festival creation exception:', error);
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Update a festival
   */
  async updateFestival(id: string, festivalInput: Partial<Festival>): Promise<ApiResponse<Festival>> {
    try {
      const festivalData: FestivalUpdate = {
        name: festivalInput.name,
        start_date: festivalInput.start_date,
        end_date: festivalInput.end_date,
        description: festivalInput.description ?? undefined,
        location: festivalInput.location,
        status: festivalInput.status,
      };
      
      // Filter out undefined values
      Object.keys(festivalData).forEach(key => {
        if (festivalData[key] === undefined) {
          delete festivalData[key];
        }
      });

      const { data, error } = await supabase
        .from(this.tableName)
        .update(festivalData)
        .eq('id', id)
        .select()
        .single();
      if (error) {
        return { data: null, error: handleError(error) };
      }
      return { data: data as Festival | null, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Update festival status
   */
  async updateFestivalStatus(
    id: string, 
    status: 'planning' | 'active' | 'completed' | 'cancelled'
  ): Promise<ApiResponse<Festival>> {
    return this.updateFestival(id, { status });
  }

  /**
   * Delete a festival (use with caution - consider using status update instead)
   */
  async deleteFestival(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.from(this.tableName).delete().eq('id', id);
      if (error) {
        return { data: null, error: handleError(error) };
      }
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Get festival statistics
   * Returns count of volunteers, crews, shifts, etc.
   */
  async getFestivalStats(id: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.rpc('get_festival_stats', { festival_id: id });
      if (error) {
        return { data: null, error: handleError(error) };
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }
}

// Create a singleton instance
export const festivalService = new FestivalService(); 