import { supabase } from '../config/supabaseClient';

// Auth related functions
export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({
    email,
    password,
  });
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getSession = async () => {
  return await supabase.auth.getSession();
};

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Profile related functions
export const getProfile = async (userId: string) => {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
};

export const updateProfile = async (userId: string, updates: any) => {
  return await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
};

// Volunteer related functions
export const getVolunteers = async () => {
  return await supabase
    .from('volunteers')
    .select('*, profiles(*)');
};

export const getVolunteer = async (volunteerId: string) => {
  return await supabase
    .from('volunteers')
    .select('*, profiles(*)')
    .eq('id', volunteerId)
    .single();
};

// Assignment related functions
export const getAssignments = async (volunteerId?: string) => {
  let query = supabase
    .from('assignments')
    .select('*, volunteers(*), locations(*)');
  
  if (volunteerId) {
    query = query.eq('volunteer_id', volunteerId);
  }
  
  return await query;
};

// Location related functions
export const getLocations = async () => {
  return await supabase
    .from('locations')
    .select('*');
};

// Festival related functions
export const getFestivals = async () => {
  return await supabase
    .from('festivals')
    .select('*');
};

// Waiver related functions
export const getWaivers = async (volunteerId?: string) => {
  let query = supabase
    .from('waivers')
    .select('*');
  
  if (volunteerId) {
    query = query.eq('volunteer_id', volunteerId);
  }
  
  return await query;
};

export const signWaiver = async (waiverId: string, volunteerId: string, signature: string) => {
  return await supabase
    .from('waivers')
    .update({
      signed_at: new Date().toISOString(),
      signature
    })
    .eq('id', waiverId)
    .eq('volunteer_id', volunteerId);
}; 