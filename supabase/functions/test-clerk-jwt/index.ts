import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Testing Clerk JWT Token Recognition...');
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('📋 Auth header present:', !!authHeader);
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No Authorization header provided',
          recommendation: 'Ensure Clerk token is being passed in the Authorization header'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token length:', token.length);
    
    // Decode JWT payload (without verification - just to see claims)
    let decodedPayload: any = null;
    let clerkUserId: string | null = null;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        decodedPayload = JSON.parse(decoded);
        clerkUserId = decodedPayload.sub || null;
        console.log('📦 Decoded JWT claims:', JSON.stringify(decodedPayload, null, 2));
        console.log('🎯 Extracted Clerk User ID:', clerkUserId);
      }
    } catch (decodeError) {
      console.error('❌ Failed to decode JWT:', decodeError);
    }

    // Create Supabase client with SERVICE ROLE KEY to bypass JWT verification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Test query using the extracted Clerk user ID
    let testQueryResult = null;
    let testQueryError = null;
    if (clerkUserId) {
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, first_name')
        .eq('id', clerkUserId)
        .maybeSingle();
      testQueryResult = data;
      testQueryError = error;
      console.log('📊 User profile query result:', { data, error });
    }

    // Also test with anon key + Clerk JWT to show the signature issue
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseWithClerkJwt = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // This will fail due to signature mismatch
    const { data: userData, error: userError } = await supabaseWithClerkJwt.auth.getUser();
    console.log('👤 Supabase auth.getUser result:', { userData, userError });

    // Prepare diagnostic response
    const diagnostics = {
      success: true,
      timestamp: new Date().toISOString(),
      token_info: {
        token_present: true,
        token_length: token.length,
        is_jwt_format: token.split('.').length === 3,
      },
      decoded_claims: decodedPayload ? {
        sub: decodedPayload.sub || null,
        iss: decodedPayload.iss || null,
        aud: decodedPayload.aud || null,
        exp: decodedPayload.exp ? new Date(decodedPayload.exp * 1000).toISOString() : null,
        iat: decodedPayload.iat ? new Date(decodedPayload.iat * 1000).toISOString() : null,
        azp: decodedPayload.azp || null,
        role: decodedPayload.role || null,
        all_claims: Object.keys(decodedPayload),
      } : null,
      clerk_user_extraction: {
        working: !!clerkUserId,
        extracted_user_id: clerkUserId,
        method: 'JWT payload decode (no signature verification needed)',
      },
      supabase_native_auth: {
        user_recognized: !!userData?.user,
        user_id: userData?.user?.id || null,
        user_error: userError?.message || null,
        note: 'Supabase native auth will NOT recognize Clerk JWTs - this is expected',
      },
      user_profile_lookup: {
        successful: !testQueryError && !!testQueryResult,
        profile_found: !!testQueryResult,
        profile_data: testQueryResult,
        error: testQueryError?.message || null,
      },
      recommendations: [] as string[],
    };

    // Add recommendations
    if (clerkUserId) {
      diagnostics.recommendations.push(
        `✅ Successfully extracted Clerk user ID: ${clerkUserId}`
      );
      diagnostics.recommendations.push(
        'Edge functions can use this ID to authorize database operations'
      );
      if (testQueryResult) {
        diagnostics.recommendations.push(
          `✅ Found matching user profile in database for ${clerkUserId}`
        );
      } else {
        diagnostics.recommendations.push(
          `⚠️ No user profile found in database for ${clerkUserId}. This user may need to be created.`
        );
      }
    }

    if (!userData?.user) {
      diagnostics.recommendations.push(
        'ℹ️ Supabase auth.uid() will NOT work with Clerk. Use edge functions + service role for data access.'
      );
    }

    console.log('✅ Diagnostics complete:', JSON.stringify(diagnostics, null, 2));

    return new Response(
      JSON.stringify(diagnostics, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Error in test-clerk-jwt:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Unknown error',
        stack: err.stack || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
