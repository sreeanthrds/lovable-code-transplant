import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { config } from '@/config/environment';

/**
 * Unauthenticated TradeLayout Supabase client
 * Use this for public queries that don't require authentication
 * 
 * Uses environment-based configuration for dev/prod switching
 */
export const tradelayoutClient = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey
);

/**
 * Get Clerk JWT token for Supabase authentication
 */
async function getClerkToken(): Promise<string | null> {
  try {
    const clerk = (window as any).Clerk;
    if (!clerk?.session) {
      console.warn('🔐 No Clerk session found for Supabase auth');
      return null;
    }

    const token = await clerk.session.getToken({ template: 'supabase' });
    
    if (!token) {
      console.error('🔐 Failed to get Clerk token');
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('🔐 Error getting Clerk token:', error);
    return null;
  }
}

/**
 * Create authenticated TradeLayout Supabase client with Clerk JWT
 * Use this for all operations that require user authentication and RLS
 */
export async function getAuthenticatedTradelayoutClient(): Promise<SupabaseClient<Database>> {
  try {
    const token = await getClerkToken();
    
    if (!token) {
      console.warn('🔐 No token available, using unauthenticated client');
      return tradelayoutClient;
    }

    // Create client with Clerk JWT in Authorization header
    const client = createClient<Database>(config.supabase.url, config.supabase.anonKey, {
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
    
    return client;
  } catch (error) {
    console.error('🔐 Error creating authenticated client:', error);
    return tradelayoutClient;
  }
}

// Re-export with legacy names for backward compatibility during migration
export const oldSupabase = tradelayoutClient;
