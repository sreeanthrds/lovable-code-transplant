import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// TradeLayout Supabase project credentials (consolidated single database)
const TRADELAYOUT_URL = "https://oonepfqgzpdssfzvokgk.supabase.co";
const TRADELAYOUT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbmVwZnFnenBkc3NmenZva2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk5MTQsImV4cCI6MjA2NTc3NTkxNH0.lDCxgwj36EniiZthzZxhM_8coXQhXlrvv9UzemyYu6A";

// Global configuration user ID constant
const GLOBAL_CONFIG_USER_ID = '__GLOBAL__';

/**
 * API Configuration Service
 * Manages dynamic API URLs using Supabase database storage
 * Works with Clerk authentication by accepting user ID as parameter
 * 
 * URL Resolution:
 * - Admins with useLocalUrl=true -> use their localUrl
 * - Everyone else -> use global baseUrl
 */

interface ApiConfig {
  baseUrl: string;      // Global production URL
  localUrl: string;     // User-specific local development URL (stored in user's own row as base_url)
  useLocalUrl: boolean; // Toggle for admin users (stored in user's own row as use_dev_url)
  timeout: number;
  retries: number;
}

/**
 * Get the active API URL based on configuration and admin status
 */
export const getActiveApiUrl = (config: ApiConfig, isAdmin: boolean = false): string => {
  // Admin users can use their local URL if enabled
  if (isAdmin && config.useLocalUrl && config.localUrl) {
    return config.localUrl;
  }
  return config.baseUrl;
};

// Cache configuration with user-specific keys
const configCache = new Map<string, { config: ApiConfig; expiry: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get Clerk JWT token for Supabase authentication
 */
async function getClerkToken(): Promise<string | null> {
  try {
    const clerk = (window as any).Clerk;
    if (!clerk?.session) {
      return null;
    }
    return await clerk.session.getToken({ template: 'supabase' });
  } catch (error) {
    console.error('Error getting Clerk token:', error);
    return null;
  }
}

/**
 * Create authenticated Supabase client with Clerk JWT
 */
async function getAuthenticatedClient() {
  const token = await getClerkToken();
  
  if (!token) {
    return createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_KEY);
  }
  
  return createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

/**
 * Get global API configuration (used as the production URL for all users)
 */
async function getGlobalConfig(client: any): Promise<ApiConfig | null> {
  const { data, error } = await client
    .from('api_configurations')
    .select('*')
    .eq('user_id', GLOBAL_CONFIG_USER_ID)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    baseUrl: data.base_url,
    localUrl: '',
    useLocalUrl: false,
    timeout: data.timeout,
    retries: data.retries
  };
}

/**
 * Get user-specific API configuration (for admin's local URL settings)
 * Each user has their own row with config_name = 'local'
 * If the row exists, user is using local URL. If not, using global.
 */
async function getUserConfig(client: any, userId: string): Promise<{ localUrl: string; useLocalUrl: boolean } | null> {
  // Skip global config
  if (userId === GLOBAL_CONFIG_USER_ID) {
    return null;
  }

  // Query user's own row (not global)
  const { data, error } = await client
    .from('api_configurations')
    .select('base_url, headers')
    .eq('user_id', userId)
    .neq('user_id', GLOBAL_CONFIG_USER_ID)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user config:', error);
    return null;
  }

  // If row exists with base_url, check headers for toggle state
  if (data?.base_url) {
    const headers = data.headers as { use_local_url?: boolean } | null;
    const useLocalUrl = headers?.use_local_url ?? true; // Default true if row exists
    return {
      localUrl: data.base_url,
      useLocalUrl
    };
  }

  return {
    localUrl: '',
    useLocalUrl: false
  };
}

// Get the Supabase edge function proxy URL (TradeLayout project)
const getProxyBaseUrl = (): string => {
  return 'https://www.tradelayout.com';
};

const getDefaultConfig = (): ApiConfig => {
  return {
    baseUrl: getProxyBaseUrl(),
    localUrl: '',
    useLocalUrl: false,
    timeout: 30000,
    retries: 3
  };
};

