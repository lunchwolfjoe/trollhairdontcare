import { ApiResponse, handleError } from './api';
import { Crew } from '../types/models';
import { Database } from '../types/supabase';
import { supabase } from '../supabaseClient';

type CrewInsert = Database['public']['Tables']['crews']['Insert'];
type CrewUpdate = Database['public']['Tables']['crews']['Update'];

/**
 * Service for handling crew operations
 */
export class CrewService {
  private readonly tableName = 'crews';

  // Helper to safely parse JSON
  private parseJsonField(field: unknown): any[] | null {
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : null;
      } catch (e) { return null; }
    } else if (Array.isArray(field)) {
       return field;
    }
    return null;
  }

  /**
   * Get all crews for a festival
   */
  async getCrews(festivalId: string): Promise<ApiResponse<Crew[]>> {
    try {
      const { data, error } = await (supabase.from(this.tableName).select('*') as any)
        .eq('festival_id', festivalId)
        .order('name');

      if (error) {
        return { data: null, error: handleError(error) };
      }
      // Safely parse required_skills
      const crews = data?.map(c => ({ 
        ...c, 
        requiredSkills: this.parseJsonField(c.required_skills) || [] 
      })) || [];
      return { data: crews as Crew[], error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Get a crew by ID
   */
  async getCrewById(id: string): Promise<ApiResponse<Crew>> {
    try {
      const { data, error } = await supabase.from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        return { data: null, error: handleError(error) };
      }
      if (!data) { 
        return { data: null, error: null }; // Or a 404 error
      }
      // Safely parse required_skills
      const crew = { 
        ...data, 
        requiredSkills: this.parseJsonField(data.required_skills) || [] 
      };
      return { data: crew as Crew, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Create a new crew
   */
  async createCrew(crewInput: Partial<Crew>): Promise<ApiResponse<Crew>> {
    try {
      // Map Crew input to CrewInsert type
      const dataToSave: CrewInsert = {
        name: crewInput.name || 'Unnamed Crew', // Required field
        festival_id: crewInput.festival_id || '', // Required field
        description: crewInput.description,
        crew_type: crewInput.crew_type || 'General', // Provide default if applicable
        required_skills: crewInput.requiredSkills ? JSON.stringify(crewInput.requiredSkills) : undefined, // Map UI field to JSON
        min_headcount: crewInput.minVolunteers,
        max_headcount: crewInput.maxVolunteers,
        shift_start_time: crewInput.operatingStartTime,
        shift_end_time: crewInput.operatingEndTime,
        shift_length_hours: crewInput.shift_length_hours,
        // Ensure all required fields from CrewInsert are present
      };

      // Validate required fields
      if (!dataToSave.festival_id) {
        throw new Error('Festival ID is required to create a crew.');
      }
      if (!dataToSave.name) {
         throw new Error('Crew name is required.');
      }

      const { data, error } = await supabase.from(this.tableName)
        .insert(dataToSave)
        .select()
        .single();

      if (error) throw error; // Rethrow to be caught below

      return { data: data as Crew, error: null };

    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Update a crew
   */
  async updateCrew(id: string, crewInput: Partial<Crew>): Promise<ApiResponse<Crew>> {
    try {
      // Map Crew input to CrewUpdate type
      const dataToUpdate: CrewUpdate = {
        name: crewInput.name,
        festival_id: crewInput.festival_id,
        description: crewInput.description,
        crew_type: crewInput.crew_type,
        required_skills: crewInput.requiredSkills ? JSON.stringify(crewInput.requiredSkills) : undefined,
        min_headcount: crewInput.minVolunteers,
        max_headcount: crewInput.maxVolunteers,
        shift_start_time: crewInput.operatingStartTime,
        shift_end_time: crewInput.operatingEndTime,
        shift_length_hours: crewInput.shift_length_hours,
      };

      const { data, error } = await supabase.from(this.tableName)
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error; 

      return { data: data as Crew, error: null };

    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Delete a crew
   */
  async deleteCrew(id: string): Promise<ApiResponse<null>> {
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
}

// Create a singleton instance
export const crewService = new CrewService(); 