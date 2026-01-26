import { useState, useEffect } from 'react';
import { useClerkUser } from '@/hooks/useClerkUser';
import { getApiConfig, ApiConfig } from '@/lib/api-config';

/**
 * Hook to get current API configuration
 */
export const useApiConfig = () => {
  const { user } = useClerkUser();
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiConfig = await getApiConfig(user?.id);
        setConfig(apiConfig);
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
  }, [user?.id]);

  const refreshConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiConfig = await getApiConfig(user?.id);
      setConfig(apiConfig);
    } catch (err) {
      console.error('Error refreshing API config:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh API configuration');
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    loading,
    error,
    refreshConfig
  };
};
