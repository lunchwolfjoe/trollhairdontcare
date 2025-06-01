import { ApiResponse, PaginationParams, applyPagination, getCurrentUserId, handleError } from './api';
import { Asset, AssetCategory, AssetLog, AssetMaintenance, Location, Volunteer } from '../types/models';
import { supabase } from '../supabaseClient';
import { Database } from '../types/supabase';

// Define specific types for Supabase operations
type AssetInsert = Database['public']['Tables']['assets']['Insert'];
type AssetUpdate = Database['public']['Tables']['assets']['Update'];
type AssetCategoryInsert = Database['public']['Tables']['asset_categories']['Insert'];
type AssetMaintenanceInsert = Database['public']['Tables']['asset_maintenance']['Insert'];
type AssetLogInsert = Database['public']['Tables']['asset_logs']['Insert'];

/**
 * Filter options for assets
 */
export interface AssetFilter {
  festival_id?: string;
  category_id?: string;
  status?: 'available' | 'in-use' | 'maintenance' | 'lost' | 'retired';
  current_location_id?: string;
  assigned_volunteer_id?: string;
  search?: string;
}

// Remove BaseService inheritance
export class AssetService {
  private readonly tableName = 'assets'; // Make tableName private

  constructor() {
  }

  /**
   * Get all assets with optional filtering and pagination
   */
  async getAssets(
    filter: AssetFilter = {},
    pagination: PaginationParams = {}
  ): Promise<ApiResponse<Asset[]>> {
    try {
      console.log('Getting assets with filter:', filter);
      
      // Select related data explicitly
      let query = supabase.from(this.tableName).select(`
        *,
        category: category_id (*),
        location: current_location_id (*), 
        volunteer: assigned_volunteer_id (*, profiles: profile_id(*))
      `) as any; // Cast to any

      // Apply filters
      if (filter.festival_id) {
        query = query.eq('festival_id', filter.festival_id);
      }

      if (filter.category_id) {
        query = query.eq('category_id', filter.category_id);
      }

      if (filter.status) {
        query = query.eq('status', filter.status);
      }

      if (filter.current_location_id) {
        query = query.eq('current_location_id', filter.current_location_id);
      }

      if (filter.assigned_volunteer_id) {
        query = query.eq('assigned_volunteer_id', filter.assigned_volunteer_id);
      }

      if (filter.search) {
        query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%,serial_number.ilike.%${filter.search}%`);
      }

      // Manually apply pagination if applyPagination helper causes issues with 'any'
      const { page = 1, pageSize = 10 } = pagination;
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching assets:', error);
        return { data: null, error: handleError(error) };
      }
      
      // If no data or empty array, return it
      if (!data || data.length === 0) {
        return { data: [], error: null };
      }
      
      // Get unique category IDs from all assets
      const categoryIds = [...new Set(data.map(asset => asset.category_id).filter(Boolean))];
      
      // Fetch all categories in a single query if there are any
      let categoriesMap: Record<string, any> = {};
      if (categoryIds.length > 0) {
        const { data: categoriesData } = await supabase
          .from('asset_categories')
          .select('*')
          .in('id', categoryIds as string[]);
          
        if (categoriesData) {
          categoriesMap = categoriesData.reduce((map, category) => {
            map[category.id] = category;
            return map;
          }, {} as Record<string, any>);
        }
      }
      
      // Enrich assets with their categories
      const enrichedAssets = data.map(asset => {
        if (asset.category_id && categoriesMap[asset.category_id]) {
          return {
            ...asset,
            category: categoriesMap[asset.category_id]
          };
        }
        return asset;
      });
      
      return {
        data: enrichedAssets as Asset[],
        error: null
      };
    } catch (err) {
      console.error('Exception in getAssets:', err);
      return { data: null, error: handleError(err) };
    }
  }

  /**
   * Get an asset by ID
   */
  async getAssetById(id: string): Promise<ApiResponse<Asset>> {
    try {
      console.log(`Getting asset by ID: ${id}`);
      
      // Select related data explicitly here too
      const { data, error } = await supabase.from(this.tableName)
        .select(`
          *,
          category: category_id (*),
          location: current_location_id (*),
          volunteer: assigned_volunteer_id (*, profiles: profile_id(*))
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching asset with ID ${id}:`, error);
        return { data: null, error: handleError(error) };
      }
      
      // No need for separate fetches if select includes relations
      return {
        data: data as Asset | null,
        error: null
      };
    } catch (err) {
      console.error(`Exception in getAssetById for ID ${id}:`, err);
      return { data: null, error: handleError(err) };
    }
  }

  /**
   * Create an asset data only (using Supabase Insert type)
   */
  private async createAssetData(assetData: AssetInsert): Promise<ApiResponse<{id: string}>> {
    try {
      // Data should already conform to AssetInsert type
      const sanitizedData = this.sanitizeUuidFields(assetData);
      console.log('Raw create data for INSERT:', sanitizedData);
      
      const { data, error } = await supabase.from(this.tableName)
        .insert(sanitizedData)
        .select('id')
        .single();
      
      if (error) {
        console.error(`Error in raw create for asset:`, error);
        return { data: null, error: handleError(error) };
      }
      
      return {
        data,
        error: null
      };
    } catch (err) {
      console.error(`Exception in createAssetData:`, err);
      return { data: null, error: handleError(err) };
    }
  }

  /**
   * Create a new asset (using Asset model type as input)
   */
  async createAsset(assetInput: Partial<Asset>): Promise<ApiResponse<Asset>> {
    try {
      console.log('Creating new asset:', assetInput);
      
      // Map Asset input to AssetInsert type for DB
      const assetDataForDb: AssetInsert = {
        // Map fields carefully, ensure required fields are present
        name: assetInput.name || 'Unnamed Asset', // Ensure name is provided
        festival_id: assetInput.festival_id || '', // Ensure festival_id is provided
        description: assetInput.description,
        category_id: assetInput.category_id,
        status: assetInput.status,
        location: assetInput.location_type, // Assuming location_type maps to location table column
        quantity: assetInput.value, // Assuming value maps to quantity table column
        // Add other fields from AssetInsert as needed, mapping from assetInput
      };

      const { data: newAssetId, error: createError } = await this.createAssetData(assetDataForDb);
      
      if (createError || !newAssetId) {
        return {
          data: null,
          error: createError || handleError({ 
            status: 500, 
            message: 'Failed to create asset - no ID returned'
          })
        };
      }
      
      return this.getAssetById(newAssetId.id);
    } catch (err) {
      console.error(`Exception in createAsset:`, err);
      return { data: null, error: handleError(err) };
    }
  }

  /**
   * Update asset data only (using Supabase Update type)
   */
  private async updateAssetData(id: string, assetData: AssetUpdate): Promise<ApiResponse<null>> {
    try {
      // Data should already conform to AssetUpdate type
      const sanitizedData = this.sanitizeUuidFields(assetData);
      console.log('Raw update data for PATCH:', sanitizedData);
      
      const { data, error } = await supabase.from(this.tableName)
        .update(sanitizedData)
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) {
        console.error(`Error in raw update for asset ${id}:`, error);
        return { data: null, error: handleError(error) };
      }
      
      return {
        data: null,
        error: null
      };
    } catch (err) {
      console.error(`Exception in updateAssetData for ID ${id}:`, err);
      return { data: null, error: handleError(err) };
    }
  }

  /**
   * Update an asset (using Asset model type as input)
   */
  async updateAsset(id: string, assetInput: Partial<Asset>): Promise<ApiResponse<Asset>> {
    try {
      console.log(`Updating asset with ID ${id}:`, assetInput);
      
      // Map Asset input to AssetUpdate type for DB
      const assetDataForDb: AssetUpdate = {
        name: assetInput.name,
        festival_id: assetInput.festival_id,
        description: assetInput.description,
        category_id: assetInput.category_id,
        status: assetInput.status,
        location: assetInput.location_type,
        quantity: assetInput.value,
        // Add other fields from AssetUpdate as needed, mapping from assetInput
      };

      // Remove fields not in AssetUpdate schema if necessary
      delete (assetDataForDb as any).assigned_volunteer_id;
      delete (assetDataForDb as any).current_location_id;
      
      const { error: updateError } = await this.updateAssetData(id, assetDataForDb);
      
      if (updateError) {
        return { data: null, error: updateError };
      }
      
      // Fetch and return the updated asset (casting to Asset type)
      const { data, error } = await supabase.from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching updated asset ${id}:`, error);
        return { data: null, error: handleError(error) };
      }

      // Add category fetching logic if needed, similar to getAssetById
      
      return {
        data: data as Asset | null,
        error: null
      };
    } catch (err) {
      console.error(`Exception in updateAsset for ID ${id}:`, err);
      return { data: null, error: handleError(err) };
    }
  }

  /**
   * Helper to sanitize UUID fields
   * Converts empty strings to null and ensures UUIDs are valid
   */
  private sanitizeUuidFields(data: any): any {
    const uuidFields = ['festival_id', 'category_id', 'current_location_id', 'assigned_volunteer_id'];
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    const sanitized = { ...data };
    
    for (const field of uuidFields) {
      // If the field exists in the data
      if (field in sanitized) {
        const value = sanitized[field];
        
        // Convert empty strings to null
        if (value === '') {
          sanitized[field] = null;
        }
        // Ensure the UUID is valid if it's not null
        else if (value !== null && typeof value === 'string' && !uuidPattern.test(value)) {
          console.warn(`Invalid UUID format for ${field}: "${value}". Converting to null.`);
          sanitized[field] = null;
        }
      }
    }
    
    return sanitized;
  }

  /**
   * Delete an asset
   */
  async deleteAsset(id: string): Promise<ApiResponse<null>> {
    try {
      console.log(`Deleting asset with ID ${id}`);
      
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting asset ${id}:`, error);
        return { data: null, error: handleError(error) };
      }
      
      return { data: null, error: null };
    } catch (err) {
      console.error(`Exception in deleteAsset for ID ${id}:`, err);
      return { data: null, error: handleError(err) };
    }
  }

  /**
   * Check out an asset to a volunteer
   */
  async checkoutAsset(
    assetId: string,
    volunteerId: string,
    locationId?: string,
    notes?: string
  ): Promise<ApiResponse<Asset>> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { data: null, error: handleError({ status: 401, message: 'Not authenticated' }) };
    }
    
    try {
      // Update Asset status using the correct type
      const assetUpdateData: AssetUpdate = {
        status: 'in-use',
        // assigned_volunteer_id: volunteerId, // Remove if not in AssetUpdate
        // current_location_id: locationId || null 
      };
      const { data: asset, error: assetError } = await this.updateAsset(assetId, assetUpdateData);
      
      if (assetError) throw assetError;
      if (!asset) throw new Error('Failed to update asset during checkout');

      // Create a log entry using the correct type
      const logData: AssetLogInsert = {
        asset_id: assetId,
        user_id: userId, // Use the logged-in user ID
        action: 'check_out',
        details: { volunteerId, locationId, notes } // Store relevant details in JSON
      };
      const { error: logError } = await supabase.from('asset_logs').insert(logData);
      
      if (logError) throw logError;
      
      return { data: asset, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Check in an asset from a volunteer
   */
  async checkinAsset(
    assetId: string,
    locationId: string,
    notes?: string
  ): Promise<ApiResponse<Asset>> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { data: null, error: handleError({ status: 401, message: 'Not authenticated' }) };
    }
    
    try {
      const { data: currentAsset, error: getError } = await this.getAssetById(assetId);
      if (getError) throw getError;
      if (!currentAsset) throw new Error('Asset not found');
      
      // Update Asset status
      const assetUpdateData: AssetUpdate = {
        status: 'available',
        // assigned_volunteer_id: null,
        // current_location_id: locationId
      };
      const { data: asset, error: assetError } = await this.updateAsset(assetId, assetUpdateData);
      
      if (assetError) throw assetError;
      if (!asset) throw new Error('Failed to update asset during checkin');

      // Create a log entry
      const logData: AssetLogInsert = {
        asset_id: assetId,
        user_id: userId,
        action: 'check_in',
        details: { previousVolunteerId: currentAsset.assigned_volunteer_id, locationId, notes }
      };
      const { error: logError } = await supabase.from('asset_logs').insert(logData);
      
      if (logError) throw logError;
      
      return { data: asset, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Get asset logs
   */
  async getAssetLogs(assetId: string): Promise<ApiResponse<AssetLog[]>> {
    try {
      // Select fields matching the AssetLog model in models.ts explicitly
      // Ensure the AssetLog model includes `created_at` if the DB has it.
      const selectFields = `
        id, asset_id, volunteer_id, location_id, 
        action, action_time, condition_notes, created_at
      `; // Adjust based on AssetLog model
      const { data, error } = await supabase.from('asset_logs')
        .select(selectFields)
        .eq('asset_id', assetId)
        .order('action_time', { ascending: false });
      if (error) {
        return { data: null, error: handleError(error) };
      }
      return { data: (data as AssetLog[]) || [], error: null };
    } catch (err) {
      return { data: null, error: handleError(err) };
    }
  }

  /**
   * Get asset categories
   */
  async getAssetCategories(): Promise<ApiResponse<AssetCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('asset_categories')
        .select('*')
        .order('name');
      if (error) {
        return { data: null, error: handleError(error) };
      }
      return { data: data as AssetCategory[], error: null };
    } catch (err) {
      return { data: null, error: handleError(err) };
    }
  }

  /**
   * Create a new asset category
   */
  async createAssetCategory(categoryInput: Partial<AssetCategory>): Promise<ApiResponse<AssetCategory>> {
    // Map AssetCategory input to AssetCategoryInsert type
    const categoryData: AssetCategoryInsert = {
      name: categoryInput.name || 'Unnamed Category', // Ensure required field 'name' is present
      description: categoryInput.description,
    };
    const { data, error } = await supabase
      .from('asset_categories')
      .insert(categoryData)
      .select()
      .single();
    if (error) {
      return { data: null, error: handleError(error) };
    }
    return { data: data as AssetCategory, error: null };
  }

  /**
   * Schedule maintenance for an asset
   */
  async scheduleMaintenance(
    assetId: string,
    maintenanceInput: Partial<AssetMaintenance>
  ): Promise<ApiResponse<AssetMaintenance>> {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { data: null, error: handleError({ status: 401, message: 'Not authenticated' }) };
    }
    
    try {
      const { error: assetError } = await this.updateAsset(assetId, { status: 'maintenance' });
      if (assetError) throw assetError;
      
      // Map AssetMaintenance input to AssetMaintenanceInsert type
      const maintenanceData: AssetMaintenanceInsert = {
        asset_id: assetId,
        description: maintenanceInput.description || 'Scheduled Maintenance', // Required field
        scheduled_date: maintenanceInput.maintenance_date || new Date().toISOString(), // Map and ensure required
        status: 'scheduled', // Set initial status
        assigned_to: maintenanceInput.performed_by || userId, // Map performed_by to assigned_to
        // Map other relevant fields like completed_date if applicable
      };

      // Insert the maintenance record
      const { data: newMaintenance, error: maintenanceError } = await supabase
        .from('asset_maintenance')
        .insert(maintenanceData)
        .select() // Select fields matching AssetMaintenance model
        .single();
        
      if (maintenanceError) throw maintenanceError;

      // Log the action
      const logData: AssetLogInsert = {
        asset_id: assetId,
        user_id: userId,
        action: 'maintenance',
        details: { scheduled: maintenanceData.scheduled_date, description: maintenanceData.description }
      };
      const { error: logError } = await supabase.from('asset_logs').insert(logData);

      if (logError) console.error("Failed to log maintenance schedule:", logError);

      // Cast result to AssetMaintenance model type
      return { data: newMaintenance as AssetMaintenance, error: null };

    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Complete maintenance for an asset
   */
  async completeMaintenance(
    maintenanceId: string,
    assetId: string,
    notes?: string
  ): Promise<ApiResponse<Asset>> {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { data: null, error: handleError({ status: 401, message: 'Not authenticated' }) };
    }

    try {
      // Update maintenance record
      const { error: maintenanceError } = await supabase
        .from('asset_maintenance')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString(),
          // description can include notes if needed, or add a notes field to the table
        })
        .eq('id', maintenanceId);

      if (maintenanceError) throw maintenanceError;

      // Update asset status
      const { data: asset, error: assetError } = await this.updateAsset(assetId, { status: 'available' });
      if (assetError) throw assetError;
      if (!asset) throw new Error('Failed to update asset after maintenance completion');

      // Log completion
      const logData: AssetLogInsert = {
        asset_id: assetId,
        user_id: userId,
        action: 'maintenance_completed', // Use a specific action
        details: { maintenanceId, notes }
      };
      const { error: logError } = await supabase.from('asset_logs').insert(logData);

      if (logError) console.error("Failed to log maintenance completion:", logError);

      return { data: asset, error: null };

    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Get the table schema
   */
  async getTableSchema(): Promise<ApiResponse<any>> {
    try {
      // Replace executeQuery call
      const { data, error } = await supabase.from(this.tableName).select('*').limit(0);
      if (error) {
        return { data: null, error: handleError(error) }; // Use imported handleError
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) }; // Use imported handleError
    }
  }
}

// Create a singleton instance
export const assetService = new AssetService(); 