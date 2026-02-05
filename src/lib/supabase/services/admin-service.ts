// ============================================
// ADMIN SERVICE v6 - 2026-02-05
// Uses authenticated TradeLayout Supabase client
// Added Plan Management for Admins with proper RLS
// ============================================
import type { UserPlan, PlanType, PlanStatusType, BillingCycle } from '@/types/billing';
import { tradelayoutClient, getAuthenticatedTradelayoutClient } from '@/lib/supabase/tradelayout-client';

const ADMIN_SERVICE_VERSION = 'v6';

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

export interface UserWithPlan extends UserProfile {
  plan?: UserPlan;
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
    const { data, error } = await tradelayoutClient
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
 * Get all user profiles with their plans (admin only)
 */
export const getAllUsersWithPlans = async (userId: string): Promise<UserWithPlan[]> => {
  console.log(`[AdminService ${ADMIN_SERVICE_VERSION}] Fetching users with plans`);
  
  try {
    const profiles = await getAllUserProfiles(userId);
    const plans = await getAllUserPlans();
    
    // Merge profiles with plans
    const usersWithPlans = profiles.map(profile => {
      const plan = plans.find(p => p.user_id === profile.id);
      return { ...profile, plan };
    });
    
    return usersWithPlans;
  } catch (error) {
    console.error(`[AdminService ${ADMIN_SERVICE_VERSION}] Failed to fetch users with plans:`, error);
    return [];
  }
};

/**
 * Get all user plans (admin only)
 */
export const getAllUserPlans = async (): Promise<UserPlan[]> => {
  try {
    const { data, error } = await (tradelayoutClient as any)
      .from('user_plans')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error(`[AdminService ${ADMIN_SERVICE_VERSION}] Plans query error:`, error);
      return [];
    }
    
    return (data || []) as UserPlan[];
  } catch (error) {
    console.error(`[AdminService ${ADMIN_SERVICE_VERSION}] Failed to fetch plans:`, error);
    return [];
  }
};

/**
 * Get user plan by user ID
 */
export const getUserPlan = async (targetUserId: string): Promise<UserPlan | null> => {
  try {
    const { data, error } = await (tradelayoutClient as any)
      .from('user_plans')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();
    
    if (error) {
      console.error(`[AdminService ${ADMIN_SERVICE_VERSION}] Get plan error:`, error);
      return null;
    }
    
    return data as UserPlan | null;
  } catch (error) {
    console.error(`[AdminService ${ADMIN_SERVICE_VERSION}] Failed to get plan:`, error);
    return null;
  }
};

/**
 * Create or update user plan (admin only) - uses authenticated client for RLS
 */
