
/**
 * Get current user ID from Clerk
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
 * Deletes a strategy from localStorage (user-specific)
 */
export const deleteStrategy = (strategyId: string): boolean => {
  try {
    // Get current user ID - required for user-specific storage
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user, cannot delete strategy');
      return false;
    }
    
    console.log(`Deleting strategy: ${strategyId} for user: ${userId}`);
    
    // Remove the strategy data (user-specific)
    const strategyKey = `user_${userId}_strategy_${strategyId}`;
    localStorage.removeItem(strategyKey);
    
    // Remove creation date (user-specific)
    const createdKey = `user_${userId}_strategy_${strategyId}_created`;
    localStorage.removeItem(createdKey);
    
    // Update strategies list (user-specific)
    const strategiesKey = `user_${userId}_strategies`;
    const strategiesList = localStorage.getItem(strategiesKey);
    if (strategiesList) {
      const strategies = JSON.parse(strategiesList);
      const updatedStrategies = strategies.filter((s: any) => s.id !== strategyId);
      localStorage.setItem(strategiesKey, JSON.stringify(updatedStrategies));
    }
    
    console.log(`Successfully deleted strategy: ${strategyId} for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete strategy:', error);
    return false;
  }
};
