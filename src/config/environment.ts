/**
 * Environment configuration for multi-environment support
 * 
 * This centralized config enables switching between development and production
 * Supabase projects based on environment variables.
 * 
 * Production: Uses the main TradeLayout Supabase project
 * Development: Uses a separate dev Supabase project (after remix)
 */

// Validate required environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'production';

// Warn if critical env vars are missing
if (!SUPABASE_URL) {
  console.warn('⚠️ VITE_SUPABASE_URL is not set');
}
if (!SUPABASE_ANON_KEY) {
  console.warn('⚠️ VITE_SUPABASE_PUBLISHABLE_KEY is not set');
}

export const config = {
  supabase: {
    url: SUPABASE_URL || '',
    anonKey: SUPABASE_ANON_KEY || '',
    projectId: SUPABASE_PROJECT_ID || '',
  },
  clerk: {
    publishableKey: CLERK_PUBLISHABLE_KEY || '',
  },
  environment: ENVIRONMENT as 'development' | 'production',
  isDev: ENVIRONMENT === 'development',
  isProd: ENVIRONMENT === 'production' || !ENVIRONMENT,
};

// Log environment on startup (only in development)
if (config.isDev) {
  console.log('🔧 Environment:', config.environment);
  console.log('🔧 Supabase Project:', config.supabase.projectId);
}

export default config;
