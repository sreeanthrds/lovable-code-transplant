import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OAuthCallbackRequest {
  state: string;
  auth_token: string;
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

    const { state, auth_token }: OAuthCallbackRequest = await req.json();

    console.log('Angel One OAuth callback:', { state, hasToken: !!auth_token });

    // Parse state to get connectionId and userId
    const [connectionId, userId] = state.split(':');

    // Verify state and fetch connection details
    const { data: connection, error: fetchError } = await supabaseClient
      .from('broker_connections')
      .select('api_key, client_code, oauth_state')
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

    // Verify state matches
    if (connection.oauth_state !== state) {
      console.error('State mismatch');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid OAuth state' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { api_key: apiKey, client_code: clientCode } = connection;

    // Exchange auth_token for JWT tokens
    const tokenResponse = await fetch('https://apiconnect.angelbroking.com/rest/auth/angelbroking/jwt/v1/generateTokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB',
        'X-ClientLocalIP': 'CLIENT_LOCAL_IP',
        'X-ClientPublicIP': 'CLIENT_PUBLIC_IP',
        'X-MACAddress': 'MAC_ADDRESS',
        'X-PrivateKey': apiKey,
      },
      body: JSON.stringify({
        clientcode: clientCode,
        refreshToken: auth_token,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.status || !tokenData.data) {
      console.error('Angel One token exchange failed:', tokenData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: tokenData.message || 'Token exchange failed' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { jwtToken, refreshToken, feedToken } = tokenData.data;
    
    // Calculate token expiry (Angel One tokens typically expire in 24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Update broker connection with tokens
    const { error: updateError } = await supabaseClient
      .from('broker_connections')
      .update({
        access_token: jwtToken,
        refresh_token: refreshToken,
        request_token: feedToken,
        token_expires_at: expiresAt.toISOString(),
        status: 'connected',
        is_active: true,
        oauth_state: null, // Clear the state after successful auth
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId);

    if (updateError) {
      console.error('Failed to update connection:', updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to update connection' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Angel One OAuth authentication successful for connection:', connectionId);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          connectionId,
          expiresAt: expiresAt.toISOString(),
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Angel One OAuth callback error:', error);
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
