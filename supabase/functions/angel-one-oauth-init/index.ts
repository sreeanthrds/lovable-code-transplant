import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OAuthInitRequest {
  connectionId: string;
  userId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { connectionId, userId }: OAuthInitRequest = await req.json();

    console.log('Angel One OAuth init request:', { connectionId, userId });

    // Fetch connection details from database
    const { data: connection, error: fetchError } = await supabaseClient
      .from('broker_connections')
      .select('api_key, client_code')
      .eq('id', connectionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !connection) {
      console.error('Failed to fetch connection details:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Connection not found or unauthorized' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { api_key: apiKey, client_code: clientCode } = connection;

    // Store state for OAuth callback verification
    const state = `${connectionId}:${userId}:${Date.now()}`;
    
    // Store state in database for callback verification
    await supabaseClient
      .from('broker_connections')
      .update({
        oauth_state: state,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId);

    // Construct Angel One OAuth URL
    const callbackUrl = `${req.headers.get('origin')}/app/broker-connection?callback=angelone`;
    const redirectUrl = `https://smartapi.angelbroking.com/publisher-login?api_key=${apiKey}&state=${encodeURIComponent(state)}&redirect_url=${encodeURIComponent(callbackUrl)}`;

    console.log('OAuth redirect URL generated:', redirectUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        redirect_url: redirectUrl,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Angel One OAuth init error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
