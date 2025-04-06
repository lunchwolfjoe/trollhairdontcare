import { ApiResponse, BaseService, PaginationParams, applyPagination, getCurrentUserId } from './api';
import { Volunteer } from '../types/models';
import { supabase } from '../supabaseClient';

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
export class VolunteerService extends BaseService {
  constructor() {
    super('volunteers');
  }

  /**
   * Get all volunteers with optional filtering and pagination
   */
  async getVolunteers(
    filter: VolunteerFilter = {},
    pagination: PaginationParams = {}
  ): Promise<ApiResponse<Volunteer[]>> {
    let query = this.query()
      .select(`
        *,
        profiles:profile_id (
          id, 
          full_name, 
          avatar_url,
          email
        )
      `);

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

    // Apply pagination
    query = applyPagination(query, pagination);

    return this.executeQuery<Volunteer[]>(query);
  }

  /**
   * Count volunteers matching the filter criteria
   */
  async countVolunteers(filter: VolunteerFilter = {}): Promise<ApiResponse<number>> {
    let query = this.query()
      .select('id', { count: 'exact', head: true });

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
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to count volunteers',
          details: error
        }
      };
    }

    return {
      data: count || 0,
      error: null
    };
  }

  /**
   * Get a volunteer by ID
   */
  async getVolunteerById(id: string): Promise<ApiResponse<Volunteer>> {
    return this.executeQuery<Volunteer>(
      this.query()
        .select(`
          *,
          profiles:profile_id (
            id, 
            full_name, 
            avatar_url,
            email
          )
        `)
        .eq('id', id)
        .single()
    );
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
      this.query()
        .select(`
          *,
          profiles:profile_id (
            id, 
            full_name, 
            avatar_url,
            email
          )
        `)
        .eq('profile_id', userId)
        .eq('festival_id', festivalId)
        .single()
    );
  }

  /**
   * Create a volunteer application
   */
  async createVolunteer(volunteerData: Partial<Volunteer>): Promise<ApiResponse<Volunteer>> {
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
    
    // Ensure profile_id is set to current user
    const data = {
      ...volunteerData,
      profile_id: userId,
      application_status: volunteerData.application_status || 'pending'
    };
    
    return this.executeQuery<Volunteer>(
      this.query().insert(data).select().single()
    );
  }

  /**
   * Update a volunteer record
   */
  async updateVolunteer(id: string, volunteerData: Partial<Volunteer>): Promise<ApiResponse<Volunteer>> {
    // Remove immutable fields
    const { id: _, created_at, updated_at, profile_id, festival_id, ...updateData } = volunteerData as any;
    
    return this.executeQuery<Volunteer>(
      this.query()
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
}

// Create a singleton instance
export const volunteerService = new VolunteerService(); 