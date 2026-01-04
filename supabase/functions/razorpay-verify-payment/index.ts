import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      user_id,
      plan_type,
      billing_cycle,
      amount
    } = await req.json();

    console.log(`[RazorpayVerify] Verifying payment: ${razorpay_payment_id}`);

    // Verify signature
    const generatedSignature = createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('[RazorpayVerify] Signature mismatch');
      throw new Error('Payment verification failed');
    }

    console.log('[RazorpayVerify] Signature verified successfully');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Record payment
    const { error: paymentError } = await supabase
      .from('payment_history')
      .upsert({
        user_id,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: amount,
        currency: 'INR',
        status: 'captured',
        plan_type,
        billing_cycle,
        payment_method: 'razorpay',
      }, { onConflict: 'payment_id' });

    if (paymentError) {
      console.error('[RazorpayVerify] Error recording payment:', paymentError);
    }

    // Update order status
    await supabase
      .from('payment_orders')
      .update({ status: 'paid', payment_id: razorpay_payment_id })
      .eq('order_id', razorpay_order_id);

    // Update user plan
    const expiresAt = new Date();
    if (billing_cycle === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else if (billing_cycle === 'lifetime') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 100);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    const { error: planError } = await supabase
      .from('user_plans')
      .upsert({
        user_id,
        plan: plan_type,
        status: 'active',
        billing_cycle: billing_cycle || 'monthly',
        amount_paid: amount,
        payment_provider: 'razorpay',
        payment_id: razorpay_payment_id,
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      }, { onConflict: 'user_id' });

    if (planError) {
      console.error('[RazorpayVerify] Error updating plan:', planError);
      throw new Error('Failed to update plan');
    }

    console.log(`[RazorpayVerify] Plan updated for user: ${user_id}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment verified and plan updated',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[RazorpayVerify] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
