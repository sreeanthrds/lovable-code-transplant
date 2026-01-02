import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Fallback URL if no config found
const DEFAULT_BACKTEST_URL = Deno.env.get("BACKTEST_API_URL") || "https://eb47765da84c.ngrok-free.app";

// Cache for the API URL to avoid repeated DB calls
let cachedApiUrl: string | null = null;
let cacheExpiry = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

async function getBacktestApiUrl(userId?: string): Promise<string> {
  const now = Date.now();
  
  // Return cached URL if still valid
  if (cachedApiUrl && now < cacheExpiry) {
    return cachedApiUrl;
  }

  try {
    // Use service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Try to get the most recent API configuration
    const { data, error } = await supabase
      .from('api_configurations')
      .select('base_url')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[backtest-proxy] Error fetching API config:', error);
      return DEFAULT_BACKTEST_URL;
    }

    if (data?.base_url) {
      console.log('[backtest-proxy] Using API URL from database:', data.base_url);
      cachedApiUrl = data.base_url;
      cacheExpiry = now + CACHE_DURATION;
      return data.base_url;
    }

    console.log('[backtest-proxy] No API config found, using default:', DEFAULT_BACKTEST_URL);
    return DEFAULT_BACKTEST_URL;

  } catch (error) {
    console.error('[backtest-proxy] Error getting API URL:', error);
    return DEFAULT_BACKTEST_URL;
  }
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
    
    // Get the backtest API URL from database
    const BACKTEST_API_BASE = await getBacktestApiUrl(userId);
    
    // Extract path after 'backtest-proxy'
    const pathMatch = url.pathname.match(/backtest-proxy(\/.*)/);
    const path = pathMatch ? pathMatch[1] : '/';
    const targetUrl = `${BACKTEST_API_BASE}${path}${url.search}`;

    console.log(`[backtest-proxy] ${req.method} ${url.pathname}`);
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
