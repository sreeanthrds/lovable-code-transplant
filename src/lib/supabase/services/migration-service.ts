import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';
import { TimeframeMigrationService } from '@/components/strategy/utils/timeframe-migration';

export interface BulkMigrationResult {
  totalStrategies: number;
  migratedStrategies: number;
  failedStrategies: number;
  warnings: string[];
  results: Array<{
    strategyId: string;
    strategyName: string;
    userId: string;
    migrated: boolean;
    error?: string;
    createdTimeframes: number;
  }>;
}

export interface MigrationFilters {
  scope: 'specific' | 'user' | 'all';
  strategyId?: string;
  userId?: string;
}

/**
 * Migrate strategies based on the provided filters
 */
export const migrateStrategies = async (filters: MigrationFilters): Promise<BulkMigrationResult> => {
  const result: BulkMigrationResult = {
    totalStrategies: 0,
    migratedStrategies: 0,
    failedStrategies: 0,
    warnings: [],
    results: []
  };

  try {
    let strategies: any[] = [];

    // Fetch strategies based on scope
    switch (filters.scope) {
      case 'specific':
        if (!filters.strategyId) {
          throw new Error('Strategy ID is required for specific strategy migration');
        }
        const { data: specificStrategy, error: specificError } = await supabase
          .from('strategies')
          .select('id, name, user_id, strategy')
          .eq('id', filters.strategyId)
          .single();
        
        if (specificError) throw specificError;
        if (specificStrategy) strategies = [specificStrategy];
        break;

      case 'user':
        if (!filters.userId) {
          throw new Error('User ID is required for user strategy migration');
        }
        const { data: userStrategies, error: userError } = await supabase
          .from('strategies')
          .select('id, name, user_id, strategy')
          .eq('user_id', filters.userId);
        
        if (userError) throw userError;
        strategies = userStrategies || [];
        break;

      case 'all':
        const { data: allStrategies, error: allError } = await supabase
          .from('strategies')
          .select('id, name, user_id, strategy');
        
        if (allError) throw allError;
        strategies = allStrategies || [];
        break;
    }

    result.totalStrategies = strategies.length;

    // Process each strategy
    for (const strategy of strategies) {
      try {
        console.log('🚀 Processing strategy:', strategy.name, 'Structure:', strategy.strategy);
        
        // Run migration on the strategy data
        const migrationResult = TimeframeMigrationService.migrateStrategy(strategy.strategy);
        
        if (migrationResult.migrated) {
          // Update the strategy in the database
          const { error: updateError } = await supabase
            .from('strategies')
            .update({ 
              strategy: strategy.strategy,
              updated_at: new Date().toISOString()
            })
            .eq('id', strategy.id);

          if (updateError) {
            throw updateError;
          }

          result.migratedStrategies++;
        }

        result.results.push({
          strategyId: strategy.id,
          strategyName: strategy.name,
          userId: strategy.user_id,
          migrated: migrationResult.migrated,
          createdTimeframes: migrationResult.createdTimeframes.length
        });

        // Collect warnings
        if (migrationResult.warnings.length > 0) {
          result.warnings.push(...migrationResult.warnings.map(w => `${strategy.name}: ${w}`));
        }

      } catch (error) {
        result.failedStrategies++;
        result.results.push({
          strategyId: strategy.id,
          strategyName: strategy.name,
          userId: strategy.user_id,
          migrated: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          createdTimeframes: 0
        });
      }
    }

    return result;

  } catch (error) {
    console.error('Error in bulk migration:', error);
    throw error;
  }
};

/**
 * Get list of strategies for dropdown selection
 */
export const getStrategiesForMigration = async () => {
  try {
    // Get strategies first
    const { data: strategies, error: strategiesError } = await supabase
      .from('strategies')
      .select('id, name, user_id, created_at')
      .order('created_at', { ascending: false });

    if (strategiesError) throw strategiesError;

    if (!strategies || strategies.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(strategies.map(s => s.user_id))];

    // Get user profiles
    const { data: profiles, error: profilesError } = await (supabase as any)
      .from('user_profiles')
      .select('id, email, first_name, last_name')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // Map profiles by ID for quick lookup
    const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Combine strategy data with user profiles
    return strategies.map(strategy => ({
      ...strategy,
      user_profiles: profilesMap.get(strategy.user_id) || {
        email: 'Unknown',
        first_name: null,
        last_name: null
      }
    }));
  } catch (error) {
    console.error('Error getting strategies for migration:', error);
    return [];
  }
};

/**
 * Get list of users who have strategies
 */
export const getUsersWithStrategies = async () => {
  try {
    // Get unique user IDs from strategies
    const { data: strategies, error: strategiesError } = await supabase
      .from('strategies')
      .select('user_id');

    if (strategiesError) throw strategiesError;

    if (!strategies || strategies.length === 0) {
      return [];
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(strategies.map(s => s.user_id))];

    // Get user profiles for those users
    const { data: profiles, error: profilesError } = await (supabase as any)
      .from('user_profiles')
      .select('id, email, first_name, last_name')
      .in('id', uniqueUserIds);

    if (profilesError) throw profilesError;

    return profiles?.map(profile => ({
      user_id: profile.id,
      email: profile.email,
      first_name: profile.first_name,
      last_name: profile.last_name
    })) || [];
  } catch (error) {
    console.error('Error getting users with strategies:', error);
    return [];
  }
};

export const migrationService = {
  migrateStrategies,
  getStrategiesForMigration,
  getUsersWithStrategies,
};