// ============================================
// PAYMENT SERVICE - Razorpay Integration
// ============================================
import { supabase } from '@/integrations/supabase/client';
import { tradelayoutClient } from '@/lib/supabase/tradelayout-client';
import { PlanType, BillingCycle, PLAN_CONFIGS } from '@/types/billing';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOrder {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  currency: string;
  plan_type: PlanType;
  billing_cycle: BillingCycle;
  status: 'created' | 'paid' | 'failed' | 'expired';
  payment_id?: string;
  created_at: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'captured' | 'failed' | 'authorized' | 'refunded' | 'pending';
  payment_method?: string;
  plan_type?: PlanType;
  billing_cycle?: BillingCycle;
  error_reason?: string;
  refund_id?: string;
  refund_amount?: number;
  created_at: string;
}

// Load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Create order for payment
export const createPaymentOrder = async (
  userId: string,
  userEmail: string,
  planType: PlanType,
  billingCycle: BillingCycle
): Promise<{ success: boolean; order_id?: string; key_id?: string; amount?: number; error?: string }> => {
  try {
    const planConfig = PLAN_CONFIGS[planType];
    const amount = billingCycle === 'yearly' ? planConfig.price_yearly : planConfig.price_monthly;

    console.log(`[PaymentService] Creating order for ${planType} ${billingCycle}: ₹${amount}`);

    const { data, error } = await supabase.functions.invoke('razorpay-create-order', {
      body: {
        amount,
        currency: 'INR',
        plan_type: planType,
        billing_cycle: billingCycle,
        user_id: userId,
        user_email: userEmail,
      },
    });

    if (error) {
      console.error('[PaymentService] Order creation error:', error);
      throw error;
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to create order');
    }

    return {
      success: true,
      order_id: data.order_id,
      key_id: data.key_id,
      amount: data.amount,
    };
  } catch (error: any) {
    console.error('[PaymentService] Error:', error);
    return { success: false, error: error.message };
  }
};

// Initiate payment
export const initiatePayment = async (
  userId: string,
  userEmail: string,
  userName: string,
  planType: PlanType,
  billingCycle: BillingCycle,
  onSuccess: () => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    // Load Razorpay script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      throw new Error('Failed to load Razorpay');
    }

    // Create order
    const orderResult = await createPaymentOrder(userId, userEmail, planType, billingCycle);
    if (!orderResult.success) {
      throw new Error(orderResult.error || 'Failed to create order');
    }

    const planConfig = PLAN_CONFIGS[planType];
    const amount = billingCycle === 'yearly' ? planConfig.price_yearly : planConfig.price_monthly;

    // Open Razorpay checkout
    const options = {
      key: orderResult.key_id,
      amount: orderResult.amount,
      currency: 'INR',
      name: 'TradeLayout',
      description: `${planConfig.name} Plan - ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'}`,
      order_id: orderResult.order_id,
      prefill: {
        name: userName,
        email: userEmail,
      },
      theme: {
        color: '#6366f1',
      },
      handler: async (response: any) => {
        console.log('[PaymentService] Payment success:', response);
        
        // Verify payment
        try {
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-verify-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: userId,
              plan_type: planType,
              billing_cycle: billingCycle,
              amount,
            },
          });

          if (verifyError || !verifyData?.success) {
            throw new Error(verifyData?.error || 'Payment verification failed');
          }

          onSuccess();
        } catch (err: any) {
          onError(err.message || 'Payment verification failed');
        }
      },
      modal: {
        ondismiss: () => {
          console.log('[PaymentService] Payment cancelled');
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', (response: any) => {
      console.error('[PaymentService] Payment failed:', response.error);
      onError(response.error.description || 'Payment failed');
    });
    razorpay.open();

  } catch (error: any) {
    console.error('[PaymentService] Initiate payment error:', error);
    onError(error.message || 'Failed to initiate payment');
  }
};

// Get user payment history
export const getUserPaymentHistory = async (userId: string): Promise<PaymentHistory[]> => {
  try {
    const { data, error } = await (tradelayoutClient as any)
      .from('payment_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[PaymentService] Error fetching payment history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[PaymentService] Error:', error);
    return [];
  }
};

// Get all payment history (admin)
export const getAllPaymentHistory = async (): Promise<PaymentHistory[]> => {
  try {
    const { data, error } = await (tradelayoutClient as any)
      .from('payment_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.error('[PaymentService] Error fetching all payments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[PaymentService] Error:', error);
    return [];
  }
};

export const paymentService = {
  loadRazorpayScript,
  createPaymentOrder,
  initiatePayment,
  getUserPaymentHistory,
  getAllPaymentHistory,
};
