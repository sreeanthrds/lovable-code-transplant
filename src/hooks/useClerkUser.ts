import { useAppAuth } from '@/contexts/AuthContext';

export const useClerkUser = () => {
  const { user, userId, isAuthenticated, isLoaded, isMockAuth } = useAppAuth();
  
  return {
    userId,
    isAuthenticated,
    isLoading: !isLoaded,
    user,
    isMockAuth
  };
};
