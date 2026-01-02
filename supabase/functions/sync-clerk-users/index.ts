import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
};

interface ClerkUser {
  id: string;
  email_addresses: Array<{
    id: string;
    email_address: string;
    verification?: {
      status: string;
    };
  }>;
  first_name?: string;
  last_name?: string;
  username?: string;
  phone_numbers?: Array<{
    id: string;
    phone_number: string;
  }>;
  created_at: number;
  updated_at: number;
  last_sign_in_at?: number;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUser;
}

// Verify webhook signature from Clerk
async function verifyWebhookSignature(
  payload: string,
  headers: Headers,
  webhookSecret: string
): Promise<boolean> {
  try {
    const svixId = headers.get('svix-id');
    const svixTimestamp = headers.get('svix-timestamp');
    const svixSignature = headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Missing required Svix headers');
      return false;
    }

    // Construct the signed payload
    const signedPayload = `${svixId}.${svixTimestamp}.${payload}`;
    
    // Create the expected signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret.split('_')[1]), // Remove whsec_ prefix
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
    
    // Compare signatures
    const providedSignatures = svixSignature.split(' ');
    for (const sig of providedSignatures) {
      const [version, signature] = sig.split(',');
      if (version === 'v1' && signature === expectedSignature) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Sync a single user to Supabase
async function syncUser(clerkUser: ClerkUser, supabase: any): Promise<{ success: boolean; action?: string; error?: string }> {
  try {
    // Get primary email
    const primaryEmail = clerkUser.email_addresses.find(email => 
      email.verification?.status === 'verified'
    ) || clerkUser.email_addresses[0];

    if (!primaryEmail) {
      return { success: false, error: 'No email address found' };
    }

    // Get primary phone
    const primaryPhone = clerkUser.phone_numbers?.[0]?.phone_number;

    // Prepare user profile data
    const userProfileData = {
      id: clerkUser.id,
      email: primaryEmail.email_address,
      first_name: clerkUser.first_name || null,
      last_name: clerkUser.last_name || null,
      username: clerkUser.username || null,
      phone_number: primaryPhone || null,
      created_at: new Date(clerkUser.created_at).toISOString(),
      last_login: clerkUser.last_sign_in_at ? new Date(clerkUser.last_sign_in_at).toISOString() : null,
      login_count: clerkUser.last_sign_in_at ? 1 : 0,
      marketing_consent: false
    };

    // Check if user already exists
    const { data: existingUser, error: selectError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', clerkUser.id)
      .maybeSingle();

    if (selectError) {
      return { success: false, error: selectError.message };
    }

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          email: userProfileData.email,
          first_name: userProfileData.first_name,
          last_name: userProfileData.last_name,
          username: userProfileData.username,
          phone_number: userProfileData.phone_number,
          last_login: userProfileData.last_login,
        })
        .eq('id', clerkUser.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }
      return { success: true, action: 'updated' };
    } else {
      // Create new user
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert(userProfileData);

      if (insertError) {
        return { success: false, error: insertError.message };
      }
      return { success: true, action: 'created' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

// Delete user from Supabase
async function deleteUser(userId: string, supabase: any): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this is a webhook request
    const isWebhook = req.headers.get('svix-id') !== null;
    
    if (isWebhook) {
      console.log('Processing Clerk webhook event...');
      
      // Get webhook secret
      const webhookSecret = Deno.env.get('CLERK_WEBHOOK_SECRET');
      if (!webhookSecret) {
        console.error('CLERK_WEBHOOK_SECRET is not configured');
        return new Response(
          JSON.stringify({ error: 'Webhook secret not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the request body
      const payload = await req.text();
      
      // Verify webhook signature
      const isValidSignature = await verifyWebhookSignature(payload, req.headers, webhookSecret);
      if (!isValidSignature) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Parse the webhook event
      const event: ClerkWebhookEvent = JSON.parse(payload);
      console.log(`Processing webhook event: ${event.type}`);

      let result;
      switch (event.type) {
        case 'user.created':
        case 'user.updated':
          result = await syncUser(event.data, supabase);
          if (result.success) {
            console.log(`User ${result.action}: ${event.data.id}`);
          } else {
            console.error(`Error ${event.type === 'user.created' ? 'creating' : 'updating'} user ${event.data.id}:`, result.error);
          }
          break;
          
        case 'user.deleted':
          result = await deleteUser(event.data.id, supabase);
          if (result.success) {
            console.log(`User deleted: ${event.data.id}`);
          } else {
            console.error(`Error deleting user ${event.data.id}:`, result.error);
          }
          break;
          
        default:
          console.log(`Ignoring webhook event type: ${event.type}`);
          break;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Processed ${event.type} event`,
          userId: event.data.id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Manual sync - fetch all users from Clerk
      console.log('Starting manual Clerk user sync...');
      
      const clerkSecretKey = Deno.env.get('CLERK_SECRET_KEY');
      if (!clerkSecretKey) {
        console.error('CLERK_SECRET_KEY is not configured');
        return new Response(
          JSON.stringify({ error: 'Clerk secret key not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch users from Clerk API
      console.log('Fetching users from Clerk API...');
      const clerkResponse = await fetch('https://api.clerk.com/v1/users', {
        headers: {
          'Authorization': `Bearer ${clerkSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!clerkResponse.ok) {
        const errorText = await clerkResponse.text();
        console.error('Failed to fetch users from Clerk:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch users from Clerk', details: errorText }),
          { status: clerkResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const clerkUsers: ClerkUser[] = await clerkResponse.json();
      console.log(`Found ${clerkUsers.length} users in Clerk`);

      // Sync users to Supabase
      const syncResults = {
        created: 0,
        updated: 0,
        errors: 0,
        total: clerkUsers.length
      };

      for (const clerkUser of clerkUsers) {
        const result = await syncUser(clerkUser, supabase);
        if (result.success) {
          if (result.action === 'created') {
            syncResults.created++;
          } else if (result.action === 'updated') {
            syncResults.updated++;
          }
        } else {
          console.error(`Error syncing user ${clerkUser.id}:`, result.error);
          syncResults.errors++;
        }
      }

      console.log('Manual sync completed:', syncResults);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Manual user sync completed',
          results: syncResults
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in sync-clerk-users function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);