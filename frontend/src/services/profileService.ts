import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  skills: string[];
  availability: {
    [key: string]: {
      morning: boolean;
      afternoon: boolean;
      evening: boolean;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  full_name?: string;
  avatar_url?: string | null;
  bio?: string | null;
  phone?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  skills?: string[];
  availability?: {
    [key: string]: {
      morning: boolean;
      afternoon: boolean;
      evening: boolean;
    };
  };
}

export const profileService = {
  // Get user profile
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create or update user profile
  async upsertProfile(userId: string, profile: ProfileUpdate): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update profile avatar
  async updateAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    await this.upsertProfile(userId, { avatar_url: publicUrl });

    return publicUrl;
  },

  // Update availability
  async updateAvailability(userId: string, availability: UserProfile['availability']): Promise<UserProfile> {
    return this.upsertProfile(userId, { availability });
  },

  // Update skills
  async updateSkills(userId: string, skills: string[]): Promise<UserProfile> {
    return this.upsertProfile(userId, { skills });
  },

  // Subscribe to profile changes
  subscribeToProfile(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }
}; 