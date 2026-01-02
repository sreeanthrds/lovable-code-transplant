import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';

export interface StrategyVersion {
  id: string;
  strategy_id: string;
  user_id: string;
  version_number: number;
  name: string;
  strategy: {
    nodes: any[];
    edges: any[];
  };
  created_at: string;
}

// Get current user ID from window context (Clerk)
const getCurrentUserId = () => {
  try {
    const clerk = (window as any).Clerk;
    if (clerk && clerk.user) {
      return clerk.user.id;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

export const versionHistoryService = {
  /**
   * Save a new version of the strategy
   * Automatically increments version number and triggers cleanup of old versions
   */
  async saveVersion(
    strategyId: string,
    strategyName: string,
    nodes: any[],
    edges: any[]
  ): Promise<boolean> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('❌ No user ID available for saving version');
        return false;
      }

      // Get the latest version number for this strategy
      const { data: latestVersion, error: fetchError } = await supabase
        .from('strategy_versions')
        .select('version_number')
        .eq('strategy_id', strategyId)
        .eq('user_id', userId)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error fetching latest version:', fetchError);
        return false;
      }

      const nextVersionNumber = (latestVersion?.version_number || 0) + 1;

      console.log('📚 Saving strategy version:', {
        strategyId,
        versionNumber: nextVersionNumber,
        nodeCount: nodes.length,
        edgeCount: edges.length
      });

      // Insert the new version
      const { error: insertError } = await supabase
        .from('strategy_versions')
        .insert({
          strategy_id: strategyId,
          user_id: userId,
          version_number: nextVersionNumber,
          name: strategyName,
          strategy: { nodes, edges }
        });

      if (insertError) {
        console.error('❌ Error saving version:', insertError);
        return false;
      }

      console.log('✅ Successfully saved version', nextVersionNumber);
      return true;
    } catch (error) {
      console.error('💥 Error in saveVersion:', error);
      return false;
    }
  },

  /**
   * Get all versions for a strategy (limited to last 10 by trigger)
   */
  async getVersions(strategyId: string): Promise<StrategyVersion[]> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('❌ No user ID available for loading versions');
        return [];
      }

      const { data, error } = await supabase
        .from('strategy_versions')
        .select('*')
        .eq('strategy_id', strategyId)
        .eq('user_id', userId)
        .order('version_number', { ascending: false });

      if (error) {
        console.error('❌ Error loading versions:', error);
        return [];
      }

      console.log('📚 Loaded versions:', data?.length || 0);
      return (data || []) as StrategyVersion[];
    } catch (error) {
      console.error('💥 Error in getVersions:', error);
      return [];
    }
  },

  /**
   * Get a specific version by ID
   */
  async getVersionById(versionId: string): Promise<StrategyVersion | null> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('❌ No user ID available for loading version');
        return null;
      }

      const { data, error } = await supabase
        .from('strategy_versions')
        .select('*')
        .eq('id', versionId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading version:', error);
        return null;
      }

      return data as StrategyVersion | null;
    } catch (error) {
      console.error('💥 Error in getVersionById:', error);
      return null;
    }
  },

  /**
   * Restore a strategy from a specific version
   */
  async restoreVersion(versionId: string): Promise<{ nodes: any[]; edges: any[] } | null> {
    try {
      const version = await this.getVersionById(versionId);
      if (!version) {
        console.error('❌ Version not found:', versionId);
        return null;
      }

      const strategyData = typeof version.strategy === 'string'
        ? JSON.parse(version.strategy)
        : version.strategy;

      console.log('🔄 Restoring version:', {
        versionId,
        versionNumber: version.version_number,
        nodeCount: strategyData?.nodes?.length || 0,
        edgeCount: strategyData?.edges?.length || 0
      });

      return {
        nodes: strategyData?.nodes || [],
        edges: strategyData?.edges || []
      };
    } catch (error) {
      console.error('💥 Error in restoreVersion:', error);
      return null;
    }
  }
};
