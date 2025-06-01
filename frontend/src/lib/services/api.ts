import { supabase } from '../supabaseClient';
import { PostgrestResponse, PostgrestSingleResponse, PostgrestFilterBuilder, PostgrestBuilder, PostgrestError } from '@supabase/postgrest-js';
import { Database } from '../types/supabase';

/**
 * Standard error response format
 */
export interface ApiError extends Error {
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
    let status = 400; // Default bad request
    let message = error.message || 'Database error occurred';
    let details = error.details;

    switch (error.code) {
      case '22P02': // invalid_text_representation
        message = 'Invalid data format: ' + message;
        details = details || 'Check that all IDs are valid UUIDs and other fields have correct formats';
        break;
      case '23505': // unique_violation
        status = 409;
        message = 'Duplicate entry: ' + message;
        break;
      case '23503': // foreign_key_violation
        message = 'Referenced record not found: ' + message;
        break;
      case '42501': // insufficient_privilege
        status = 403;
        message = 'Permission denied: ' + message;
        break;
    }
    
    return {
      name: 'ApiError', // Add name explicitly
      status,
      message,
      details
    };
  }
  
  console.error('API Error:', error);
  
  return {
    name: 'ApiError', // Add name explicitly
    status: error?.status || error?.response?.status || 500,
    message: error?.message || error?.error?.message || 'Unknown error occurred',
    details: error?.details || error?.error || error?.response?.data || error
  };
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
export function applyPagination<T extends Record<string, any>>(
  query: PostgrestFilterBuilder<Database['public'], any, T[]>,
  params: PaginationParams
): PostgrestFilterBuilder<Database['public'], any, T[]> {
  const { page = 1, pageSize = 10 } = params;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  return query.range(start, end);
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