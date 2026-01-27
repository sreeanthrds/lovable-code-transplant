import { useAppAuth } from '@/contexts/AuthContext';

/**
 * Hook for accessing user authentication state
 * Replaces the old Clerk-based useClerkUser hook
 */
export const useClerkUser = () => {
  const { user, userId, isAuthenticated, isLoaded } = useAppAuth();
  
  return {
    userId,
    isAuthenticated,
    isLoading: !isLoaded,
    user,
  };
};
