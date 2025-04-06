import { ApiResponse, BaseService, PaginationParams, applyPagination, getCurrentUserId } from './api';
import { Asset, AssetCategory, AssetLog, AssetMaintenance } from '../types/models';
import { supabase } from '../supabaseClient';

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

/**
 * Service for handling asset operations
 */
export class AssetService extends BaseService {
  constructor() {
    super('assets');
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
      
      // Build the base query
      let query = supabase.from('assets').select('*');

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

      // Apply pagination
      query = applyPagination(query, pagination);

      // Execute the query
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching assets:', error);
        return {
          data: null,
          error: {
            status: 500,
            message: error.message,
            details: error
          }
        };
      }
      
      // If no data or empty array, return it
      if (!data || data.length === 0) {
        return {
          data: [],
          error: null
        };
      }
      
      // Get unique category IDs from all assets
      const categoryIds = [...new Set(data.map(asset => asset.category_id).filter(Boolean))];
      
      // Fetch all categories in a single query if there are any
      let categoriesMap: Record<string, any> = {};
      if (categoryIds.length > 0) {
        const { data: categoriesData } = await supabase
          .from('asset_categories')
          .select('*')
          .in('id', categoryIds);
          
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
        data: enrichedAssets,
        error: null
      };
    } catch (err) {
      console.error('Exception in getAssets:', err);
      return {
        data: null,
        error: {
          status: 500,
          message: err instanceof Error ? err.message : 'Unknown error',
          details: err
        }
      };
    }
  }

  /**
   * Get an asset by ID
   */
  async getAssetById(id: string): Promise<ApiResponse<Asset>> {
    try {
      console.log(`Getting asset by ID: ${id}`);
      
      // First, get the asset
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching asset with ID ${id}:`, error);
        return {
          data: null,
          error: {
            status: 500,
            message: error.message,
            details: error
          }
        };
      }
      
      // Separately fetch the category if there's a category_id
      if (data.category_id) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('asset_categories')
          .select('*')
          .eq('id', data.category_id)
          .single();
          
        if (!categoryError && categoryData) {
          data.category = categoryData;
        }
      }
      
      // Separately fetch the location if there's a current_location_id
      if (data.current_location_id) {
        const { data: locationData, error: locationError } = await supabase
          .from('locations')
          .select('*')
          .eq('id', data.current_location_id)
          .single();
          
        if (!locationError && locationData) {
          data.location = locationData;
        }
      }
      
      // Separately fetch the volunteer if there's an assigned_volunteer_id
      if (data.assigned_volunteer_id) {
        const { data: volunteerData, error: volunteerError } = await supabase
          .from('volunteers')
          .select(`
            *,
            profiles:profile_id (
              id,
              full_name
            )
          `)
          .eq('id', data.assigned_volunteer_id)
          .single();
          
        if (!volunteerError && volunteerData) {
          data.volunteer = volunteerData;
        }
      }
      
      return {
        data,
        error: null
      };
    } catch (err) {
      console.error(`Exception in getAssetById for ID ${id}:`, err);
      return {
        data: null,
        error: {
          status: 500,
          message: err instanceof Error ? err.message : 'Unknown error',
          details: err
        }
      };
    }
  }

  /**
   * Create an asset data only (without relationship handling)
   * This method is used internally to avoid schema inspection errors
   */
  private async createAssetData(assetData: Partial<Asset>): Promise<ApiResponse<{id: string}>> {
    try {
      // Remove any relation objects that might be present
      const { category, location, volunteer, ...createData } = assetData as any;
      
      // Sanitize UUID fields to ensure they're either valid UUIDs or null
      const sanitizedData = this.sanitizeUuidFields(createData);
      
      console.log('Raw create data for INSERT:', sanitizedData);
      
      // Insert without returning the full object
      const { data, error } = await supabase
        .from('assets')
        .insert(sanitizedData)
        .select('id')
        .single();
      
      if (error) {
        console.error(`Error in raw create for asset:`, error);
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
    } catch (err) {
      console.error(`Exception in createAssetData:`, err);
      return {
        data: null,
        error: {
          status: 500,
          message: err instanceof Error ? err.message : 'Unknown error',
          details: err
        }
      };
    }
  }

  /**
   * Create a new asset
   */
  async createAsset(assetData: Partial<Asset>): Promise<ApiResponse<Asset>> {
    try {
      console.log('Creating new asset:', assetData);
      
      // First, insert the new asset to get its ID
      const { data: newAssetId, error: createError } = await this.createAssetData(assetData);
      
      if (createError || !newAssetId) {
        return {
          data: null,
          error: createError || {
            status: 500,
            message: 'Failed to create asset - no ID returned',
            details: null
          }
        };
      }
      
      // Then, fetch the full asset data with its relations
      return this.getAssetById(newAssetId.id);
    } catch (err) {
      console.error(`Exception in createAsset:`, err);
      return {
        data: null,
        error: {
          status: 500,
          message: err instanceof Error ? err.message : 'Unknown error',
          details: err
        }
      };
    }
  }

  /**
   * Update asset data only (without relationship handling)
   * This method is used internally to avoid schema inspection errors
   */
  private async updateAssetData(id: string, assetData: Partial<Asset>): Promise<ApiResponse<null>> {
    try {
      // Remove immutable fields
      const { id: _, created_at, updated_at, category, location, volunteer, ...updateData } = assetData as any;
      
      // Sanitize UUID fields to ensure they're either valid UUIDs or null
      const sanitizedData = this.sanitizeUuidFields(updateData);
      
      console.log('Raw update data for PATCH:', sanitizedData);
      
      // Perform the update operation without any joins or returns
      const { error } = await supabase
        .from('assets')
        .update(sanitizedData)
        .eq('id', id);
      
      if (error) {
        console.error(`Error in raw update for asset ${id}:`, error);
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
    } catch (err) {
      console.error(`Exception in updateAssetData for ID ${id}:`, err);
      return {
        data: null,
        error: {
          status: 500,
          message: err instanceof Error ? err.message : 'Unknown error',
          details: err
        }
      };
    }
  }

  /**
   * Update an asset
   */
  async updateAsset(id: string, assetData: Partial<Asset>): Promise<ApiResponse<Asset>> {
    try {
      console.log(`Updating asset with ID ${id}:`, assetData);
      
      // First, perform the raw update operation
      const { error: updateError } = await this.updateAssetData(id, assetData);
      
      if (updateError) {
        return {
          data: null,
          error: updateError
        };
      }
      
      // Then, fetch the updated asset with all its relations
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching updated asset ${id}:`, error);
        return {
          data: null,
          error: {
            status: 500,
            message: error.message,
            details: error
          }
        };
      }
      
      // Separately fetch the category if there's a category_id
      if (data.category_id) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('asset_categories')
          .select('*')
          .eq('id', data.category_id)
          .single();
          
        if (!categoryError && categoryData) {
          data.category = categoryData;
        }
      }
      
      return {
        data,
        error: null
      };
    } catch (err) {
      console.error(`Exception in updateAsset for ID ${id}:`, err);
      return {
        data: null,
        error: {
          status: 500,
          message: err instanceof Error ? err.message : 'Unknown error',
          details: err
        }
      };
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
    } catch (err) {
      console.error(`Exception in deleteAsset for ID ${id}:`, err);
      return {
        data: null,
        error: {
          status: 500,
          message: err instanceof Error ? err.message : 'Unknown error',
          details: err
        }
      };
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
      return {
        data: null,
        error: {
          status: 401,
          message: 'Not authenticated'
        }
      };
    }
    
    try {
      // Start a transaction
      const { data: asset, error: assetError } = await this.updateAsset(assetId, {
        status: 'in-use',
        assigned_volunteer_id: volunteerId,
        current_location_id: locationId || null
      });
      
      if (assetError) {
        throw assetError;
      }
      
      // Create a log entry
      const { error: logError } = await supabase
        .from('asset_logs')
        .insert({
          asset_id: assetId,
          volunteer_id: volunteerId,
          location_id: locationId || null,
          action: 'check_out',
          condition_notes: notes
        });
      
      if (logError) {
        throw logError;
      }
      
      return {
        data: asset,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to check out asset',
          details: error
        }
      };
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
      return {
        data: null,
        error: {
          status: 401,
          message: 'Not authenticated'
        }
      };
    }
    
    try {
      // Get the current asset details
      const { data: currentAsset, error: getError } = await this.getAssetById(assetId);
      
      if (getError) {
        throw getError;
      }
      
      if (!currentAsset) {
        throw new Error('Asset not found');
      }
      
      // Start a transaction
      const { data: asset, error: assetError } = await this.updateAsset(assetId, {
        status: 'available',
        assigned_volunteer_id: null,
        current_location_id: locationId
      });
      
      if (assetError) {
        throw assetError;
      }
      
      // Create a log entry
      const { error: logError } = await supabase
        .from('asset_logs')
        .insert({
          asset_id: assetId,
          volunteer_id: currentAsset.assigned_volunteer_id,
          location_id: locationId,
          action: 'check_in',
          condition_notes: notes
        });
      
      if (logError) {
        throw logError;
      }
      
      return {
        data: asset,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to check in asset',
          details: error
        }
      };
    }
  }

  /**
   * Get asset logs
   */
  async getAssetLogs(assetId: string): Promise<ApiResponse<AssetLog[]>> {
    try {
      console.log(`Getting logs for asset ID: ${assetId}`);
      
      const { data, error } = await supabase
        .from('asset_logs')
        .select(`
          *,
          volunteer:volunteer_id (
            id,
            profile:profile_id (
              id,
              full_name
            )
          ),
          location:location_id (
            id,
            name
          )
        `)
        .eq('asset_id', assetId)
        .order('action_time', { ascending: false });
        
      if (error) {
        console.error(`Error fetching logs for asset ${assetId}:`, error);
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
    } catch (err) {
      console.error(`Exception in getAssetLogs for asset ${assetId}:`, err);
      return {
        data: null,
        error: {
          status: 500,
          message: err instanceof Error ? err.message : 'Unknown error',
          details: err
        }
      };
    }
  }

  /**
   * Get asset categories
   */
  async getAssetCategories(): Promise<ApiResponse<AssetCategory[]>> {
    return this.executeQuery<AssetCategory[]>(
      supabase
        .from('asset_categories')
        .select('*')
        .order('name')
    );
  }

  /**
   * Create a new asset category
   */
  async createAssetCategory(categoryData: Partial<AssetCategory>): Promise<ApiResponse<AssetCategory>> {
    return this.executeQuery<AssetCategory>(
      supabase
        .from('asset_categories')
        .insert(categoryData)
        .select()
        .single()
    );
  }

  /**
   * Schedule maintenance for an asset
   */
  async scheduleMaintenance(
    assetId: string,
    maintenance: Partial<AssetMaintenance>
  ): Promise<ApiResponse<AssetMaintenance>> {
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
    
    try {
      // Update the asset status
      const { error: assetError } = await this.updateAsset(assetId, {
        status: 'maintenance'
      });
      
      if (assetError) {
        throw assetError;
      }
      
      // Create maintenance record
      const maintenanceData = {
        ...maintenance,
        asset_id: assetId,
        performed_by: maintenance.performed_by || userId
      };
      
      const { data, error } = await supabase
        .from('asset_maintenance')
        .insert(maintenanceData)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Create a log entry
      const { error: logError } = await supabase
        .from('asset_logs')
        .insert({
          asset_id: assetId,
          action: 'maintenance',
          condition_notes: maintenance.description
        });
      
      if (logError) {
        throw logError;
      }
      
      return {
        data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to schedule maintenance',
          details: error
        }
      };
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
    try {
      // Update maintenance record
      const { error: maintenanceError } = await supabase
        .from('asset_maintenance')
        .update({
          notes: notes || 'Maintenance completed'
        })
        .eq('id', maintenanceId);
      
      if (maintenanceError) {
        throw maintenanceError;
      }
      
      // Update asset status
      const { data: asset, error: assetError } = await this.updateAsset(assetId, {
        status: 'available'
      });
      
      if (assetError) {
        throw assetError;
      }
      
      // Create a log entry
      const { error: logError } = await supabase
        .from('asset_logs')
        .insert({
          asset_id: assetId,
          action: 'check_in',
          condition_notes: 'Maintenance completed: ' + (notes || '')
        });
      
      if (logError) {
        throw logError;
      }
      
      return {
        data: asset,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to complete maintenance',
          details: error
        }
      };
    }
  }
}

// Create a singleton instance
export const assetService = new AssetService(); 