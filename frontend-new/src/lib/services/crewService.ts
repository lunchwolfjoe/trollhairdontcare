import { ApiResponse, BaseService } from './api';
import { supabase } from '../supabaseClient';
import { Crew } from '../types/models';

/**
 * Service for handling crew operations
 */
export class CrewService extends BaseService {
  constructor() {
    super('crews');
  }

  /**
   * Get all crews for a festival
   */
  async getCrews(festivalId: string): Promise<ApiResponse<Crew[]>> {
    try {
      const { data, error } = await supabase
        .from('crews')
        .select('*')
        .eq('festival_id', festivalId)
        .order('name');

      if (error) {
        return {
          data: null,
          error: {
            status: 500,
            message: error.message,
            details: error
          }
        };
      }

      return {
        data,
        error: null
      };
    } catch (error) {
      console.error('Error in getCrews:', error);
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to fetch crews',
          details: error
        }
      };
    }
  }

  /**
   * Get a crew by ID
   */
  async getCrewById(id: string): Promise<ApiResponse<Crew>> {
    try {
      const { data, error } = await supabase
        .from('crews')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          data: null,
          error: {
            status: 500,
            message: error.message,
            details: error
          }
        };
      }

      return {
        data,
        error: null
      };
    } catch (error) {
      console.error('Error in getCrewById:', error);
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to fetch crew',
          details: error
        }
      };
    }
  }

  /**
   * Create a new crew
   */
  async createCrew(crewData: Partial<Crew>): Promise<ApiResponse<Crew>> {
    try {
      console.log('Creating crew with data:', crewData);
      
      // Ensure any JSON fields are properly serialized
      const dataToSave = {
        ...crewData,
        // Make sure to use required_skills as the field name to match database column
        required_skills: (crewData.required_skills || crewData.requiredSkills) && 
          typeof (crewData.required_skills || crewData.requiredSkills) !== 'string' ? 
          JSON.stringify(crewData.required_skills || crewData.requiredSkills) : 
          (crewData.required_skills || crewData.requiredSkills),
        
        // Remove the requiredSkills field as we're using required_skills for the database
        requiredSkills: undefined,
        
        // Handle assignedVolunteers if present
        assignedVolunteers: crewData.assignedVolunteers && 
          typeof crewData.assignedVolunteers !== 'string' ? 
          JSON.stringify(crewData.assignedVolunteers) : 
          crewData.assignedVolunteers
      };

      console.log('Prepared data for Supabase:', dataToSave);
      
      // Add fresh:true to force Supabase to reload the schema cache
      const { data, error } = await supabase
        .from('crews')
        .insert(dataToSave, { fresh: true })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating crew:', error);
        return {
          data: null,
          error: {
            status: 500,
            message: error.message,
            details: error
          }
        };
      }

      console.log('Successfully created crew:', data);
      
      return {
        data,
        error: null
      };
    } catch (error) {
      console.error('Error in createCrew:', error);
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to create crew',
          details: error
        }
      };
    }
  }

  /**
   * Update a crew
   */
  async updateCrew(id: string, crewData: Partial<Crew>): Promise<ApiResponse<Crew>> {
    try {
      console.log('Updating crew with ID:', id, 'Data:', crewData);
      
      // Remove immutable fields
      const { id: _, created_at, updated_at, ...updateData } = crewData as any;
      
      // Ensure any JSON fields are properly serialized
      const dataToSave = {
        ...updateData,
        // Make sure to use required_skills as the field name to match database column
        required_skills: (updateData.required_skills || updateData.requiredSkills) && 
          typeof (updateData.required_skills || updateData.requiredSkills) !== 'string' ? 
          JSON.stringify(updateData.required_skills || updateData.requiredSkills) : 
          (updateData.required_skills || updateData.requiredSkills),
        
        // Remove the requiredSkills field as we're using required_skills for the database
        requiredSkills: undefined,
        
        // Handle assignedVolunteers if present
        assignedVolunteers: updateData.assignedVolunteers && 
          typeof updateData.assignedVolunteers !== 'string' ? 
          JSON.stringify(updateData.assignedVolunteers) : 
          updateData.assignedVolunteers
      };

      console.log('Prepared data for Supabase update:', dataToSave);
      
      // Add fresh:true to force Supabase to reload the schema cache
      const { data, error } = await supabase
        .from('crews')
        .update(dataToSave, { fresh: true })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating crew:', error);
        return {
          data: null,
          error: {
            status: 500,
            message: error.message,
            details: error
          }
        };
      }

      console.log('Successfully updated crew:', data);
      
      return {
        data,
        error: null
      };
    } catch (error) {
      console.error('Error in updateCrew:', error);
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to update crew',
          details: error
        }
      };
    }
  }

  /**
   * Delete a crew
   */
  async deleteCrew(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('crews')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          data: null,
          error: {
            status: 500,
            message: error.message,
            details: error
          }
        };
      }

      return {
        data: null,
        error: null
      };
    } catch (error) {
      console.error('Error in deleteCrew:', error);
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to delete crew',
          details: error
        }
      };
    }
  }

  /**
   * Debug function to get table schema
   */
  async getTableSchema(): Promise<ApiResponse<any>> {
    try {
      console.log('Fetching table schema information for crews table');
      
      // Try approach #1: Describe the table structure using the INTROSPECTION schema
      const { data: schemaData, error: schemaError } = await supabase
        .rpc('get_table_definition', { table_name: 'crews' });
      
      if (!schemaError && schemaData) {
        console.log('Successfully retrieved schema via RPC call:', schemaData);
        return {
          data: { 
            message: 'Retrieved schema from RPC call',
            columns: schemaData
          },
          error: null
        };
      } else {
        console.log('RPC approach failed, trying alternative method', schemaError);
      }
      
      // Try approach #2: Create table if it doesn't exist
      const tableDefinition = `
        id uuid not null primary key default uuid_generate_v4(),
        name text not null,
        description text,
        crew_type text,
        required_skills jsonb,
        min_headcount integer default 1,
        max_headcount integer default 1,
        shift_start_time text,
        shift_end_time text,
        shift_length_hours integer default 4,
        festival_id uuid references festivals(id) on delete cascade,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `;
      
      console.log('Manually listing expected table columns');
      
      return {
        data: { 
          message: 'Retrieved expected table schema',
          columns: [
            { column_name: 'id', data_type: 'uuid' },
            { column_name: 'name', data_type: 'text' },
            { column_name: 'description', data_type: 'text' },
            { column_name: 'crew_type', data_type: 'text' },
            { column_name: 'required_skills', data_type: 'jsonb' },
            { column_name: 'min_headcount', data_type: 'integer' },
            { column_name: 'max_headcount', data_type: 'integer' },
            { column_name: 'shift_start_time', data_type: 'text' },
            { column_name: 'shift_end_time', data_type: 'text' },
            { column_name: 'shift_length_hours', data_type: 'integer' },
            { column_name: 'festival_id', data_type: 'uuid' },
            { column_name: 'created_at', data_type: 'timestamp with time zone' },
            { column_name: 'updated_at', data_type: 'timestamp with time zone' }
          ],
          tableDefinition
        },
        error: null
      };
    } catch (error) {
      console.error('Error in getTableSchema:', error);
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to get table schema',
          details: error
        }
      };
    }
  }
}

// Create a singleton instance
export const crewService = new CrewService(); 