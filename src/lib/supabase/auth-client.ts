import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// TradeLayout Supabase project credentials (consolidated single database)
const TRADELAYOUT_URL = "https://oonepfqgzpdssfzvokgk.supabase.co";
const TRADELAYOUT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbmVwZnFnenBkc3NmenZva2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk5MTQsImV4cCI6MjA2NTc3NTkxNH0.lDCxgwj36EniiZthzZxhM_8coXQhXlrvv9UzemyYu6A";

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

    console.log('🔐 Getting Clerk token for Supabase...');
    
    // Get Clerk JWT token using the Supabase template
    const token = await clerk.session.getToken({ template: 'supabase' });
    
    if (!token) {
      console.error('🔐 Failed to get Clerk token');
      return null;
    }
    
    console.log('🔐 Successfully got Clerk token');
    return token;
  } catch (error) {
    console.error('🔐 Error getting Clerk token:', error);
    return null;
  }
}

/**
 * Create Supabase client with Clerk authentication
 * Now points to TradeLayout database (consolidated single database)
 */
export async function getAuthenticatedSupabaseClient() {
  try {
    const token = await getClerkToken();
    
    if (!token) {
      console.warn('🔐 No token available, using unauthenticated client');
      // Return unauthenticated client as fallback
      return createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_ANON_KEY);
    }

    console.log('🔐 Creating authenticated TradeLayout client with token');
    
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
    // Fallback to unauthenticated client
    return createClient<Database>(TRADELAYOUT_URL, TRADELAYOUT_ANON_KEY);
  }
}
