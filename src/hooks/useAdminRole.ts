import { useAppAuth } from '@/contexts/AuthContext';

export const useAdminRole = () => {
  const { isAdmin, isAdminLoading, adminCheckFailed, retryAdminCheck } = useAppAuth();
  
  return { isAdmin, loading: isAdminLoading, adminCheckFailed, retryAdminCheck };
};
