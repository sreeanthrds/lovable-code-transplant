/**
 * BACKUP - Created 2026-01-27
 * Stable version of api-config.ts before further changes
 * DO NOT MODIFY THIS FILE
 */

import { supabase } from '@/integrations/supabase/client';

// Global config user ID - used for production URL that all users fall back to
export const GLOBAL_CONFIG_USER_ID = 'default-user';

export interface ApiConfig {
  baseUrl: string;      // Global production URL
  localUrl: string;     // User-specific local URL (only for admins)
  useLocalUrl: boolean; // Toggle for admin users
  timeout: number;
  retries: number;
}

// Cache configuration
let cachedConfig: ApiConfig | null = null;
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// User-specific cache
const userConfigCache = new Map<string, { config: ApiConfig; expiry: number }>();

/**
 * Get the active API URL based on config and admin status
 * Priority: User local URL (if admin + enabled) > Global production URL
 */
export const getActiveApiUrl = (config: ApiConfig, isAdmin: boolean): string => {
  if (isAdmin && config.useLocalUrl && config.localUrl) {
    console.log('[api-config] Using local URL:', config.localUrl);
    return config.localUrl;
  }
  console.log('[api-config] Using global production URL:', config.baseUrl);
  return config.baseUrl;
};

/**
 * Fetch the global production configuration
 */
async function fetchGlobalConfig(): Promise<ApiConfig> {
  const now = Date.now();
  
  // Return cached global config if valid
  if (cachedConfig && now < cacheExpiry) {
    return cachedConfig;
  }

  try {
    const { data, error } = await supabase
      .from('api_configurations')
      .select('base_url, timeout, retries')
      .eq('user_id', GLOBAL_CONFIG_USER_ID)
      .maybeSingle();

    if (error) {
      console.error('[api-config] Error fetching global config:', error);
      return getDefaultConfig();
    }

    if (data) {
      const config: ApiConfig = {
        baseUrl: data.base_url || getProxyBaseUrl(),
        localUrl: '',
        useLocalUrl: false,
        timeout: data.timeout || 30000,
        retries: data.retries || 3,
      };
      
      cachedConfig = config;
      cacheExpiry = now + CACHE_DURATION;
      return config;
    }

    return getDefaultConfig();
  } catch (error) {
    console.error('[api-config] Error in fetchGlobalConfig:', error);
    return getDefaultConfig();
  }
}

/**
 * Fetch user-specific local configuration
 * Users can have a 'local' config row with their own base_url
 */
async function fetchUserLocalConfig(userId: string): Promise<{ localUrl: string; useLocalUrl: boolean } | null> {
  const now = Date.now();
  
  // Check user cache
  const cached = userConfigCache.get(userId);
  if (cached && now < cached.expiry) {
    return {
      localUrl: cached.config.localUrl,
      useLocalUrl: cached.config.useLocalUrl
    };
  }

  // Skip for global config user
  if (userId === GLOBAL_CONFIG_USER_ID) {
    return null;
  }

  try {
    // Get user's local config row (config_name = 'local')
    const { data, error } = await supabase
      .from('api_configurations')
      .select('base_url')
      .eq('user_id', userId)
      .eq('config_name', 'local')
      .maybeSingle();

    if (error) {
      console.error('[api-config] Error fetching user local config:', error);
      return null;
    }

    // If row exists with base_url, user has local enabled
    if (data?.base_url) {
      console.log('[api-config] User has local URL enabled:', data.base_url);
      return {
        localUrl: data.base_url,
        useLocalUrl: true
      };
    }

    return null;
  } catch (error) {
    console.error('[api-config] Error in fetchUserLocalConfig:', error);
    return null;
  }
}

/**
 * Get API configuration for a user
 * Combines global config with user-specific local override
 */
export const getApiConfig = async (userId?: string): Promise<ApiConfig> => {
  // Always get the global config first
  const globalConfig = await fetchGlobalConfig();
  
  // If no user ID, return global config
  if (!userId) {
    return globalConfig;
  }

  // Check for user-specific local config
  const userLocal = await fetchUserLocalConfig(userId);
  
  if (userLocal) {
    // Merge user's local settings with global config
    const mergedConfig: ApiConfig = {
      ...globalConfig,
      localUrl: userLocal.localUrl,
      useLocalUrl: userLocal.useLocalUrl,
    };
    
    // Cache the merged config for this user
    userConfigCache.set(userId, {
      config: mergedConfig,
      expiry: Date.now() + CACHE_DURATION
    });
    
    return mergedConfig;
  }

  return globalConfig;
};