/**
 * Get API configuration from Supabase database
 * Combines global config (for baseUrl) with user-specific config (for localUrl)
 */
export const getApiConfig = async (userId?: string): Promise<ApiConfig> => {
  const now = Date.now();
  const cacheKey = userId || 'anonymous';
  
  // Return cached config if still valid
  const cached = configCache.get(cacheKey);
  if (cached && now < cached.expiry) {
    return cached.config;
  }

  try {
    const client = await getAuthenticatedClient();
    
    // Always get the global config for the production baseUrl
    const globalConfig = await getGlobalConfig(client);
    
    if (!globalConfig) {
      const defaultConfig = getDefaultConfig();
      configCache.set(cacheKey, { config: defaultConfig, expiry: now + CACHE_DURATION });
      return defaultConfig;
    }

    // If user is logged in, get their local URL settings
    let localUrl = '';
    let useLocalUrl = false;
    
    if (userId) {
      const userConfig = await getUserConfig(client, userId);
      if (userConfig) {
        localUrl = userConfig.localUrl;
        useLocalUrl = userConfig.useLocalUrl;
      }
    }

    const config: ApiConfig = {
      baseUrl: globalConfig.baseUrl,
      localUrl,
      useLocalUrl,
      timeout: globalConfig.timeout,
      retries: globalConfig.retries
    };

    configCache.set(cacheKey, { config, expiry: now + CACHE_DURATION });
    return config;

  } catch (error) {
    console.error('❌ Error fetching API config:', error);
    return getDefaultConfig();
  }
};

/**
 * Update user's local URL settings (for admin users only)
 * Simple approach: Each admin user gets their own row with:
 * - user_id = admin's user ID
 * - base_url = their local URL
 * - config_name = 'local' to distinguish from global
 * 
 * Global production URL has user_id = '__GLOBAL__' and config_name = 'default'
 */
export const updateUserLocalUrl = async (
  localUrl: string, 
  useLocalUrl: boolean, 
  userId: string
): Promise<boolean> => {
  try {
    const client = await getAuthenticatedClient();

    // Skip if this is global config
    if (userId === GLOBAL_CONFIG_USER_ID) {
      console.error('❌ Cannot update global config with this function');
      return false;
    }

    // First check if user already has a row
    const { data: existingRow } = await client
      .from('api_configurations')
      .select('id')
      .eq('user_id', userId)
      .neq('user_id', GLOBAL_CONFIG_USER_ID)
      .maybeSingle();

    if (useLocalUrl && localUrl.trim()) {
      // User wants to use local URL
      const rowData = {
        user_id: userId,
        base_url: localUrl.trim(),
        headers: { use_local_url: true },
        timeout: 30000,
        retries: 3,
        updated_at: new Date().toISOString()
      };

      if (existingRow?.id) {
        // Update existing row
        const { error } = await client
          .from('api_configurations')
          .update(rowData)
          .eq('id', existingRow.id);

        if (error) {
          console.error('❌ Error updating user local URL:', error);
          return false;
        }
      } else {
        // Insert new row - need config_name for insert
        const { error } = await client
          .from('api_configurations')
          .insert({
            ...rowData,
            config_name: `local_${userId.substring(0, 8)}`
          });

        if (error) {
          console.error('❌ Error inserting user local URL:', error);
          return false;
        }
      }
      console.log('✅ User local URL saved:', localUrl);
    } else {
      // User toggled OFF or cleared URL - delete their config row
      if (existingRow?.id) {
        const { error } = await client
          .from('api_configurations')
          .delete()
          .eq('id', existingRow.id);

        if (error) {
          console.error('❌ Error deleting user local URL config:', error);
        }
      }
      console.log('✅ User local URL config removed (using global)');
    }

    // Clear user's cache
    configCache.delete(userId);
    
    return true;

  } catch (error) {
    console.error('❌ Error updating user local URL:', error);
    return false;
  }
};

/**
 * Update global production URL (for super admin only)
 */
