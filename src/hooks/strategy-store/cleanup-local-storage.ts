/**
 * Utility to clean up orphaned strategies from localStorage
 * that don't exist in the database
 */

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

/**
 * Removes strategies from localStorage that don't exist in the database
 */
export const cleanupOrphanedStrategies = async (dbStrategyIds: string[]) => {
  const userId = getCurrentUserId();
  if (!userId) {
    console.log('🧹 Cleanup: No user ID, skipping');
    return;
  }

  try {
    const strategiesKey = `user_${userId}_strategies`;
    const localStrategiesJson = localStorage.getItem(strategiesKey);
    
    if (!localStrategiesJson) {
      console.log('🧹 Cleanup: No local strategies found');
      return;
    }

    const localStrategies = JSON.parse(localStrategiesJson);
    const dbIdSet = new Set(dbStrategyIds);
    
    // Find strategies in localStorage that don't exist in the database
    const orphanedStrategies = localStrategies.filter(
      (s: { id: string }) => !dbIdSet.has(s.id)
    );

    if (orphanedStrategies.length === 0) {
      console.log('🧹 Cleanup: No orphaned strategies found');
      return;
    }

    console.log('🧹 Cleanup: Found orphaned strategies:', orphanedStrategies.map((s: any) => s.name));

    // Remove orphaned strategy data from localStorage
    for (const strategy of orphanedStrategies) {
      const strategyKey = `user_${userId}_strategy_${strategy.id}`;
      const createdKey = `user_${userId}_strategy_${strategy.id}_created`;
      localStorage.removeItem(strategyKey);
      localStorage.removeItem(createdKey);
      console.log(`🧹 Cleanup: Removed orphaned strategy "${strategy.name}" from localStorage`);
    }

    // Update the strategies list to only include existing strategies
    const validStrategies = localStrategies.filter(
      (s: { id: string }) => dbIdSet.has(s.id)
    );
    localStorage.setItem(strategiesKey, JSON.stringify(validStrategies));
    
    console.log(`🧹 Cleanup: Cleaned up ${orphanedStrategies.length} orphaned strategies`);
  } catch (error) {
    console.error('🧹 Cleanup: Error cleaning up orphaned strategies:', error);
  }
};

/**
 * Force clear all strategies from localStorage for current user
 * Use this as a last resort
 */
export const clearAllLocalStrategies = () => {
  const userId = getCurrentUserId();
  if (!userId) return;

  const strategiesKey = `user_${userId}_strategies`;
  const localStrategiesJson = localStorage.getItem(strategiesKey);
  
  if (localStrategiesJson) {
    const localStrategies = JSON.parse(localStrategiesJson);
    for (const strategy of localStrategies) {
      localStorage.removeItem(`user_${userId}_strategy_${strategy.id}`);
      localStorage.removeItem(`user_${userId}_strategy_${strategy.id}_created`);
    }
    localStorage.removeItem(strategiesKey);
    console.log('🧹 Cleared all local strategies for user:', userId);
  }
};
