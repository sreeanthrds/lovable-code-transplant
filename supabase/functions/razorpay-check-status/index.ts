import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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
    const { order_id, user_id, plan_type, billing_cycle, amount } = await req.json();
    console.log(`[RazorpayCheckStatus] Checking order: ${order_id}`);

    if (!order_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('[RazorpayCheckStatus] Missing Razorpay credentials');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch order from Razorpay
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${order_id}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!orderResponse.ok) {
      console.error('[RazorpayCheckStatus] Failed to fetch order:', await orderResponse.text());
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch order status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const order = await orderResponse.json();
    console.log(`[RazorpayCheckStatus] Order status: ${order.status}`);

    // If order is paid, update user plan
    if (order.status === 'paid') {
      console.log('[RazorpayCheckStatus] Order is paid, updating user plan...');
      
      // Get payment details
      const paymentsResponse = await fetch(`https://api.razorpay.com/v1/orders/${order_id}/payments`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      let paymentId = null;
      if (paymentsResponse.ok) {
        const payments = await paymentsResponse.json();
        if (payments.items && payments.items.length > 0) {
          const capturedPayment = payments.items.find((p: any) => p.status === 'captured');
          paymentId = capturedPayment?.id || payments.items[0].id;
        }
      }

      // Update user plan in database
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      const expiresAt = new Date();
      if (billing_cycle === 'yearly') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      // Update user_plans table
      const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_plans?user_id=eq.${user_id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          plan: plan_type,
          billing_cycle: billing_cycle,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      if (!updateResponse.ok) {
        // Try insert if update failed (new user)
        const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_plans`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            user_id: user_id,
            plan: plan_type,
            billing_cycle: billing_cycle,
            status: 'active',
            expires_at: expiresAt.toISOString(),
          }),
        });
        console.log('[RazorpayCheckStatus] Insert response:', insertResponse.status);
      }

      // Record payment history
      await fetch(`${SUPABASE_URL}/rest/v1/payment_history`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          user_id: user_id,
          payment_id: paymentId || `auto_${order_id}`,
          order_id: order_id,
          amount: amount,
          currency: 'INR',
          status: 'captured',
          plan_type: plan_type,
          billing_cycle: billing_cycle,
        }),
      });

      console.log('[RazorpayCheckStatus] User plan updated successfully');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: order.status,
        amount_paid: order.amount_paid,
        amount_due: order.amount_due,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[RazorpayCheckStatus] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});