// Get the Supabase edge function proxy URL (TradeLayout project)
const getProxyBaseUrl = (): string => {
  return 'https://api.tradelayout.com';
};

const getDefaultConfig = (): ApiConfig => {
  return {
    baseUrl: getProxyBaseUrl(),
    localUrl: '',
    useLocalUrl: false,
    timeout: 30000,
    retries: 3,
  };
};

/**
 * Update API configuration
 * - For global config (no userId or GLOBAL_CONFIG_USER_ID): updates the global production URL
 * - For user-specific: updates/creates the user's local config row
 */
export const updateApiConfig = async (
  config: Partial<ApiConfig>,
  userId?: string,
  isLocalConfig: boolean = false
): Promise<void> => {
  const targetUserId = userId || GLOBAL_CONFIG_USER_ID;
  
  console.log('[api-config] updateApiConfig called:', { config, userId, isLocalConfig, targetUserId });

  try {
    if (isLocalConfig && userId && userId !== GLOBAL_CONFIG_USER_ID) {
      // User is updating their local config
      if (config.useLocalUrl && config.localUrl) {
        // Enable local: upsert user's local config row
        console.log('[api-config] Enabling local URL for user:', userId);
        const { error } = await supabase
          .from('api_configurations')
          .upsert({
            user_id: userId,
            config_name: 'local',
            base_url: config.localUrl,
            timeout: config.timeout || 30000,
            retries: config.retries || 3,
          }, {
            onConflict: 'user_id,config_name'
          });

        if (error) {
          console.error('[api-config] Error upserting user local config:', error);
          throw error;
        }
      } else {
        // Disable local: delete the user's local config row
        console.log('[api-config] Disabling local URL for user:', userId);
        const { error } = await supabase
          .from('api_configurations')
          .delete()
          .eq('user_id', userId)
          .eq('config_name', 'local');

        if (error) {
          console.error('[api-config] Error deleting user local config:', error);
          throw error;
        }
      }
      
      // Clear user cache
      userConfigCache.delete(userId);
    } else {
      // Updating global production config
      console.log('[api-config] Updating global production config');
      const { error } = await supabase
        .from('api_configurations')
        .upsert({
          user_id: GLOBAL_CONFIG_USER_ID,
          config_name: 'production',
          base_url: config.baseUrl,
          timeout: config.timeout || 30000,
          retries: config.retries || 3,
        }, {
          onConflict: 'user_id,config_name'
        });

      if (error) {
        console.error('[api-config] Error upserting global config:', error);
        throw error;
      }
      
      // Clear global cache
      cachedConfig = null;
      cacheExpiry = 0;
    }
  } catch (error) {
    console.error('[api-config] Error in updateApiConfig:', error);
    throw error;
  }
};

/**
 * Clear all configuration caches
 */
export const clearConfigCache = (): void => {
  cachedConfig = null;
  cacheExpiry = 0;
  userConfigCache.clear();
};

/**
 * API Client class for making requests through the backtest proxy
 */
export class ApiClient {
  private userId?: string;
  private isAdmin: boolean = false;

  setContext(userId?: string, isAdmin: boolean = false) {
    this.userId = userId;
    this.isAdmin = isAdmin;
    console.log('[ApiClient] Context set:', { userId, isAdmin });
  }

  private async getConfig(): Promise<ApiConfig> {
    return await getApiConfig(this.userId);
  }

  async getActiveUrl(): Promise<string> {
    const config = await this.getConfig();
    return getActiveApiUrl(config, this.isAdmin);
  }

  async get(endpoint: string, options?: RequestInit): Promise<Response> {
    const url = await this.getActiveUrl();
    const fullUrl = `${url}${endpoint}`;
    console.log('[ApiClient] GET:', fullUrl);
    
    return fetch(fullUrl, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(this.userId && { 'x-user-id': this.userId }),
        ...options?.headers,
      },
    });
  }

  async post(endpoint: string, body?: unknown, options?: RequestInit): Promise<Response> {
    const url = await this.getActiveUrl();
    const fullUrl = `${url}${endpoint}`;
    console.log('[ApiClient] POST:', fullUrl);
    
    return fetch(fullUrl, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(this.userId && { 'x-user-id': this.userId }),
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

// Singleton instance
export const apiClient = new ApiClient();
