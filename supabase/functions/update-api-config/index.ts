import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateConfigRequest {
  userId: string;
  baseUrl: string;
  devUrl?: string;
  useDevUrl?: boolean;
  timeout: number;
  retries: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create client with service role key (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, baseUrl, devUrl, useDevUrl, timeout, retries }: UpdateConfigRequest = await req.json();

    console.log('🔄 Updating API config for user:', userId);

    // Check if user is admin
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (!userRole) {
      console.error('❌ User is not an admin:', userId);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert configuration (service role bypasses RLS)
    const { error } = await supabaseClient
      .from('api_configurations')
      .upsert({
        user_id: userId,
        config_name: 'default',
        base_url: baseUrl,
        dev_url: devUrl || '',
        use_dev_url: useDevUrl || false,
        timeout: timeout,
        retries: retries,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,config_name'
      });

    if (error) {
      console.error('❌ Error updating API config:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ API configuration updated successfully');
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in update-api-config function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
