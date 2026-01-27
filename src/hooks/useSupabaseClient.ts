import { useMemo, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useClerk } from '@clerk/clerk-react';
import { Database } from '@/integrations/supabase/types';

// TradeLayout Supabase project credentials (consolidated single database)
const TRADELAYOUT_URL = "https://oonepfqgzpdssfzvokgk.supabase.co";
const TRADELAYOUT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbmVwZnFnenBkc3NmenZva2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk5MTQsImV4cCI6MjA2NTc3NTkxNH0.lDCxgwj36EniiZthzZxhM_8coXQhXlrvv9UzemyYu6A";

/**
 * Hook to get an authenticated Supabase client with Clerk JWT
 * This ensures RLS policies using get_clerk_user_id() work correctly
 * Now points to TradeLayout database (consolidated single database)
 */
export const useSupabaseClient = () => {
  const { session } = useClerk();

  const getAuthenticatedClient = useCallback(async (): Promise<SupabaseClient<Database>> => {
    if (!session) {
      console.warn('🔐 No Clerk session, using unauthenticated client');
      return createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_ANON_KEY);
    }

    try {
      // Get Clerk JWT token with Supabase template
      const token = await session.getToken({ template: 'supabase' });
      
      if (!token) {
        console.warn('🔐 Failed to get Clerk token, using unauthenticated client');
        return createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_ANON_KEY);
      }

      console.log('🔐 Creating authenticated TradeLayout client with Clerk JWT');
      
      // Create client with Clerk JWT
      return createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_ANON_KEY, {
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
      return createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_ANON_KEY);
    }
  }, [session]);

  // Unauthenticated client for public queries
  const publicClient = useMemo(() => {
    return createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_ANON_KEY);
  }, []);

  return {
    getAuthenticatedClient,
    publicClient,
    isAuthenticated: !!session
  };
};
