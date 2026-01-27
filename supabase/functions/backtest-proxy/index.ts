import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Global configuration user ID constant
const GLOBAL_CONFIG_USER_ID = '__GLOBAL__';

// Fallback URL if no config found
const DEFAULT_BACKTEST_URL = Deno.env.get("BACKTEST_API_URL") || "https://www.tradelayout.com";

// Cache for the global API URL to avoid repeated DB calls
let cachedGlobalApiUrl: string | null = null;
let globalCacheExpiry = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

// User-specific cache
const userUrlCache = new Map<string, { url: string; expiry: number }>();

/**
 * Get the global production API URL
 */
async function getGlobalApiUrl(supabase: any): Promise<string> {
  const now = Date.now();
  
  // Return cached URL if still valid
  if (cachedGlobalApiUrl && now < globalCacheExpiry) {
    return cachedGlobalApiUrl;
  }

  try {
    const { data, error } = await supabase
      .from('api_configurations')
      .select('base_url')
      .eq('user_id', GLOBAL_CONFIG_USER_ID)
      .maybeSingle();

    if (error) {
      console.error('[backtest-proxy] Error fetching global API config:', error);
      return DEFAULT_BACKTEST_URL;
    }

    if (data?.base_url) {
      console.log('[backtest-proxy] Using global API URL:', data.base_url);
      cachedGlobalApiUrl = data.base_url;
      globalCacheExpiry = now + CACHE_DURATION;
      return data.base_url;
    }

    console.log('[backtest-proxy] No global config found, using default:', DEFAULT_BACKTEST_URL);
    return DEFAULT_BACKTEST_URL;

  } catch (error) {
    console.error('[backtest-proxy] Error getting global API URL:', error);
    return DEFAULT_BACKTEST_URL;
  }
}

/**
 * Get user-specific local URL if they have one configured and enabled
 * Uses existing columns: base_url for the local URL, headers.use_local_url for the toggle
 */
async function getUserLocalUrl(supabase: any, userId: string): Promise<string | null> {
  const now = Date.now();
  
  // Check user cache
  const cached = userUrlCache.get(userId);
  if (cached && now < cached.expiry) {
    return cached.url || null;
  }

  // Skip global config user
  if (userId === GLOBAL_CONFIG_USER_ID) {
    return null;
  }

  try {
    // Get user's own row (not the global one)
    const { data, error } = await supabase
      .from('api_configurations')
      .select('base_url, headers')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[backtest-proxy] Error fetching user API config:', error);
      return null;
    }

    // User's row: base_url = their local URL, headers.use_local_url = toggle
    const headers = data?.headers as { use_local_url?: boolean } | null;
    if (headers?.use_local_url && data?.base_url) {
      console.log('[backtest-proxy] User has local URL enabled:', data.base_url);
      userUrlCache.set(userId, { url: data.base_url, expiry: now + CACHE_DURATION });
      return data.base_url;
    }

    // Cache that user doesn't have local URL enabled
    userUrlCache.set(userId, { url: '', expiry: now + CACHE_DURATION });
    return null;

  } catch (error) {
    console.error('[backtest-proxy] Error getting user local URL:', error);
    return null;
  }
}

/**
 * Get the appropriate API URL for the request
 * Priority: User local URL (if enabled) > Global production URL > Default fallback
 */
async function getBacktestApiUrl(userId?: string): Promise<string> {
  // Use service role key to bypass RLS
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // If user ID provided, check for their local URL first
  if (userId) {
    const userLocalUrl = await getUserLocalUrl(supabase, userId);
    if (userLocalUrl) {
      return userLocalUrl;
    }
  }

  // Fall back to global production URL
  return await getGlobalApiUrl(supabase);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Get user ID from header if provided
    const userId = req.headers.get('x-user-id') || undefined;
    
    // Get the backtest API URL based on user context
    const BACKTEST_API_BASE = await getBacktestApiUrl(userId);
    
    // Extract path after 'backtest-proxy'
    const pathMatch = url.pathname.match(/backtest-proxy(\/.*)/);
    const path = pathMatch ? pathMatch[1] : '/';
    const targetUrl = `${BACKTEST_API_BASE}${path}${url.search}`;

    console.log(`[backtest-proxy] ${req.method} ${url.pathname}`);
    console.log(`[backtest-proxy] User ID: ${userId || 'anonymous'}`);
    console.log(`[backtest-proxy] Target URL: ${targetUrl}`);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    };

    const options: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      const body = await req.text();
      if (body) {
        options.body = body;
      }
    }

    const response = await fetch(targetUrl, options);
    console.log(`[backtest-proxy] Backend response status: ${response.status}`);

    const contentType = response.headers.get("content-type") || "";
    console.log(`[backtest-proxy] Content-Type: ${contentType}`);

    // For binary downloads (gzip, zip), pass through the binary response
    if (contentType.includes("application/gzip") || contentType.includes("application/zip") || path.includes("/download") || path.includes("/day/")) {
      console.log(`[backtest-proxy] Passing through binary response`);
      const arrayBuffer = await response.arrayBuffer();
      return new Response(arrayBuffer, {
        status: response.status,
        headers: {
          ...corsHeaders,
          "Content-Type": contentType || "application/octet-stream",
          "Content-Disposition": response.headers.get("content-disposition") || "",
        },
      });
    }

    // For SSE (Server-Sent Events) streams, pass through as-is
    if (contentType.includes("text/event-stream") || path.includes("/run") || path.includes("/stream")) {
      console.log(`[backtest-proxy] Streaming SSE response`);
      return new Response(response.body, {
        status: response.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // For JSON responses
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    console.error("[backtest-proxy] Error:", error);
    const message = error instanceof Error ? error.message : "Proxy request failed";
    return new Response(
      JSON.stringify({ error: message, details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
