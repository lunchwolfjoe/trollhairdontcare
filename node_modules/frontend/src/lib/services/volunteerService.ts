import { ApiResponse, PaginationParams, applyPagination, getCurrentUserId, handleError, ApiError } from './api';
import { Volunteer } from '../types/models';
import { Database } from '../types/supabase';
import { supabase } from '../supabaseClient';

type VolunteerInsert = Database['public']['Tables']['volunteers']['Insert'];
type VolunteerUpdate = Database['public']['Tables']['volunteers']['Update'];

/**
 * Filter options for volunteers
 */
export interface VolunteerFilter {
  festival_id?: string;
  application_status?: 'pending' | 'approved' | 'rejected';
  search?: string;
}

/**
 * Service for handling volunteer operations
 */
export class VolunteerService {
  protected tableName = 'volunteers' as const;

  constructor() {
  }

  /**
   * Get all volunteers with optional filtering and pagination
   */
  async getVolunteers(
    filter: VolunteerFilter = {},
    pagination: PaginationParams = {}
  ): Promise<ApiResponse<Volunteer[]>> {
    try {
      let query = supabase.from(this.tableName)
        .select(`
          id,
          profile_id,
          festival_id,
          application_status,
          notes,
          availability_start,
          availability_end,
          skills,
          availability,
          created_at,
          updated_at,
          profiles: profile_id (*)
        `) as any;

      // Apply filters
      if (filter.festival_id) {
        query = query.eq('festival_id', filter.festival_id);
      }

      if (filter.application_status) {
        query = query.eq('application_status', filter.application_status);
      }

      if (filter.search) {
        // Search in profiles.full_name and profiles.email
        query = query.or(`profiles.full_name.ilike.%${filter.search}%,profiles.email.ilike.%${filter.search}%`);
      }

      // Manually apply pagination
      const { page = 1, pageSize = 10 } = pagination;
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);

      const { data, error, count } = await query.order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: handleError(error) };
      }
      // Explicit cast is likely still needed due to potential structure differences
      return { data: (data as Volunteer[]) || [], error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Count volunteers matching the filter criteria
   */
  async countVolunteers(filter: VolunteerFilter = {}): Promise<ApiResponse<number>> {
    let query = supabase.from('volunteers').select('id', { count: 'exact', head: true }) as any;

    // Apply filters
    if (filter.festival_id) {
      query = query.eq('festival_id', filter.festival_id);
    }

    if (filter.application_status) {
      query = query.eq('application_status', filter.application_status);
    }

    if (filter.search) {
      // Search in profiles.full_name and profiles.email
      query = query.or(`profiles.full_name.ilike.%${filter.search}%,profiles.email.ilike.%${filter.search}%`);
    }

    const { count, error } = await query;

    if (error) {
      return { data: null, error: handleError(error) };
    }

    return { data: count || 0, error: null };
  }

  /**
   * Get a volunteer by ID
   */
  async getVolunteerById(id: string): Promise<ApiResponse<Volunteer>> {
    try {
      const { data, error } = await supabase.from(this.tableName)
        .select(`
          id,
          profile_id,
          festival_id,
          application_status,
          notes,
          availability_start,
          availability_end,
          skills,
          availability,
          created_at,
          updated_at,
          profiles: profile_id (*),
          crew: crew_id (*)
        `)
        .eq('id', id)
        .single();
      if (error) {
        return { data: null, error: handleError(error) };
      }
      // Cast should be safer now, but explicit check is better
      if (data && typeof data === 'object') {
        return { data: data as Volunteer, error: null };
      } else {
        return { data: null, error: null }; // Or return a 404 error
      }
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Get the current user's volunteer record for a festival
   */
  async getCurrentVolunteer(festivalId: string): Promise<ApiResponse<Volunteer>> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return {
        data: null,
        error: {
          status: 401,
          message: 'Not authenticated'
        }
      };
    }
    
    return this.executeQuery<Volunteer>(
      supabase
        .from('volunteers')
        .select('*')
        .eq('profile_id', userId)
        .eq('festival_id', festivalId)
        .single()
    );
  }

  /**
   * Create a volunteer application
   */
  async apply(volunteerInput: Partial<Volunteer>): Promise<ApiResponse<Volunteer>> {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { data: null, error: this.handleError({ status: 401, message: 'Not authenticated' }) };
    }

    try {
      // Map Volunteer input to VolunteerInsert type
      const dataToSave: VolunteerInsert = {
        profile_id: userId,
        festival_id: volunteerInput.festival_id || '', // Ensure festival_id is provided
        status: 'pending', // Default status for new applications
        skills: volunteerInput.skills || [],
        availability: volunteerInput.availability || {},
        // Map other relevant fields from volunteerInput if needed
      };

      // Validate required fields
      if (!dataToSave.festival_id) {
        throw new Error('Festival ID is required for volunteer application.');
      }

      const { data, error } = await supabase.from(this.tableName)
        .insert(dataToSave)
        .select(/* explicit fields matching Volunteer */)
        .single();

      if (error) throw error;

      // Ensure data matches Volunteer before casting
      return { data: data as Volunteer, error: null };

    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Update a volunteer record
   */
  async updateVolunteer(id: string, volunteerData: Partial<Volunteer>): Promise<ApiResponse<Volunteer>> {
    // Remove immutable fields
    const { id: _, created_at, updated_at, profile_id, festival_id, ...updateData } = volunteerData as any;
    
    return this.executeQuery<Volunteer>(
      supabase
        .from('volunteers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
    );
  }

  /**
   * Update application status (used by coordinators)
   */
  async updateApplicationStatus(
    id: string, 
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ): Promise<ApiResponse<Volunteer>> {
    return this.updateVolunteer(id, { 
      application_status: status,
      notes: notes
    });
  }

  /**
   * Count volunteers by status for a festival
   */
  async countByStatus(festivalId: string): Promise<ApiResponse<{ status: string; count: number }[]>> {
    const query = `
      SELECT 
        application_status as status, 
        COUNT(*) as count
      FROM 
        volunteers
      WHERE 
        festival_id = $1
      GROUP BY 
        application_status
    `;
    
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_query: query,
      params: [festivalId]
    });
    
    if (error) {
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to count volunteers by status',
          details: error
        }
      };
    }
    
    return {
      data,
      error: null
    };
  }

  /**
   * Delete a volunteer
   */
  async deleteVolunteer(id: string): Promise<ApiResponse<null>> {
    return this.executeQuery<null>(
      supabase
        .from('volunteers')
        .delete()
        .eq('id', id)
    );
  }

  async updateVolunteerStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<ApiResponse<Volunteer>> {
    try {
      const updateData: VolunteerUpdate = { status };
      const { data, error } = await supabase.from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select(/* explicit fields matching Volunteer */)
        .single();
      if (error) throw error;
      // Ensure data matches Volunteer before casting
      return { data: data as Volunteer, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  async updateVolunteerSkills(id: string, skills: string[]): Promise<ApiResponse<Volunteer>> {
    try {
      const updateData: VolunteerUpdate = { skills };
      const { data, error } = await supabase.from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select(/* explicit fields matching Volunteer */)
        .single();
      if (error) throw error;
      // Ensure data matches Volunteer before casting
      return { data: data as Volunteer, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  async getVolunteerStats(festivalId: string): Promise<ApiResponse<any[]>> {
    try {
      const rpcParams = { _festival_id: festivalId }; 
      const { data, error } = await supabase.rpc('get_volunteer_stats_by_festival', rpcParams);

      if (error) {
        return { data: null, error: handleError(error) };
      }
      return { data: (Array.isArray(data) ? data : []), error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  async getPotentialAssignments(volunteerId: string): Promise<ApiResponse<any>> {
    try {
      // Replace executeQuery
      console.warn("getPotentialAssignments needs implementation without executeQuery");
      // Example: fetch shifts or tasks suitable for the volunteer
      // const { data, error } = await supabase.from('shifts')... or supabase.rpc(...)
      return { data: [], error: null }; // Placeholder
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }
}

// Create a singleton instance
export const volunteerService = new VolunteerService(); 