export const upsertUserPlan = async (
  targetUserId: string,
  planData: Partial<UserPlan>,
  adminUserId: string
): Promise<UserPlan | null> => {
  try {
    // Use authenticated client to pass admin's JWT for RLS check
    const authClient = await getAuthenticatedTradelayoutClient();
    
    // Note: removed updated_by as it doesn't exist in user_plans table schema
    const { data, error } = await (authClient as any)
      .from('user_plans')
      .upsert({
        user_id: targetUserId,
        ...planData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (error) {
      console.error(`[AdminService ${ADMIN_SERVICE_VERSION}] Upsert plan error:`, error);
      throw error;
    }
    
    console.log(`[AdminService ${ADMIN_SERVICE_VERSION}] Plan updated for user: ${targetUserId}`);
    return data;
  } catch (error) {
    console.error(`[AdminService ${ADMIN_SERVICE_VERSION}] Failed to upsert plan:`, error);
    throw error;
  }
};

/**
 * Update user plan (admin only) - uses authenticated client for RLS
 */
export const updateUserPlan = async (
  targetUserId: string,
  updates: Partial<UserPlan>,
  adminUserId: string
): Promise<void> => {
  try {
    // Use authenticated client to pass admin's JWT for RLS check
    const authClient = await getAuthenticatedTradelayoutClient();
    
    // Note: removed updated_by as it doesn't exist in user_plans table schema
    const { error } = await (authClient as any)
      .from('user_plans')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', targetUserId);
    
    if (error) throw error;
    console.log(`[AdminService ${ADMIN_SERVICE_VERSION}] Plan updated for user: ${targetUserId}`);
  } catch (error) {
    console.error(`[AdminService ${ADMIN_SERVICE_VERSION}] Failed to update plan:`, error);
    throw error;
  }
};

/**
 * Assign plan to user (admin only)
 */
export const assignPlanToUser = async (
  targetUserId: string,
  plan: PlanType,
  options: {
    status?: PlanStatusType;
    billing_cycle?: BillingCycle;
    expires_at?: string;
    amount_paid?: number;
    admin_notes?: string;
  },
  adminUserId: string
): Promise<UserPlan | null> => {
  const planData: Partial<UserPlan> = {
    plan,
    status: options.status || 'active',
    billing_cycle: options.billing_cycle || 'monthly',
    expires_at: options.expires_at || null,
    amount_paid: options.amount_paid || 0,
    admin_notes: options.admin_notes,
    started_at: new Date().toISOString(),
  };
  
  return upsertUserPlan(targetUserId, planData, adminUserId);
};

/**
 * Reset user usage (admin only) - uses authenticated client for RLS
 */
export const resetUserUsage = async (
  targetUserId: string,
  adminUserId: string
): Promise<void> => {
  try {
    // Use authenticated client to pass admin's JWT for RLS check
    const authClient = await getAuthenticatedTradelayoutClient();
    
    // Note: removed updated_by as it doesn't exist in user_plans table schema
    const { error } = await (authClient as any)
      .from('user_plans')
      .update({
        backtests_used: 0,
        live_executions_used: 0,
        paper_trading_used: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', targetUserId);
    
    if (error) throw error;
    console.log(`[AdminService ${ADMIN_SERVICE_VERSION}] Usage reset for user: ${targetUserId}`);
  } catch (error) {
    console.error(`[AdminService ${ADMIN_SERVICE_VERSION}] Failed to reset usage:`, error);
    throw error;
  }
};

/**
 * Add add-ons to user (admin only) - uses authenticated client for RLS
 */
export const addUserAddons = async (
  targetUserId: string,
  addons: { backtests?: number; live_executions?: number },
  adminUserId: string
): Promise<void> => {
  try {
    // Get current plan
    const currentPlan = await getUserPlan(targetUserId);
    
    // Note: removed updated_by as it doesn't exist in user_plans table schema
    const updates: Partial<UserPlan> = {
      updated_at: new Date().toISOString(),
    };
    
    if (addons.backtests) {
      updates.addon_backtests = (currentPlan?.addon_backtests || 0) + addons.backtests;
    }
    if (addons.live_executions) {
      updates.addon_live_executions = (currentPlan?.addon_live_executions || 0) + addons.live_executions;
    }
    
    // Use authenticated client to pass admin's JWT for RLS check
    const authClient = await getAuthenticatedTradelayoutClient();
    
    const { error } = await (authClient as any)
      .from('user_plans')
      .update(updates)
      .eq('user_id', targetUserId);
    
    if (error) throw error;
    console.log(`[AdminService ${ADMIN_SERVICE_VERSION}] Add-ons added for user: ${targetUserId}`);
  } catch (error) {
    console.error(`[AdminService ${ADMIN_SERVICE_VERSION}] Failed to add add-ons:`, error);
    throw error;
  }
};

/**
 * Update user profile (admin only) - uses authenticated client for RLS
 */
export const updateUserProfileAdmin = async (
  userId: string, 
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const authClient = await getAuthenticatedTradelayoutClient();
    
    const { error } = await (authClient as any)
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
    const authClient = await getAuthenticatedTradelayoutClient();
    
    const { error } = await (authClient as any)
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
    const { data, error } = await tradelayoutClient
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
export { tradelayoutClient };

export const adminService = {
  getAllUserProfiles,
  getAllUsersWithPlans,
  getAllUserPlans,
  getUserPlan,
  upsertUserPlan,
  updateUserPlan,
  assignPlanToUser,
  resetUserUsage,
  addUserAddons,
  updateUserProfileAdmin,
  deleteUserProfileAdmin,
  getAllStrategiesAdmin,
};
