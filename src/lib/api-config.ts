import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// TradeLayout Supabase project credentials (consolidated single database)
const TRADELAYOUT_URL = "https://oonepfqgzpdssfzvokgk.supabase.co";
const TRADELAYOUT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbmVwZnFnenBkc3NmenZva2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk5MTQsImV4cCI6MjA2NTc3NTkxNH0.lDCxgwj36EniiZthzZxhM_8coXQhXlrvv9UzemyYu6A";

// Global configuration user ID constant - matches existing data in table
const GLOBAL_CONFIG_USER_ID = 'default-user';

/**
 * API Configuration Service
 * Manages dynamic API URLs using Supabase database storage
 * Works with Clerk authentication by accepting user ID as parameter
 * 
 * Data Model:
 * - Global production URL: user_id = 'default-user' (shared by all users)
 * - User's local URL: user_id = 'local_{userId}' (admin-specific override)
 * 
 * URL Resolution:
 * - Admins with local override row -> use their localUrl
 * - Everyone else -> use global baseUrl from 'default-user' row
 */

interface ApiConfig {
  baseUrl: string;      // Global production URL (from 'default-user' row)
  localUrl: string;     // User-specific local URL (from 'local_{userId}' row)
  useLocalUrl: boolean; // True if user has a local override row
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
 * Reads from row with user_id = 'default-user'
 */
async function getGlobalConfig(client: any): Promise<ApiConfig | null> {
  const { data, error } = await client
    .from('api_configurations')
    .select('*')
    .eq('user_id', GLOBAL_CONFIG_USER_ID)
    .maybeSingle();

  if (error) {
    console.error('Error fetching global config:', error);
    return null;
  }

  if (!data) {
    console.log('No global config found for user_id:', GLOBAL_CONFIG_USER_ID);
    return null;
  }

  return {
    baseUrl: data.base_url,
    localUrl: '',
    useLocalUrl: false,
    timeout: data.timeout || 30000,
    retries: data.retries || 3
  };
}

/**
 * Get user-specific local URL configuration
 * Looks for a row with user_id = actual userId (e.g., 'user_2yfjTGEKjL7XkklQyBaMP6SN2Lc')
 * If this row exists and has a base_url, user has a local override enabled
 */
async function getUserLocalConfig(client: any, userId: string): Promise<{ localUrl: string; useLocalUrl: boolean } | null> {
  const { data, error } = await client
    .from('api_configurations')
    .select('base_url')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user local config:', error);
    return null;
  }

  // If row exists with base_url, user has local URL enabled
  if (data?.base_url) {
    return {
      localUrl: data.base_url,
      useLocalUrl: true
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
      const userLocalConfig = await getUserLocalConfig(client, userId);
      if (userLocalConfig) {
        localUrl = userLocalConfig.localUrl;
        useLocalUrl = userLocalConfig.useLocalUrl;
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
 * 
 * Data model:
 * - user_id = actual user ID (e.g., 'user_2yfjTGEKjL7XkklQyBaMP6SN2Lc')
 * - base_url = the local/ngrok URL
 * 
 * When enabled: upsert a row with user_id = userId
 * When disabled: clear the base_url or delete the row
 */
export const updateUserLocalUrl = async (
  localUrl: string, 
  useLocalUrl: boolean, 
  userId: string
): Promise<boolean> => {
  try {
    const client = await getAuthenticatedClient();

    console.log('📝 Updating local URL config:', { userId, localUrl, useLocalUrl });

    // Check if user already has a config row
    const { data: existingRow, error: queryError } = await client
      .from('api_configurations')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (queryError) {
      console.error('❌ Error querying existing config:', queryError);
      return false;
    }

    if (useLocalUrl && localUrl.trim()) {
      // User wants to enable local URL
      console.log('🔧 ENABLING local URL - existingRow:', existingRow);
      if (existingRow?.id) {
        // Update existing row
        const { error } = await client
          .from('api_configurations')
          .update({
            base_url: localUrl.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRow.id);

        if (error) {
          console.error('❌ Error updating local URL:', error);
          return false;
        }
        console.log('✅ Updated existing local URL row');
      } else {
        // Insert new row with actual user ID
        const insertPayload = {
          user_id: userId,
          base_url: localUrl.trim(),
          timeout: 30000,
          retries: 3
        } as any;
        console.log('➕ Inserting new row:', JSON.stringify(insertPayload));
        
        const { data: insertedData, error } = await client
          .from('api_configurations')
          .insert(insertPayload)
          .select();

        if (error) {
          console.error('❌ Error inserting local URL:', JSON.stringify(error, null, 2));
          return false;
        }
        console.log('✅ Inserted new local URL row:', insertedData);
      }
    } else {
      // User wants to disable local URL - update to empty or delete
      if (existingRow?.id) {
        const { error } = await client
          .from('api_configurations')
          .update({
            base_url: '',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRow.id);

        if (error) {
          console.error('❌ Error clearing local URL:', error);
          return false;
        }
        console.log('✅ Cleared local URL');
      } else {
        console.log('✅ No local URL row to clear');
      }
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
      // Create global config - only columns that exist in actual database
      const { error } = await client
        .from('api_configurations')
        .insert({
          user_id: GLOBAL_CONFIG_USER_ID,
          base_url: baseUrl,
          timeout: 30000,
          retries: 3
        } as any);

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
