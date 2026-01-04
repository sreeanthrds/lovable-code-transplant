import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('[RazorpayCreateOrder] Missing Razorpay credentials');
      throw new Error('Razorpay credentials not configured');
    }

    const { amount, currency = 'INR', plan_type, billing_cycle, user_id, user_email, notes = {} } = await req.json();

    console.log(`[RazorpayCreateOrder] Creating order for user: ${user_id}, plan: ${plan_type}, amount: ${amount}`);

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!user_id) {
      throw new Error('User ID is required');
    }

    // Create Razorpay order
    const authHeader = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    
    const orderData = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${user_id}_${Date.now()}`,
      notes: {
        user_id,
        user_email,
        plan_type,
        billing_cycle,
        ...notes,
      },
    };

    console.log('[RazorpayCreateOrder] Sending to Razorpay:', JSON.stringify(orderData));

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('[RazorpayCreateOrder] Razorpay API error:', errorText);
      throw new Error(`Razorpay API error: ${errorText}`);
    }

    const order = await razorpayResponse.json();
    console.log('[RazorpayCreateOrder] Order created:', order.id);

    // Store order in database for tracking
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase
      .from('payment_orders')
      .insert({
        order_id: order.id,
        user_id,
        amount: amount,
        currency,
        plan_type,
        billing_cycle,
        status: 'created',
        razorpay_order_data: order,
      });

    if (dbError) {
      console.error('[RazorpayCreateOrder] DB error:', dbError);
      // Don't fail the request, order was created successfully
    }

    return new Response(JSON.stringify({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: RAZORPAY_KEY_ID,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[RazorpayCreateOrder] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
