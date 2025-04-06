import { ApiResponse, BaseService, PaginationParams, applyPagination, handleError } from './api';
import { Festival } from '../types/models';
import { PostgrestQueryBuilder } from '@supabase/postgrest-js';
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

/**
 * Service for handling festival operations
 */
export class FestivalService extends BaseService {
  constructor() {
    super('festivals');
  }

  /**
   * Get all festivals with optional filtering and pagination
   */
  async getFestivals(
    filter: FestivalFilter = {},
    pagination: PaginationParams = {}
  ): Promise<ApiResponse<Festival[]>> {
    try {
      console.log('Starting festivals fetch with filter:', filter);
      
      // Use supabase directly instead of going through the query builder
      let query = supabase.from('festivals').select('*');
      
      // Apply filters
      if (filter.status) {
        query = query.eq('status', filter.status);
      }

      if (filter.search) {
        query = query.ilike('name', `%${filter.search}%`);
      }

      if (filter.startDateFrom) {
        query = query.gte('start_date', filter.startDateFrom);
      }

      if (filter.startDateTo) {
        query = query.lte('start_date', filter.startDateTo);
      }

      // Apply ordering
      query = query.order('start_date', { ascending: false });

      // Apply pagination
      if (pagination.pageSize) {
        const { page = 1, pageSize = 10 } = pagination;
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        query = query.range(start, end);
      }

      console.log('Executing festivals query...');
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) {
        return {
          data: null,
          error: handleError(error)
        };
      }
      
      return {
        data,
        error: null
      };
    } catch (error) {
      console.error('Error in getFestivals:', error);
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to fetch festivals',
          details: error
        }
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
      const { data, error } = await supabase
        .from('festivals')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        return {
          data: null,
          error: handleError(error)
        };
      }
      
      return {
        data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error)
      };
    }
  }

  /**
   * Create a new festival
   */
  async createFestival(festivalData: Partial<Festival>): Promise<ApiResponse<Festival>> {
    try {
      const { data, error } = await supabase
        .from('festivals')
        .insert(festivalData)
        .select('*')
        .single();
      
      if (error) {
        return {
          data: null,
          error: handleError(error)
        };
      }
      
      return {
        data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error)
      };
    }
  }

  /**
   * Update a festival
   */
  async updateFestival(id: string, festivalData: Partial<Festival>): Promise<ApiResponse<Festival>> {
    try {
      // Remove immutable fields
      const { id: _, created_at, updated_at, ...updateData } = festivalData as any;
      
      const { data, error } = await supabase
        .from('festivals')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        return {
          data: null,
          error: handleError(error)
        };
      }
      
      return {
        data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error)
      };
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
      const { error } = await supabase
        .from('festivals')
        .delete()
        .eq('id', id);
      
      if (error) {
        return {
          data: null,
          error: handleError(error)
        };
      }
      
      return {
        data: null,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error)
      };
    }
  }

  /**
   * Get festival statistics
   * Returns count of volunteers, crews, shifts, etc.
   */
  async getFestivalStats(id: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .rpc('get_festival_stats', { festival_id: id });
      
      if (error) {
        return {
          data: null,
          error: handleError(error)
        };
      }
      
      return {
        data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error)
      };
    }
  }
}

// Create a singleton instance
export const festivalService = new FestivalService(); 