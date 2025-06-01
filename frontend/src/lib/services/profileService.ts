import { ApiResponse, handleError } from './api';
import { Profile } from '../types/models';
import { Database } from '../types/supabase';
import { supabase } from '../supabaseClient';

/**
 * Service for handling profile operations
 */
export class ProfileService {
  private readonly tableName = 'profiles';

  /**
   * Get a profile by ID
   */
  async getProfile(userId: string): Promise<ApiResponse<Profile>> {
    try {
      const { data, error } = await (supabase.from(this.tableName).select('*') as any)
        .eq('id', userId)
        .single();
      if (error) {
        return { data: null, error: handleError(error) };
      }
      return { data: data as Profile | null, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Get all profiles
   */
  async getProfiles(): Promise<ApiResponse<Profile[]>> {
    try {
      const { data, error } = await (supabase.from(this.tableName).select('*') as any).order('full_name');
      if (error) {
        return { data: null, error: handleError(error) };
      }
      return { data: data as Profile[], error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Update a profile's avatar
   */
  async updateAvatar(userId: string, file: File): Promise<ApiResponse<{ path: string }>> {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        return { data: null, error: handleError(uploadError) };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        return { data: null, error: handleError(new Error('Could not get public URL for uploaded avatar.')) };
      }

      const updateResponse = await this.updateProfile(userId, {
        avatar_url: publicUrl
      });

      if (updateResponse.error) {
        return { data: { path: filePath }, error: updateResponse.error };
      }

      return {
        data: { path: publicUrl },
        error: null
      };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  /**
   * Update a profile
   */
  async updateProfile(userId: string, profileData: Partial<Profile>): Promise<ApiResponse<Profile>> {
    try {
      const { data, error } = await supabase.from(this.tableName)
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();
      if (error) {
        return { data: null, error: handleError(error) };
      }
      return { data: data as Profile | null, error: null };
    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }

  async uploadAvatar(userId: string, file: File): Promise<ApiResponse<{ path: string }>> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        return { data: null, error: handleError(uploadError) };
      }

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      if (!publicUrlData?.publicUrl) {
         return { data: null, error: handleError(new Error('Could not get public URL for uploaded avatar.')) };
      }

      const updateResponse = await this.updateProfile(userId, { 
        avatar_url: publicUrlData.publicUrl 
      });
      
      if (updateResponse.error) {
         return { data: { path: filePath }, error: updateResponse.error };
      }

      return { data: { path: filePath }, error: null };

    } catch (error) {
      return { data: null, error: handleError(error) };
    }
  }
}

// Create a singleton instance
export const profileService = new ProfileService(); 