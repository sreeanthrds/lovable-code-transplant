import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// TradeLayout Supabase project credentials (consolidated single database)
const TRADELAYOUT_URL = "https://oonepfqgzpdssfzvokgk.supabase.co";
const TRADELAYOUT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbmVwZnFnenBkc3NmenZva2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk5MTQsImV4cCI6MjA2NTc3NTkxNH0.lDCxgwj36EniiZthzZxhM_8coXQhXlrvv9UzemyYu6A";

/**
 * API Configuration Service
 * Manages dynamic API URLs using Supabase database storage
 * Supports multiple URL pairs (web_url → api_base_url mapping)
 * Works with Clerk authentication by accepting user ID as parameter
 */

// URL pair interface - each pair maps a web URL to an API base URL
export interface UrlPair {
  id?: string;
  webUrl: string;      // The website URL (empty = default)
  apiBaseUrl: string;  // The API base URL for this website
  label?: string;      // Optional label for identification
}

// Legacy interface for backward compatibility
interface LegacyApiConfig {
  baseUrl: string;
  devUrl: string;
  useDevUrl: boolean;
  timeout: number;
  retries: number;
}

// New interface with URL pairs
export interface ApiConfig {
  urlPairs: UrlPair[];
  timeout: number;
  retries: number;
  // Legacy fields for backward compatibility
  baseUrl?: string;
  devUrl?: string;
  useDevUrl?: boolean;
}

/**
 * Get the current website hostname
 */
const getCurrentHostname = (): string => {
  if (typeof window === 'undefined') return '';
  return window.location.hostname;
};

/**
 * Normalize a web URL for comparison
 * Removes protocol, trailing slashes, and converts to lowercase
 */
const normalizeWebUrl = (url: string): string => {
  if (!url || url.trim() === '') return '';
  
  let normalized = url.trim().toLowerCase();
  
  // Remove protocol
  normalized = normalized.replace(/^https?:\/\//, '');
  
  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, '');
  
  // Remove port for standard ports
  normalized = normalized.replace(/:80$/, '').replace(/:443$/, '');
  
  return normalized;
};

/**
 * Check if a hostname matches a web URL pattern
 */
const hostnameMatchesWebUrl = (hostname: string, webUrl: string): boolean => {
  const normalizedHostname = normalizeWebUrl(hostname);
  const normalizedWebUrl = normalizeWebUrl(webUrl);
  
  if (normalizedWebUrl === '') return false;
  
  // Exact match
  if (normalizedHostname === normalizedWebUrl) return true;
  
  // Check if hostname ends with the web URL (subdomain matching)
  if (normalizedHostname.endsWith('.' + normalizedWebUrl)) return true;
  
  // Check for www variants
  const withWww = 'www.' + normalizedWebUrl;
  const withoutWww = normalizedWebUrl.replace(/^www\./, '');
  
  if (normalizedHostname === withWww || normalizedHostname === withoutWww) return true;
  
  return false;
};

/**
 * Get the active API URL based on current hostname and URL pairs configuration
 * Priority: 1. Exact match  2. Subdomain match  3. Default (empty web_url)
 */
export const getActiveApiUrl = (config: ApiConfig): string => {
  const hostname = getCurrentHostname();
  const urlPairs = config.urlPairs || [];
  
  // First try to find an exact or subdomain match
  for (const pair of urlPairs) {
    if (pair.webUrl && hostnameMatchesWebUrl(hostname, pair.webUrl)) {
      console.log(`📍 Matched URL pair: ${pair.webUrl} → ${pair.apiBaseUrl}`);
      return pair.apiBaseUrl;
    }
  }
  
  // Fall back to default (empty web_url)
  const defaultPair = urlPairs.find(p => !p.webUrl || p.webUrl.trim() === '');
  if (defaultPair) {
    console.log(`📍 Using default API URL: ${defaultPair.apiBaseUrl}`);
    return defaultPair.apiBaseUrl;
  }
  
  // Legacy fallback
  if (config.baseUrl) {
    console.log(`📍 Using legacy baseUrl: ${config.baseUrl}`);
    return config.baseUrl;
  }
  
  // Absolute fallback
  return getProxyBaseUrl();
};

// Cache configuration for 5 minutes
let cachedConfig: ApiConfig | null = null;
let configExpiry = 0;
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

// Get the Supabase edge function proxy URL (TradeLayout project)
const getProxyBaseUrl = (): string => {
  return 'https://www.tradelayout.com';
};

const getDefaultConfig = (): ApiConfig => {
  const defaultConfig: ApiConfig = {
    urlPairs: [{
      webUrl: '',
      apiBaseUrl: getProxyBaseUrl(),
      label: 'Default'
    }],
    timeout: 30000,
    retries: 3,
    // Legacy fields
    baseUrl: getProxyBaseUrl(),
    devUrl: '',
    useDevUrl: false
  };

  cachedConfig = defaultConfig;
  configExpiry = Date.now() + CACHE_DURATION;
  return defaultConfig;
};

/**
 * Parse URL pairs from database JSON or legacy format
 */
