import { useAppAuth } from '@/contexts/AuthContext';

export const useAdminRole = () => {
  const { isAdmin, isAdminLoading } = useAppAuth();
  
  return { isAdmin, loading: isAdminLoading };
};
