import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
    
    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.error('[RazorpayWebhook] Missing webhook secret');
      throw new Error('Webhook secret not configured');
    }

    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    console.log('[RazorpayWebhook] Received webhook');

    // Verify signature
    if (signature) {
      const expectedSignature = createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('[RazorpayWebhook] Invalid signature');
        throw new Error('Invalid signature');
      }
      console.log('[RazorpayWebhook] Signature verified');
    }

    const payload = JSON.parse(body);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    console.log(`[RazorpayWebhook] Event: ${event}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (event === 'payment.captured') {
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const amount = paymentEntity.amount / 100; // Convert from paise
      const notes = paymentEntity.notes || {};

      console.log(`[RazorpayWebhook] Payment captured: ${paymentId} for order: ${orderId}`);

      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (orderError) {
        console.error('[RazorpayWebhook] Error fetching order:', orderError);
      }

      const userId = order?.user_id || notes.user_id;
      const planType = order?.plan_type || notes.plan_type;
      const billingCycle = order?.billing_cycle || notes.billing_cycle;

      // Record payment
      const { error: paymentError } = await supabase
        .from('payment_history')
        .insert({
          user_id: userId,
          payment_id: paymentId,
          order_id: orderId,
          amount: amount,
          currency: paymentEntity.currency || 'INR',
          status: 'captured',
          payment_method: paymentEntity.method,
          plan_type: planType,
          billing_cycle: billingCycle,
          razorpay_data: paymentEntity,
        });

      if (paymentError) {
        console.error('[RazorpayWebhook] Error recording payment:', paymentError);
      }

      // Update order status
      await supabase
        .from('payment_orders')
        .update({ status: 'paid', payment_id: paymentId })
        .eq('order_id', orderId);

      // Update user plan
      if (userId && planType) {
        const expiresAt = new Date();
        if (billingCycle === 'yearly') {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else if (billingCycle === 'lifetime') {
          expiresAt.setFullYear(expiresAt.getFullYear() + 100);
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        const { error: planError } = await supabase
          .from('user_plans')
          .upsert({
            user_id: userId,
            plan: planType,
            status: 'active',
            billing_cycle: billingCycle || 'monthly',
            amount_paid: amount,
            payment_provider: 'razorpay',
            payment_id: paymentId,
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
          }, { onConflict: 'user_id' });

        if (planError) {
          console.error('[RazorpayWebhook] Error updating plan:', planError);
        } else {
          console.log(`[RazorpayWebhook] Plan updated for user: ${userId}`);
        }
      }
    } else if (event === 'payment.failed') {
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const notes = paymentEntity.notes || {};

      console.log(`[RazorpayWebhook] Payment failed: ${paymentId}`);

      // Get order details
      const { data: order } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      // Record failed payment
      await supabase
        .from('payment_history')
        .insert({
          user_id: order?.user_id || notes.user_id,
          payment_id: paymentId,
          order_id: orderId,
          amount: paymentEntity.amount / 100,
          currency: paymentEntity.currency || 'INR',
          status: 'failed',
          payment_method: paymentEntity.method,
          error_reason: paymentEntity.error_description,
          razorpay_data: paymentEntity,
        });

      // Update order status
      await supabase
        .from('payment_orders')
        .update({ status: 'failed' })
        .eq('order_id', orderId);

    } else if (event === 'refund.created' || event === 'refund.processed') {
      const refundEntity = payload.payload?.refund?.entity;
      const paymentId = refundEntity.payment_id;

      console.log(`[RazorpayWebhook] Refund: ${refundEntity.id} for payment: ${paymentId}`);

      // Update payment status
      await supabase
        .from('payment_history')
        .update({ 
          status: 'refunded',
          refund_id: refundEntity.id,
          refund_amount: refundEntity.amount / 100,
        })
        .eq('payment_id', paymentId);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[RazorpayWebhook] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
