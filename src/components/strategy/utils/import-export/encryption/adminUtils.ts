import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';
import { getCurrentUserId } from './userIdUtils';

/**
 * Admin function to check permissions using secure role-based system
 */
const checkAdminPermissions = async (userId: string): Promise<boolean> => {
  try {
    console.log('🔍 Checking admin permissions for user:', userId);
    const { data, error } = await supabase
      .rpc('has_role', { 
        _user_id: userId, 
        _role: 'admin' 
      });

    console.log('🔍 has_role result:', { data, error });

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

/**
 * Check if current user is admin
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  const userId = getCurrentUserId();
  if (!userId) return false;
  
  return await checkAdminPermissions(userId);
};

/**
 * Grant admin access to a user using secure role-based system
 */
export const grantAdminAccess = async (targetUserId: string, adminUserId: string): Promise<boolean> => {
  try {
    const isAdmin = await checkAdminPermissions(adminUserId);
    if (!isAdmin) {
      throw new Error('Admin permissions required');
    }

    // Insert admin role using the proper role system
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: targetUserId,
        role: 'admin'
      });

    if (error) {
      console.error('Error granting admin access:', error);
      return false;
    }

    console.log('✅ Admin access granted to user:', targetUserId);
    return true;
  } catch (error) {
    console.error('Error granting admin access:', error);
    return false;
  }
};