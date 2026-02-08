import { useMemo, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useClerk } from '@clerk/clerk-react';
import { Database } from '@/integrations/supabase/types';
import { config } from '@/config/environment';

/**
 * Hook to get an authenticated Supabase client with Clerk JWT
 * This ensures RLS policies using get_clerk_user_id() work correctly
 * 
 * Uses environment-based configuration for dev/prod switching
 */
export const useSupabaseClient = () => {
  const { session } = useClerk();

  const getAuthenticatedClient = useCallback(async (): Promise<SupabaseClient<Database>> => {
    if (!session) {
      console.warn('🔐 No Clerk session, using unauthenticated client');
      return createClient<Database>(config.supabase.url, config.supabase.anonKey);
    }

    try {
      // Get Clerk JWT token with Supabase template
      const token = await session.getToken({ template: 'supabase' });
      
      if (!token) {
        console.warn('🔐 Failed to get Clerk token, using unauthenticated client');
        return createClient<Database>(config.supabase.url, config.supabase.anonKey);
      }

      if (config.isDev) {
        console.log('🔐 Creating authenticated client with Clerk JWT');
      }
      
      // Create client with Clerk JWT
      return createClient<Database>(config.supabase.url, config.supabase.anonKey, {
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
    } catch (error) {
      console.error('🔐 Error getting Clerk token:', error);
      return createClient<Database>(config.supabase.url, config.supabase.anonKey);
    }
  }, [session]);

  // Unauthenticated client for public queries
  const publicClient = useMemo(() => {
    return createClient<Database>(config.supabase.url, config.supabase.anonKey);
  }, []);

  return {
    getAuthenticatedClient,
    publicClient,
    isAuthenticated: !!session
  };
};
