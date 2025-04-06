import { supabase } from '../supabaseClient';
import { PostgrestQueryBuilder } from '@supabase/postgrest-js';

/**
 * Standard error response format
 */
export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

/**
 * Standard success response format
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

/**
 * Handles API errors and formats them consistently
 */
export function handleError(error: any): ApiError {
  // Format PostgreSQL errors more clearly
  if (error?.code) {
    console.error('PostgreSQL Error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    
    // Common Postgres error codes
    switch (error.code) {
      case '22P02': // invalid_text_representation
        return {
          status: 400,
          message: 'Invalid data format: ' + (error.message || 'A field has an incorrect format'),
          details: error.details || 'Check that all IDs are valid UUIDs and other fields have correct formats'
        };
      case '23505': // unique_violation
        return {
          status: 409,
          message: 'Duplicate entry: ' + (error.message || 'A unique constraint was violated'),
          details: error.details
        };
      case '23503': // foreign_key_violation
        return {
          status: 400,
          message: 'Referenced record not found: ' + (error.message || 'A referenced record does not exist'),
          details: error.details
        };
      case '42501': // insufficient_privilege
        return {
          status: 403,
          message: 'Permission denied: ' + (error.message || 'You do not have permission to perform this action'),
          details: error.details
        };
    }
  }
  
  console.error('API Error:', error);
  
  return {
    status: error?.status || 500,
    message: error?.message || error?.error?.message || 'Unknown error occurred',
    details: error?.details || error?.error || error
  };
}

/**
 * Base service class that all other services will extend
 */
export class BaseService {
  /**
   * The Supabase table name this service operates on
   */
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Create a query builder for the table
   */
  protected query<T = any>(): any {
    // Ensure supabase client is ready and imported properly
    if (!supabase) {
      console.error('Supabase client is undefined - check if it was imported correctly');
      throw new Error('Supabase client not defined');
    }
    
    if (typeof supabase.from !== 'function') {
      console.error('Supabase client missing "from" method - looks like initialization failed');
      throw new Error('Supabase client not properly initialized');
    }

    // Create a fresh query builder each time
    try {
      console.log(`Creating query builder for table: ${this.tableName}`);
      const queryBuilder = supabase.from(this.tableName);
      
      if (!queryBuilder) {
        console.error(`Failed to get query builder for table: ${this.tableName}`);
        throw new Error(`Failed to create query builder for table: ${this.tableName}`);
      }
      
      // Log available methods on the query builder for debugging
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(queryBuilder))
        .filter(name => typeof (queryBuilder as any)[name] === 'function' && name !== 'constructor')
        .join(', ');
      console.debug(`Query builder methods: ${methods}`);
      
      // Let's use a much simpler approach - just return the query builder directly
      // The festivalService.ts has been updated to handle the different API
      return queryBuilder;
    } catch (error) {
      console.error(`Error creating query builder for table ${this.tableName}:`, error);
      throw new Error(`Failed to create Supabase query: ${error}`);
    }
  }

  /**
   * Check if the table exists in the database
   */
  protected async checkTableExists(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', this.tableName);
      
      if (error) {
        console.error(`Error checking if table ${this.tableName} exists:`, error);
        return false;
      }
      
      return Array.isArray(data) && data.length > 0;
    } catch (error) {
      console.error(`Exception checking if table ${this.tableName} exists:`, error);
      return false;
    }
  }

  /**
   * Execute a query with error handling
   */
  protected async executeQuery<T>(
    queryPromise: Promise<{ data: T | null; error: any }>
  ): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await queryPromise;
      
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
    } catch (err) {
      return {
        data: null,
        error: handleError(err)
      };
    }
  }
}

/**
 * Check if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

/**
 * Get the current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id || null;
}

/**
 * Get the current user's roles
 */
export async function getUserRoles(): Promise<string[]> {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    return [];
  }
  
  try {
    // First approach: directly query the user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching user roles (first attempt):', error);
      
      // Try an alternative approach
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Get the role names from role IDs
    const roleIds = data.map(item => item.role_id);
    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('name')
      .in('id', roleIds);
      
    if (rolesError) {
      console.error('Error fetching role names:', rolesError);
      return [];
    }
    
    return rolesData?.map(role => role.name) || [];
  } catch (err) {
    console.error('Error in getUserRoles:', err);
    return [];
  }
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(roleName: string): Promise<boolean> {
  try {
    const roles = await getUserRoles();
    return roles.includes(roleName);
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Reusable pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Apply pagination to a query
 */
export function applyPagination<T>(query: PostgrestQueryBuilder<T>, params: PaginationParams): PostgrestQueryBuilder<T> {
  const { page = 1, pageSize = 10 } = params;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  
  return query.range(start, end);
} 