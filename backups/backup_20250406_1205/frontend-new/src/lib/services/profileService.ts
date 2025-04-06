import { ApiResponse, BaseService, getCurrentUserId } from './api';
import { Profile } from '../types/models';
import { supabase } from '../supabaseClient';

/**
 * Service for handling profile operations
 */
export class ProfileService extends BaseService {
  constructor() {
    super('profiles');
  }

  /**
   * Get the current user's profile
   */
  async getCurrentProfile(): Promise<ApiResponse<Profile>> {
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
    
    return this.getProfileById(userId);
  }

  /**
   * Get a profile by ID
   */
  async getProfileById(id: string): Promise<ApiResponse<Profile>> {
    return this.executeQuery<Profile>(
      this.query().select('*').eq('id', id).single()
    );
  }

  /**
   * Update the current user's profile
   */
  async updateProfile(profileData: Partial<Profile>): Promise<ApiResponse<Profile>> {
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
    
    // Remove id and timestamps from update data
    const { id, created_at, updated_at, ...updateData } = profileData as any;
    
    return this.executeQuery<Profile>(
      this.query()
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()
    );
  }

  /**
   * Upload a profile avatar image
   */
  async uploadAvatar(file: File): Promise<ApiResponse<{ path: string }>> {
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
    
    // Generate a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('profile-avatars')
      .upload(filePath, file, {
        upsert: true
      });
      
    if (error) {
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to upload avatar',
          details: error
        }
      };
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-avatars')
      .getPublicUrl(filePath);
      
    // Update the profile with the new avatar URL
    const updateResult = await this.updateProfile({
      avatar_url: publicUrl
    });
    
    if (updateResult.error) {
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to update profile with new avatar',
          details: updateResult.error
        }
      };
    }
    
    return {
      data: { path: publicUrl },
      error: null
    };
  }
}

// Create a singleton instance
export const profileService = new ProfileService(); 