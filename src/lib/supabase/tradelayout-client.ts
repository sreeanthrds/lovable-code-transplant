import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// TradeLayout Supabase project credentials (primary database)
const TRADELAYOUT_URL = "https://oonepfqgzpdssfzvokgk.supabase.co";
const TRADELAYOUT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbmVwZnFnenBkc3NmenZva2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk5MTQsImV4cCI6MjA2NTc3NTkxNH0.lDCxgwj36EniiZthzZxhM_8coXQhXlrvv9UzemyYu6A";

/**
 * Unauthenticated TradeLayout Supabase client
 * Use this for public queries that don't require authentication
 */
export const tradelayoutClient = createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_ANON_KEY);

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
    const client = createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_ANON_KEY, {
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