const parseUrlPairs = (configData: any): UrlPair[] => {
  // Check if new url_pairs column exists
  if (configData.url_pairs && Array.isArray(configData.url_pairs)) {
    return configData.url_pairs.map((pair: any) => ({
      id: pair.id || crypto.randomUUID(),
      webUrl: pair.web_url || pair.webUrl || '',
      apiBaseUrl: pair.api_base_url || pair.apiBaseUrl || '',
      label: pair.label || ''
    }));
  }
  
  // Convert from legacy format (base_url + dev_url)
  const pairs: UrlPair[] = [];
  
  // Production URL as default
  if (configData.base_url) {
    pairs.push({
      id: crypto.randomUUID(),
      webUrl: '',
      apiBaseUrl: configData.base_url,
      label: 'Default (Production)'
    });
  }
  
  // Development URL with lovableproject.com as web URL
  if (configData.dev_url && configData.use_dev_url) {
    pairs.push({
      id: crypto.randomUUID(),
      webUrl: 'lovableproject.com',
      apiBaseUrl: configData.dev_url,
      label: 'Development Preview'
    });
  }
  
  return pairs.length > 0 ? pairs : [{
    id: crypto.randomUUID(),
    webUrl: '',
    apiBaseUrl: getProxyBaseUrl(),
    label: 'Default'
  }];
};

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
      const urlPairs = parseUrlPairs(configData);
      
      const config: ApiConfig = {
        urlPairs,
        timeout: configData.timeout,
        retries: configData.retries,
        // Legacy fields for backward compatibility
        baseUrl: configData.base_url,
        devUrl: (configData as any).dev_url || '',
        useDevUrl: (configData as any).use_dev_url || false
      };
      
      cachedConfig = config;
      configExpiry = now + CACHE_DURATION;
      return config;
    }

    return getDefaultConfig();

  } catch (error) {
    console.error('❌ Error fetching API config:', error);
    return getDefaultConfig();
  }
};

/**
 * Get the current API base URL
 */
export const getApiBaseUrl = async (userId?: string): Promise<string> => {
  const config = await getApiConfig(userId);
  return getActiveApiUrl(config);
};

/**
 * Convert URL pairs to database format
 */
const urlPairsToDbFormat = (pairs: UrlPair[]): any[] => {
  return pairs.map(pair => ({
    id: pair.id || crypto.randomUUID(),
    web_url: pair.webUrl || '',
    api_base_url: pair.apiBaseUrl || '',
    label: pair.label || ''
  }));
};

/**
 * Update API configuration in Supabase database
 * Uses direct database operations with authenticated client (no edge function needed)
 */
export const updateApiConfig = async (config: Partial<ApiConfig> & { urlPairs?: UrlPair[] }, userId?: string): Promise<boolean> => {
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

    // Prepare the update object
    const updateData: any = {
      timeout: newConfig.timeout,
      retries: newConfig.retries,
      updated_at: new Date().toISOString()
    };

    // If URL pairs are provided, save them and update legacy fields
    if (newConfig.urlPairs && newConfig.urlPairs.length > 0) {
      updateData.url_pairs = urlPairsToDbFormat(newConfig.urlPairs);
      
      // Update legacy fields for backward compatibility
      const defaultPair = newConfig.urlPairs.find(p => !p.webUrl || p.webUrl.trim() === '');
      if (defaultPair) {
        updateData.base_url = defaultPair.apiBaseUrl;
      }
      
      const devPair = newConfig.urlPairs.find(p => p.webUrl && p.webUrl.includes('lovableproject.com'));
      if (devPair) {
        updateData.dev_url = devPair.apiBaseUrl;
        updateData.use_dev_url = true;
      }
    } else {
      // Legacy format update
      updateData.base_url = newConfig.baseUrl || '';
      updateData.dev_url = newConfig.devUrl || '';
      updateData.use_dev_url = newConfig.useDevUrl || false;
    }

    // Update existing configuration (TradeLayout schema uses user_id as unique key)
    const { error } = await client
      .from('api_configurations')
      .update(updateData)
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
 * HTTP client with dynamic configuration
 */
export class ApiClient {
  private async getConfig(): Promise<ApiConfig> {
    return await getApiConfig();
  }

  async get(endpoint: string, options?: RequestInit): Promise<Response> {
    const config = await this.getConfig();
    const url = `${getActiveApiUrl(config)}${endpoint}`;
    
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
    const url = `${getActiveApiUrl(config)}${endpoint}`;
    
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
    const url = `${getActiveApiUrl(config)}${endpoint}`;
    
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
    const url = `${getActiveApiUrl(config)}${endpoint}`;
    
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

/**
 * Validate URL pairs - ensure web URLs are unique
 */
export const validateUrlPairs = (pairs: UrlPair[]): { valid: boolean; error?: string } => {
  const webUrls = new Map<string, number>();
  
  for (let i = 0; i < pairs.length; i++) {
    const normalizedUrl = normalizeWebUrl(pairs[i].webUrl);
    
    if (webUrls.has(normalizedUrl)) {
      const existingIndex = webUrls.get(normalizedUrl)!;
      return {
        valid: false,
        error: `Duplicate web URL "${pairs[i].webUrl || '(default)'}": appears in row ${existingIndex + 1} and row ${i + 1}`
      };
    }
    
    webUrls.set(normalizedUrl, i);
  }
  
  // Ensure at least one default (empty web URL) exists
  const hasDefault = pairs.some(p => !p.webUrl || p.webUrl.trim() === '');
  if (!hasDefault) {
    return {
      valid: false,
      error: 'At least one URL pair must have an empty Web URL to serve as the default'
    };
  }
  
  return { valid: true };
};
