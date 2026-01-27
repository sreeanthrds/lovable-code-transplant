import { useState, useEffect } from 'react';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useAdminRole } from '@/hooks/useAdminRole';
import { getApiConfig, getActiveApiUrl, apiClient } from '@/lib/api-config';

interface ApiConfig {
  baseUrl: string;
  localUrl: string;
  useLocalUrl: boolean;
  timeout: number;
  retries: number;
}

/**
 * Hook to get current API configuration with admin context
 * Automatically configures the API client with user context
 */
export const useApiConfig = () => {
  const { user } = useClerkUser();
  const { isAdmin } = useAdminRole();
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [activeUrl, setActiveUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiConfig = await getApiConfig(user?.id);
        setConfig(apiConfig);
        setActiveUrl(getActiveApiUrl(apiConfig, isAdmin));
        
        // Configure the API client with user context
        apiClient.setContext(user?.id, isAdmin);
      } catch (err) {
        console.error('Error loading API config:', err);
        setError(err instanceof Error ? err.message : 'Failed to load API configuration');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadConfig();
    }
  }, [user?.id, isAdmin]);

  const refreshConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiConfig = await getApiConfig(user?.id);
      setConfig(apiConfig);
      setActiveUrl(getActiveApiUrl(apiConfig, isAdmin));
      
      // Re-configure the API client
      apiClient.setContext(user?.id, isAdmin);
    } catch (err) {
      console.error('Error refreshing API config:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh API configuration');
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    activeUrl,
    isUsingLocalUrl: config?.useLocalUrl && !!config?.localUrl && isAdmin,
    loading,
    error,
    refreshConfig
  };
};
