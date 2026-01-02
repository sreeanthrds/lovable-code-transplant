import { StrategyData } from '../utils/strategyModel';
import { adminService, tradelayoutSupabase } from '@/lib/supabase/services/admin-service';

/**
 * Admin-only functions for accessing any user's strategies from Supabase
 * These functions bypass user restrictions for admin purposes
 */

/**
 * Type for user with strategies info
 */
export interface UserWithStrategies {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  strategy_count: number;
}

/**
 * Get all users from user_profiles with their strategy counts
 * @param requestingUserId - The Clerk user ID of the admin making the request
 */
export const getAllUsersWithStrategies = async (requestingUserId: string): Promise<UserWithStrategies[]> => {
  try {
    console.log('getAllUsersWithStrategies: Querying all users for admin:', requestingUserId);

    // Get ALL user profiles using adminService (correctly passes requesting_user_id)
    const allProfiles = await adminService.getAllUserProfiles(requestingUserId);
    console.log('All profiles from adminService:', allProfiles?.length || 0);

    if (!allProfiles || allProfiles.length === 0) {
      console.log('No user profiles found');
      return [];
    }

    // Get all strategies from TradeLayout to count per user
    const { data: strategies, error: strategiesError } = await tradelayoutSupabase
      .from('strategies')
      .select('user_id');

    if (strategiesError) {
      console.error('Failed to query strategies:', strategiesError);
    }

    // Count strategies per user
    const strategyCounts = (strategies || []).reduce((acc, strategy) => {
      acc[strategy.user_id] = (acc[strategy.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Build result from ALL user profiles
    const usersWithStrategies: UserWithStrategies[] = allProfiles.map(profile => ({
      id: profile.id,
      email: profile.email,
      first_name: profile.first_name || undefined,
      last_name: profile.last_name || undefined,
      strategy_count: strategyCounts[profile.id] || 0,
    }));

    // Sort by strategy count (users with strategies first), then by email
    usersWithStrategies.sort((a, b) => {
      if (b.strategy_count !== a.strategy_count) {
        return b.strategy_count - a.strategy_count;
      }
      return a.email.localeCompare(b.email);
    });

    console.log('Final users list:', usersWithStrategies.length);
    
    return usersWithStrategies;
  } catch (error) {
    console.error('Failed to get users with strategies:', error);
    return [];
  }
};

/**
 * Get all strategies for a specific user (admin only)
 */
export const getStrategiesForUser = async (userId: string): Promise<Array<{id: string, name: string, created: string}>> => {
  try {
    if (!userId) {
      return [];
    }
    
    console.log(`getStrategiesForUser: Querying strategies for user ${userId} from TradeLayout`);
    
    const { data: strategies, error } = await tradelayoutSupabase
      .from('strategies')
      .select('id, name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Failed to get strategies for user ${userId}:`, error);
      return [];
    }

    if (!strategies || strategies.length === 0) {
      console.log(`No strategies found for user ${userId}`);
      return [];
    }

    const result = strategies.map(strategy => ({
      id: strategy.id,
      name: strategy.name || 'Unnamed Strategy',
      created: strategy.created_at || 'Unknown'
    }));

    console.log(`getStrategiesForUser: Found ${result.length} strategies for user ${userId}`);
    return result;
  } catch (error) {
    console.error(`Failed to get strategies for user ${userId}:`, error);
    return [];
  }
};

/**
 * Load any user's strategy by user ID and strategy ID (admin only)
 */
export const loadUserStrategy = async (userId: string, strategyId: string): Promise<StrategyData | null> => {
  try {
    if (!userId || !strategyId) {
      console.warn('Missing userId or strategyId for admin strategy load');
      return null;
    }
    
    console.log(`loadUserStrategy: Loading strategy ${strategyId} for user ${userId} from TradeLayout`);
    
    const { data: strategy, error } = await tradelayoutSupabase
      .from('strategies')
      .select('*')
      .eq('user_id', userId)
      .eq('id', strategyId)
      .maybeSingle();

    if (error) {
      console.error(`Failed to load strategy ${strategyId} for user ${userId}:`, error);
      return null;
    }

    if (!strategy) {
      console.log(`No strategy found with id: ${strategyId} for user: ${userId}`);
      return null;
    }

    console.log(`Successfully loaded strategy: ${strategy.name} (${strategy.id}) for user: ${userId}`);
    
    // Return the strategy JSON data, enriched with metadata if missing
    if (strategy.strategy && typeof strategy.strategy === 'object') {
      const data = strategy.strategy as any;
      if (data && typeof data === 'object') {
        if (data.userId == null) data.userId = userId;
        if (data.strategyId == null) data.strategyId = strategyId;
      }
      return data as unknown as StrategyData;
    } else {
      console.warn('Invalid strategy structure in database');
      return null;
    }
  } catch (error) {
    console.error(`Failed to load strategy ${strategyId} for user ${userId}:`, error);
    return null;
  }
};