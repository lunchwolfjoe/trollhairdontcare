import { ApiResponse, handleError, PaginationParams } from './api';
import { Festival } from '../types/models';
import { Database } from '../types/supabase';
import { supabase } from '../supabaseClient';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';

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
  private auth: ReturnType<typeof useSimpleAuth> | null = null;

  /**
   * Set the auth context - must be called from a component
   */
  setAuthContext(authContext: ReturnType<typeof useSimpleAuth>) {
    this.auth = authContext;
  }

  /**
   * Check if we have authentication
   */
  private isAuthenticated(): boolean {
    // If we don't have auth context at all, we're definitely not authenticated
    if (!this.auth) {
      console.error('No auth context available in festival service');
      return false;
    }
    
    // Check if we're authenticated according to the auth context
    const isAuth = this.auth.authenticated && !!this.auth.sessionToken;
    console.log('Authentication check in festival service:', {
      authenticated: this.auth.authenticated,
      hasUser: !!this.auth.user,
      hasToken: !!this.auth.sessionToken,
      userId: this.auth.user?.id || 'none',
      token: this.auth.sessionToken ? `${this.auth.sessionToken.substring(0, 10)}...` : 'none',
    });
    
    return isAuth;
  }

  /**
   * Get auth headers with the correct token
   */
  private getAuthHeaders(): Record<string, string> {
    // If we have auth context with a getAuthHeaders function, use it
    if (this.auth?.getAuthHeaders) {
      const headers = this.auth.getAuthHeaders();
      console.log('Using auth headers from context:', {
        hasApiKey: !!headers['apikey'],
        authorization: headers['Authorization']?.substring(0, 20) + '...',
      });
      
      // Ensure we have apikey for Supabase
      if (!headers['apikey']) {
        headers['apikey'] = supabase.supabaseKey;
      }
      
      return headers;
    }
    
    // Fallback to using the API key
    return {
      'apikey': supabase.supabaseKey,
      'Authorization': `Bearer ${supabase.supabaseKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get all festivals with optional filtering and pagination
   */
  async getFestivals(filter?: FestivalFilter, pagination?: PaginationParams): Promise<ApiResponse<Festival[]>> {
    try {
      console.log('Starting festivals fetch with filter:', filter);
      console.log('Auth status:', {
        hasAuth: !!this.auth,
        hasUser: !!this.auth?.user,
        hasToken: !!this.auth?.sessionToken,
        isAuthenticated: this.isAuthenticated()
      });
      
      // Get auth headers - use anon key as fallback if no session token
      const headers = this.getAuthHeaders();
      console.log('Using auth headers:', {
        hasApiKey: !!headers['apikey'],
        authorization: headers['Authorization']?.substring(0, 20) + '...',
      });
      
      // Build the query URL
      let url = `${supabase.supabaseUrl}/rest/v1/festivals?select=*`;
      
      // Apply filters to the URL
      if (filter?.status) {
        url += `&status=eq.${encodeURIComponent(filter.status)}`;
      }
      
      if (filter?.search) {
        url += `&name=ilike.${encodeURIComponent('%' + filter.search + '%')}`;
      }
      
      if (filter?.startDateFrom) {
        url += `&start_date=gte.${encodeURIComponent(filter.startDateFrom)}`;
      }
      
      if (filter?.startDateTo) {
        url += `&start_date=lte.${encodeURIComponent(filter.startDateTo)}`;
      }
      
      // Add ordering
      url += '&order=start_date.desc';
      
      // Add pagination if needed
      if (pagination?.pageSize) {
        const { page = 1, pageSize = 10 } = pagination;
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        url += `&limit=${pageSize}&offset=${start}`;
      }
      
      console.log('Executing festivals query:', url);
      
      // Make the authenticated request
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Festival query error:', errorText);
        return {
          data: null,
          error: { message: `API error: ${response.status} - ${errorText}` }
        };
      }
      
      const data = await response.json();
      console.log('Festivals fetched successfully, count:', data?.length);
      
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
      // Get auth headers - use anon key as fallback if no session token
      const headers = this.getAuthHeaders();
      
      const url = `${supabase.supabaseUrl}/rest/v1/festivals?id=eq.${id}&limit=1`;
      console.log('Fetching festival by ID:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching festival by ID:', errorText);
        return {
          data: null,
          error: { message: `API error: ${response.status} - ${errorText}` }
        };
      }
      
      const data = await response.json();
      console.log('Festival fetched successfully:', data?.[0]?.id);
      
      return {
        data: data?.[0] || null,
        error: null
      };
    } catch (error) {
      console.error('Exception in getFestivalById:', error);
      return {
        data: null,
        error: handleError(error)
      };
    }
  }

  /**
   * Create a new festival
   */
  async createFestival(festivalInput: Partial<Festival>): Promise<ApiResponse<Festival>> {
    try {
      console.log('Creating festival with input:', festivalInput);
      
      // Check authentication from our context
      if (!this.isAuthenticated()) {
        console.error('No active session found. User must be authenticated to create festivals.');
        return { 
          data: null, 
          error: { message: 'Authentication required. Please log in to create festivals.' }
        };
      }
      
      // Prepare data WITHOUT the user_id. Let DB handle it via RLS/triggers.
      const festivalData = {
        name: festivalInput.name || 'Unnamed Festival',
        start_date: festivalInput.start_date || new Date().toISOString().split('T')[0],
        end_date: festivalInput.end_date || new Date().toISOString().split('T')[0],
        description: festivalInput.description || '',
        location: festivalInput.location || '',
        status: festivalInput.status || 'planning',
      };
      
      console.log('Attempting to create festival using Supabase client');
      // Use our getAuthHeaders helper which gets the token from the auth context
      const headers = this.getAuthHeaders();
      console.log('Using auth headers:', {
        hasApiKey: !!headers['apikey'],
        authorization: headers['Authorization']?.substring(0, 20) + '...',
      });
      
      // Try using a direct API call with our auth headers
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/festivals`, {
        method: 'POST',
        headers: {
          ...headers,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(festivalData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Festival creation error:', errorText);
        return { 
          data: null, 
          error: { message: `API error: ${response.status} - ${errorText}` }
        };
      }
      
      const data = await response.json();
      console.log('Festival created successfully:', data[0]);
      return { data: data[0], error: null };
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
      // Check authentication from our context
      if (!this.isAuthenticated()) {
        console.error('No active session found. User must be authenticated to update festivals.');
        return { 
          data: null, 
          error: { message: 'Authentication required. Please log in to update festivals.' }
        };
      }
      
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
      
      // Get auth headers
      const headers = this.getAuthHeaders();
      console.log('Using auth headers for update:', {
        hasApiKey: !!headers['apikey'],
        authorization: headers['Authorization']?.substring(0, 20) + '...',
      });
      
      const url = `${supabase.supabaseUrl}/rest/v1/festivals?id=eq.${id}`;
      console.log('Updating festival:', url);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(festivalData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error updating festival:', errorText);
        return {
          data: null,
          error: { message: `API error: ${response.status} - ${errorText}` }
        };
      }
      
      const data = await response.json();
      console.log('Festival updated successfully:', data?.[0]?.id);
      
      return {
        data: data?.[0] || null,
        error: null
      };
    } catch (error) {
      console.error('Exception in updateFestival:', error);
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
      // Check authentication from our context
      if (!this.isAuthenticated()) {
        console.error('No active session found. User must be authenticated to delete festivals.');
        return { 
          data: null, 
          error: { message: 'Authentication required. Please log in to delete festivals.' }
        };
      }
      
      // Get auth headers
      const headers = this.getAuthHeaders();
      
      const url = `${supabase.supabaseUrl}/rest/v1/festivals?id=eq.${id}`;
      console.log('Deleting festival:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error deleting festival:', errorText);
        return {
          data: null,
          error: { message: `API error: ${response.status} - ${errorText}` }
        };
      }
      
      console.log('Festival deleted successfully');
      
      return {
        data: null,
        error: null
      };
    } catch (error) {
      console.error('Exception in deleteFestival:', error);
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