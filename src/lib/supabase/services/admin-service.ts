// ============================================
// ADMIN SERVICE v4 - 2024-12-07
// Uses TradeLayout Supabase directly
// ============================================
import { createClient } from '@supabase/supabase-js';

const ADMIN_SERVICE_VERSION = 'v4';

// TradeLayout Supabase credentials
const TRADELAYOUT_URL = "https://oonepfqgzpdssfzvokgk.supabase.co";
const TRADELAYOUT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbmVwZnFnenBkc3NmenZva2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk5MTQsImV4cCI6MjA2NTc3NTkxNH0.lDCxgwj36EniiZthzZxhM_8coXQhXlrvv9UzemyYu6A";

// Create TradeLayout Supabase client
const tradelayoutSupabase = createClient(TRADELAYOUT_URL, TRADELAYOUT_KEY);

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  username?: string;
  created_at: string;
  last_login?: string;
  login_count?: number;
  marketing_consent?: boolean;
}

/**
 * Get all user profiles (admin only)
 * @param userId - The Clerk user ID of the requesting user
 */
export const getAllUserProfiles = async (userId: string): Promise<UserProfile[]> => {
  console.log(`[AdminService ${ADMIN_SERVICE_VERSION}] Starting fetch for admin: ${userId}`);
  console.log(`[AdminService ${ADMIN_SERVICE_VERSION}] Using TradeLayout Supabase`);
  
  try {
    // Query user_profiles directly from TradeLayout
    const { data, error } = await tradelayoutSupabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`[AdminService ${ADMIN_SERVICE_VERSION}] Query error:`, error);
      return [];
    }
    
    console.log(`[AdminService ${ADMIN_SERVICE_VERSION}] Received ${data?.length || 0} profiles`);
    return data || [];
  } catch (error) {
    console.error(`[AdminService ${ADMIN_SERVICE_VERSION}] Fetch failed:`, error);
    return [];
  }
};

/**
 * Update user profile (admin only)
 */
export const updateUserProfileAdmin = async (
  userId: string, 
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const { error } = await tradelayoutSupabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Delete user profile and all related data (admin only)
 */
export const deleteUserProfileAdmin = async (userId: string): Promise<void> => {
  try {
    const { error } = await tradelayoutSupabase
      .rpc('delete_user_profile_admin', { target_user_id: userId });

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};

/**
 * Get all strategies for all users (admin only)
 */
export const getAllStrategiesAdmin = async () => {
  try {
    const { data, error } = await tradelayoutSupabase
      .from('strategies')
      .select(`
        id,
        name,
        description,
        user_id,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting all strategies:', error);
    return [];
  }
};

// Export TradeLayout client for use in other modules
export { tradelayoutSupabase };

export const adminService = {
  getAllUserProfiles,
  updateUserProfileAdmin,
  deleteUserProfileAdmin,
  getAllStrategiesAdmin,
};