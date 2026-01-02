import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  created_at?: string;
}

export interface UpdateUserProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

/**
 * Get user profile by user ID (supports Clerk TEXT IDs)
 * No RLS - authorization handled at application level
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('Getting user profile for userId:', userId);
    
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to avoid errors when no profile exists
    
    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
    
    console.log('User profile found:', data);
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Create user profile - handles Clerk user ID format (TEXT)
 * No RLS - authorization handled at application level
 */
export const createUserProfile = async (
  userId: string, 
  email: string, 
  firstName?: string, 
  lastName?: string
): Promise<UserProfile | null> => {
  try {
    console.log('Creating user profile for userId:', userId, 'email:', email);
    
    // First check if profile already exists
    const existingProfile = await getUserProfile(userId);
    if (existingProfile) {
      console.log('Profile already exists, returning existing profile');
      return existingProfile;
    }
    
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        first_name: firstName || null,
        last_name: lastName || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }
    
    console.log('User profile created:', data);
    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * Application-level authorization: only allow updates to the requesting user's profile
 */
export const updateUserProfile = async (
  userId: string, 
  updates: UpdateUserProfileData
): Promise<UserProfile | null> => {
  try {
    console.log('Updating user profile for userId:', userId, 'updates:', updates);
    
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }
    
    console.log('User profile updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Get all user profiles (admin only - implement admin check at application level)
 */
export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  try {
    console.log('Getting all user profiles');
    
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting all user profiles:', error);
      return [];
    }
    
    console.log('All user profiles:', data);
    return data || [];
  } catch (error) {
    console.error('Error getting all user profiles:', error);
    return [];
  }
};

export const userProfileService = {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getAllUserProfiles,
};
