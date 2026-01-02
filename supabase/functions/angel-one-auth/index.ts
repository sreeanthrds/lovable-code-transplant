import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthRequest {
  connectionId: string;
  userId: string;
  passcode: string;
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

    const { connectionId, userId, passcode }: AuthRequest = await req.json();

    console.log('Angel One authentication request:', { connectionId, userId });

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

    // Make direct HTTP requests to Angel One API
    const loginResponse = await fetch('https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword', {
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
        password: passcode,
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginData.status || !loginData.data) {
      console.error('Angel One login failed:', loginData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: loginData.message || 'Authentication failed' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { jwtToken, refreshToken, feedToken } = loginData.data;
    
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

    console.log('Angel One authentication successful for connection:', connectionId);

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
    console.error('Angel One authentication error:', error);
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
