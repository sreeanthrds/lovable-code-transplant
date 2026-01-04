// Razorpay Payment Verification Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Plan hierarchy - higher number = higher tier (cannot downgrade while active)
const PLAN_HIERARCHY: Record<string, number> = {
  FREE: 0,
  LAUNCH: 1,
  PRO: 2,
  ENTERPRISE: 3,
  CUSTOM: 4,
};

// Plan duration overrides
const PLAN_DURATION_MONTHS: Record<string, number> = {
  LAUNCH: 2, // 2-month promo
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

    console.log(`[RazorpayVerify] Verifying payment: ${razorpay_payment_id} for plan: ${plan_type}`);

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

    // Get current plan to check hierarchy
    const { data: currentPlan } = await supabase
      .from('user_plans')
      .select('plan, status, expires_at')
      .eq('user_id', user_id)
      .maybeSingle();

    // Check for downgrade attempt (only block if current plan is active)
    if (currentPlan && currentPlan.status === 'active') {
      const isExpired = currentPlan.expires_at && new Date(currentPlan.expires_at) < new Date();
      
      if (!isExpired) {
        const currentLevel = PLAN_HIERARCHY[currentPlan.plan] || 0;
        const newLevel = PLAN_HIERARCHY[plan_type] || 0;

        if (newLevel < currentLevel) {
          console.error(`[RazorpayVerify] Downgrade blocked: ${currentPlan.plan} -> ${plan_type}`);
          throw new Error(`Cannot downgrade from ${currentPlan.plan} to ${plan_type} while current plan is active`);
        }
        
        console.log(`[RazorpayVerify] Plan upgrade allowed: ${currentPlan.plan} -> ${plan_type}`);
      } else {
        console.log('[RazorpayVerify] Current plan expired, allowing any plan selection');
      }
    }

    // Record payment in payment_history
    console.log('[RazorpayVerify] Recording payment to payment_history...');
    const { data: paymentData, error: paymentError } = await supabase
      .from('payment_history')
      .insert({
        user_id,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: amount,
        currency: 'INR',
        status: 'captured',
        plan_type,
        billing_cycle,
        payment_method: 'razorpay',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error('[RazorpayVerify] Error recording payment:', JSON.stringify(paymentError));
      // Don't throw - continue with plan update even if payment history fails
    } else {
      console.log('[RazorpayVerify] Payment recorded successfully:', paymentData?.id);
    }

    // Update order status
    await supabase
      .from('payment_orders')
      .update({ status: 'paid', payment_id: razorpay_payment_id })
      .eq('order_id', razorpay_order_id);

    // Calculate expiry date based on plan type and billing cycle
    const expiresAt = new Date();
    
    // Check for plan-specific duration override (e.g., LAUNCH = 2 months)
    const planDurationOverride = PLAN_DURATION_MONTHS[plan_type];
    
    if (planDurationOverride) {
      expiresAt.setMonth(expiresAt.getMonth() + planDurationOverride);
      console.log(`[RazorpayVerify] Using plan duration override: ${planDurationOverride} months for ${plan_type}`);
    } else if (billing_cycle === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else if (billing_cycle === 'lifetime') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 100);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Reset usage counters on plan change/renewal
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
        // Reset monthly usage counters on new subscription
        backtests_used: 0,
        live_executions_used: 0,
        paper_trading_used: 0,
        backtests_used_today: 0,
        paper_trading_used_today: 0,
        usage_reset_date: new Date().toISOString().split('T')[0],
        // Keep add-ons (they never expire)
      }, { onConflict: 'user_id' });

    if (planError) {
      console.error('[RazorpayVerify] Error updating plan:', planError);
      throw new Error('Failed to update plan');
    }

    console.log(`[RazorpayVerify] Plan updated for user: ${user_id} to ${plan_type}, expires: ${expiresAt.toISOString()}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment verified and plan updated',
      plan: plan_type,
      expires_at: expiresAt.toISOString(),
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
