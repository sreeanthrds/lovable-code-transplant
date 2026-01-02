
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
 * Gets list of all saved strategies for the current user only
 */
export const getStrategiesList = () => {
  try {
    // Get current user ID - required for user-specific storage
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user, cannot load strategies');
      return [];
    }
    
    const strategiesKey = `user_${userId}_strategies`;
    const savedStrategies = localStorage.getItem(strategiesKey);
    const strategies = savedStrategies ? JSON.parse(savedStrategies) : [];
    console.log(`Retrieved ${strategies.length} strategies from localStorage for user: ${userId}`);
    return strategies;
  } catch (error) {
    console.error('Failed to load strategies list:', error);
    return [];
  }
};
