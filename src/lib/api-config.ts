import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// TradeLayout Supabase project credentials (consolidated single database)
const TRADELAYOUT_URL = "https://oonepfqgzpdssfzvokgk.supabase.co";
const TRADELAYOUT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbmVwZnFnenBkc3NmenZva2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk5MTQsImV4cCI6MjA2NTc3NTkxNH0.lDCxgwj36EniiZthzZxhM_8coXQhXlrvv9UzemyYu6A";

/**
 * API Configuration Service
 * Manages dynamic API URLs using Supabase database storage
 * Works with Clerk authentication by accepting user ID as parameter
 */

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

// Cache configuration for 5 minutes
let cachedConfig: ApiConfig | null = null;
let configExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Clear cache on module load to force fresh fetch from Supabase
cachedConfig = null;
configExpiry = 0;

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
 * Get API configuration from Supabase database
 */
export const getApiConfig = async (userId?: string): Promise<ApiConfig> => {
  const now = Date.now();
  
  // Return cached config if still valid
  if (cachedConfig && now < configExpiry) {
    return cachedConfig;
  }

  try {
    if (!userId) {
      console.log('⚠️ No user ID provided, using default API config');
      return getDefaultConfig();
    }

    // Use authenticated client with Clerk JWT for RLS
    const client = await getAuthenticatedClient();

    const { data: configData, error } = await client
      .from('api_configurations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching API config:', error);
      return getDefaultConfig();
    }

    if (configData) {
      const config: ApiConfig = {
        baseUrl: configData.base_url,
        timeout: configData.timeout,
        retries: configData.retries
      };
      
      cachedConfig = config;
      configExpiry = now + CACHE_DURATION;
      console.log('✅ Using API config from Supabase:', config);
      return config;
    }

    console.log('⚠️ No API config found in Supabase, using default');
    return getDefaultConfig();

  } catch (error) {
    console.error('❌ Error fetching API config:', error);
    return getDefaultConfig();
  }
};

// Get the Supabase edge function proxy URL (TradeLayout project)
const getProxyBaseUrl = (): string => {
  return `${TRADELAYOUT_URL}/functions/v1/backtest-proxy`;
};

const getDefaultConfig = (): ApiConfig => {
  // Try to detect the backend server port dynamically
  // Default to localhost:8001 for development, but this should be overridden by Supabase config
  const defaultConfig: ApiConfig = {
    baseUrl: 'http://localhost:8001',
    timeout: 30000,
    retries: 3
  };

  cachedConfig = defaultConfig;
  configExpiry = Date.now() + CACHE_DURATION;
  return defaultConfig;
};

/**
 * Update API configuration in Supabase database
 * Uses direct database operations with authenticated client (no edge function needed)
 */
export const updateApiConfig = async (config: Partial<ApiConfig>, userId?: string): Promise<boolean> => {
  try {
    if (!userId) {
      console.error('❌ No user ID provided for API config update');
      return false;
    }

    // Get current config to merge with new values
    const currentConfig = await getApiConfig(userId);
    const newConfig = { ...currentConfig, ...config };

    // Use authenticated client with Clerk JWT for RLS
    const client = await getAuthenticatedClient();

    // Update existing configuration (TradeLayout schema uses user_id as unique key)
    const { error } = await client
      .from('api_configurations')
      .update({
        base_url: newConfig.baseUrl,
        timeout: newConfig.timeout,
        retries: newConfig.retries,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error updating API config:', error);
      return false;
    }

    // Clear cache to force refresh
    cachedConfig = newConfig;
    configExpiry = Date.now() + CACHE_DURATION;

    console.log('✅ API configuration updated successfully');
    return true;

  } catch (error) {
    console.error('❌ Error updating API config:', error);
    return false;
  }
};

/**
 * Get the current API base URL
 */
export const getApiBaseUrl = async (userId?: string): Promise<string> => {
  const config = await getApiConfig(userId);
  return config.baseUrl;
};

/**
 * HTTP client with dynamic configuration
 */
export class ApiClient {
  private async getConfig(): Promise<ApiConfig> {
    return await getApiConfig();
  }

  async get(endpoint: string, options?: RequestInit): Promise<Response> {
    const config = await this.getConfig();
    const url = `${config.baseUrl}${endpoint}`;
    
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
    const url = `${config.baseUrl}${endpoint}`;
    
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
    const url = `${config.baseUrl}${endpoint}`;
    
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
    const url = `${config.baseUrl}${endpoint}`;
    
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
 * Clear API configuration cache
 */
export const clearApiConfigCache = (): void => {
  cachedConfig = null;
  configExpiry = 0;
};
