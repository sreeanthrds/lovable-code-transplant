import { useMemo, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useAppAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

// TradeLayout Supabase project credentials (consolidated single database)
const TRADELAYOUT_URL = "https://oonepfqgzpdssfzvokgk.supabase.co";
const TRADELAYOUT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbmVwZnFnenBkc3NmenZva2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk5MTQsImV4cCI6MjA2NTc3NTkxNH0.lDCxgwj36EniiZthzZxhM_8coXQhXlrvv9UzemyYu6A";

/**
 * Hook to get an authenticated Supabase client with Supabase Auth
 * This ensures RLS policies work correctly with Supabase's built-in auth
 * Now points to TradeLayout database (consolidated single database)
 */
export const useSupabaseClient = () => {
  const { session, isAuthenticated } = useAppAuth();

  const getAuthenticatedClient = useCallback(async (): Promise<SupabaseClient<Database>> => {
    if (!session?.access_token) {
      console.warn('🔐 No Supabase session, using unauthenticated client');
      return createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_ANON_KEY);
    }

    try {
      console.log('🔐 Creating authenticated TradeLayout client with Supabase session');
      
      // Create client with Supabase JWT
      return createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_ANON_KEY, {
        global: {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      });
    } catch (error) {
      console.error('🔐 Error creating authenticated client:', error);
      return createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_ANON_KEY);
    }
  }, [session?.access_token]);

  // Unauthenticated client for public queries
  const publicClient = useMemo(() => {
    return createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_ANON_KEY);
  }, []);

  return {
    getAuthenticatedClient,
    publicClient,
    isAuthenticated
  };
};
