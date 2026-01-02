import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';

/**
 * Admin function to grant access to encrypted data
 */
export const grantUserAccess = async (
  targetUserId: string, 
  dataOwnerId: string, 
  adminUserId: string
): Promise<boolean> => {
  try {
    // Verify admin permissions
    const isAdmin = await checkAdminPermissions(adminUserId);
    if (!isAdmin) {
      throw new Error('Admin permissions required');
    }

    // Store access permission in user_activity table
    await supabase
      .from('user_activity')
      .insert({
        user_id: targetUserId,
        activity_type: 'granted_access',
        activity_data: {
          data_owner_id: dataOwnerId,
          granted_by: adminUserId,
          granted_at: new Date().toISOString()
        }
      });

    return true;
  } catch (error) {
    console.error('Error granting user access:', error);
    return false;
  }
};

/**
 * Check if user has been granted access to decrypt data from another user
 */
export const hasGrantedAccess = async (userId: string, dataOwnerId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_activity')
      .select('activity_data')
      .eq('user_id', userId)
      .eq('activity_type', 'granted_access');

    if (error || !data) {
      return false;
    }

    // Check if any granted access matches the data owner
    return data.some(item => {
      const activityData = item.activity_data as { data_owner_id: string };
      return activityData.data_owner_id === dataOwnerId;
    });
  } catch (error) {
    console.error('Error checking granted access:', error);
    return false;
  }
};

/**
 * Revoke user access to encrypted data
 */
export const revokeUserAccess = async (
  targetUserId: string,
  dataOwnerId: string,
  adminUserId: string
): Promise<boolean> => {
  try {
    const isAdmin = await checkAdminPermissions(adminUserId);
    if (!isAdmin) {
      throw new Error('Admin permissions required');
    }

    const { error } = await supabase
      .from('user_activity')
      .delete()
      .eq('user_id', targetUserId)
      .eq('activity_type', 'granted_access');

    return !error;
  } catch (error) {
    console.error('Error revoking user access:', error);
    return false;
  }
};

/**
 * List all users who have access to a specific user's encrypted data
 */
export const listUsersWithAccess = async (dataOwnerId: string, adminUserId: string): Promise<string[]> => {
  try {
    const isAdmin = await checkAdminPermissions(adminUserId);
    if (!isAdmin) {
      throw new Error('Admin permissions required');
    }

    const { data, error } = await supabase
      .from('user_activity')
      .select('user_id, activity_data')
      .eq('activity_type', 'granted_access');

    if (error || !data) {
      return [];
    }

    // Filter for users who have access to the specific data owner
    return data
      .filter(item => {
        const activityData = item.activity_data as { data_owner_id: string };
        return activityData.data_owner_id === dataOwnerId;
      })
      .map(item => item.user_id);
  } catch (error) {
    console.error('Error listing users with access:', error);
    return [];
  }
};

/**
 * Admin function to check permissions using secure role-based system
 */
const checkAdminPermissions = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('has_role', { 
        _user_id: userId, 
        _role: 'admin' 
      });

    if (error) {
      console.error('Error checking admin permissions:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error calling has_role function:', error);
    return false;
  }
};