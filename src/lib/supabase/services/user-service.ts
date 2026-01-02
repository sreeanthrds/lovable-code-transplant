
import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';
import { validateUserProfile } from '@/lib/validation';
import { logSecurityEvent } from '@/lib/security';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  username?: string;
  created_at?: string;
  last_login?: string;
  last_visited?: string;
  login_count?: number;
  marketing_consent?: boolean;
}

export interface CreateUserProfileData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email_id: string;
  username: string;
  marketing_consent?: boolean;
}

/**
 * Create or update user profile in the database with validation
 */
const createUserProfile = async (userData: CreateUserProfileData, userId: string): Promise<UserProfile | null> => {
  try {
    // Validate user data
    const validatedData = validateUserProfile({
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone_number: userData.phone_number,
      email: userData.email_id,
      username: userData.username,
      marketing_consent: userData.marketing_consent
    });

    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .upsert({
        id: userId,
        email: validatedData.email,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        phone_number: validatedData.phone_number,
        username: validatedData.username,
        marketing_consent: validatedData.marketing_consent || false,
        created_at: new Date().toISOString(),
        login_count: 1
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error);
      logSecurityEvent('USER_PROFILE_CREATE_ERROR', { userId, error: error.message });
      return null;
    }
    
    logSecurityEvent('USER_PROFILE_CREATED', { userId });
    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    logSecurityEvent('USER_PROFILE_CREATE_ERROR', { userId, error: String(error) });
    return null;
  }
};

/**
 * Get user profile by user ID
 */
const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error(`Error getting user profile (${userId}):`, error);
      logSecurityEvent('USER_PROFILE_FETCH_ERROR', { userId, error: error.message });
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    logSecurityEvent('USER_PROFILE_FETCH_ERROR', { userId, error: String(error) });
    return null;
  }
};

/**
 * Update user login tracking
 */
const updateLoginTracking = async (userId: string): Promise<void> => {
  try {
    // First get the current login count
    const { data: currentProfile } = await (supabase as any)
      .from('user_profiles')
      .select('login_count')
      .eq('id', userId)
      .single();
    
    const currentCount = currentProfile?.login_count || 0;
    
    await (supabase as any)
      .from('user_profiles')
      .update({
        last_login: new Date().toISOString(),
        login_count: currentCount + 1
      })
      .eq('id', userId);
      
    logSecurityEvent('LOGIN_TRACKING_UPDATED', { userId, loginCount: currentCount + 1 });
  } catch (error) {
    console.error('Error updating login tracking:', error);
    logSecurityEvent('LOGIN_TRACKING_ERROR', { userId, error: String(error) });
  }
};

/**
 * Update user's last visited time
 */
const updateLastVisited = async (userId: string): Promise<void> => {
  try {
    await (supabase as any)
      .from('user_profiles')
      .update({
        last_visited: new Date().toISOString()
      })
      .eq('id', userId);
      
    logSecurityEvent('LAST_VISITED_UPDATED', { userId });
  } catch (error) {
    console.error('Error updating last visited time:', error);
    logSecurityEvent('LAST_VISITED_ERROR', { userId, error: String(error) });
  }
};

/**
 * Get all user profiles (for admin/analytics) - restricted access
 */
const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  try {
    // This should be restricted to admin users only
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.warn('No authenticated user found');
      logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT');
      return [];
    }

    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting all user profiles:', error);
      logSecurityEvent('USER_PROFILES_FETCH_ERROR', { error: error.message });
      return [];
    }
    
    logSecurityEvent('ADMIN_USER_PROFILES_ACCESSED', { userId: userData.user.id });
    return data || [];
  } catch (error) {
    console.error('Error getting all user profiles:', error);
    logSecurityEvent('USER_PROFILES_FETCH_ERROR', { error: String(error) });
    return [];
  }
};

export const userService = {
  createUserProfile,
  getUserProfile,
  updateLoginTracking,
  updateLastVisited,
  getAllUserProfiles
};