export const updateGlobalProductionUrl = async (baseUrl: string): Promise<boolean> => {
  try {
    const client = await getAuthenticatedClient();

    // Check if global config exists
    const { data: existingConfig } = await client
      .from('api_configurations')
      .select('id')
      .eq('user_id', GLOBAL_CONFIG_USER_ID)
      .maybeSingle();

    if (existingConfig) {
      // Update existing global config
      const { error } = await client
        .from('api_configurations')
        .update({
          base_url: baseUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', GLOBAL_CONFIG_USER_ID);

      if (error) {
        console.error('❌ Error updating global production URL:', error);
        return false;
      }
    } else {
      // Create global config
      const { error } = await client
        .from('api_configurations')
        .insert({
          user_id: GLOBAL_CONFIG_USER_ID,
          base_url: baseUrl,
          config_name: 'Global Production',
          timeout: 30000,
          retries: 3
        });

      if (error) {
        console.error('❌ Error creating global config:', error);
        return false;
      }
    }

    // Clear all caches since global URL affects everyone
    configCache.clear();
    
    console.log('✅ Global production URL updated successfully');
    return true;

  } catch (error) {
    console.error('❌ Error updating global production URL:', error);
    return false;
  }
};

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use updateUserLocalUrl or updateGlobalProductionUrl instead
 */
export const updateApiConfig = async (config: Partial<ApiConfig>, userId?: string): Promise<boolean> => {
  if (!userId) {
    console.error('❌ No user ID provided for API config update');
    return false;
  }

  // If updating local URL settings
  if (config.localUrl !== undefined || config.useLocalUrl !== undefined) {
    return updateUserLocalUrl(
      config.localUrl || '',
      config.useLocalUrl || false,
      userId
    );
  }

  return false;
};

/**
 * Get the current API base URL
 */
export const getApiBaseUrl = async (userId?: string, isAdmin: boolean = false): Promise<string> => {
  const config = await getApiConfig(userId);
  return getActiveApiUrl(config, isAdmin);
};

/**
 * HTTP client with dynamic configuration and admin context
 */
export class ApiClient {
  private userId?: string;
  private isAdmin: boolean = false;

  /**
   * Set user context for URL resolution
   */
  setContext(userId?: string, isAdmin: boolean = false) {
    this.userId = userId;
    this.isAdmin = isAdmin;
  }

  private async getConfig(): Promise<ApiConfig> {
    return await getApiConfig(this.userId);
  }

  async get(endpoint: string, options?: RequestInit): Promise<Response> {
    const config = await this.getConfig();
    const url = `${getActiveApiUrl(config, this.isAdmin)}${endpoint}`;
    
    return this.fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    }, config.retries);
  }

  async post(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    const config = await this.getConfig();
    const url = `${getActiveApiUrl(config, this.isAdmin)}${endpoint}`;
    
    return this.fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options
    }, config.retries);
  }

  async put(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    const config = await this.getConfig();
    const url = `${getActiveApiUrl(config, this.isAdmin)}${endpoint}`;
    
    return this.fetchWithRetry(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options
    }, config.retries);
  }

  async delete(endpoint: string, options?: RequestInit): Promise<Response> {
    const config = await this.getConfig();
    const url = `${getActiveApiUrl(config, this.isAdmin)}${endpoint}`;
    
    return this.fetchWithRetry(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    }, config.retries);
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries: number): Promise<Response> {
    const config = await this.getConfig();
    
    // Add ngrok header to skip browser warning page
    const headers = {
      'ngrok-skip-browser-warning': 'true',
      ...options.headers
    };
    
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        if (response.ok || i === retries) {
          return response;
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        
      } catch (error) {
        if (i === retries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }

    throw new Error(`Failed to fetch ${url} after ${retries} retries`);
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

/**
 * Clear API configuration cache for a specific user or all users
 */
export const clearApiConfigCache = (userId?: string): void => {
  if (userId) {
    configCache.delete(userId);
  } else {
    configCache.clear();
  }
};

// Export the global config user ID for reference
export { GLOBAL_CONFIG_USER_ID };
