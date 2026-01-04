// ============================================
// PAYMENT SERVICE - Razorpay Integration
// Uses TradeLayout Supabase (oonepfqgzpdssfzvokgk)
// ============================================
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

    const { data, error } = await tradelayoutClient.functions.invoke('razorpay-create-order', {
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

// Check payment status by polling the order
const checkPaymentStatus = async (
  orderId: string,
  userId: string,
  planType: PlanType,
  billingCycle: BillingCycle,
  amount: number,
  onSuccess: () => void,
  onPending: () => void
): Promise<boolean> => {
  try {
    const { data, error } = await tradelayoutClient.functions.invoke('razorpay-check-status', {
      body: {
        order_id: orderId,
        user_id: userId,
        plan_type: planType,
        billing_cycle: billingCycle,
        amount,
      },
    });

    if (error) {
      console.error('[PaymentService] Status check error:', error);
      return false;
    }

    if (data?.status === 'paid' || data?.status === 'captured') {
      onSuccess();
      return true;
    } else if (data?.status === 'created' || data?.status === 'attempted') {
      onPending();
      return false;
    }
    return false;
  } catch (err) {
    console.error('[PaymentService] Status check failed:', err);
    return false;
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
  onError: (error: string) => void,
  onPending?: () => void
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
    const orderId = orderResult.order_id!;

    let paymentCompleted = false;
    let pollingInterval: NodeJS.Timeout | null = null;

    const stopPolling = () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    };

    const startPolling = () => {
      if (pollingInterval) return;
      
      let pollCount = 0;
      const maxPolls = 30; // Poll for 2.5 minutes max (30 * 5 seconds)
      
      pollingInterval = setInterval(async () => {
        pollCount++;
        console.log(`[PaymentService] Polling payment status (${pollCount}/${maxPolls})...`);
        
        const completed = await checkPaymentStatus(
          orderId,
          userId,
          planType,
          billingCycle,
          amount,
          () => {
            paymentCompleted = true;
            stopPolling();
            onSuccess();
          },
          () => {
            onPending?.();
          }
        );

        if (completed || pollCount >= maxPolls) {
          stopPolling();
          if (!completed && pollCount >= maxPolls) {
            console.log('[PaymentService] Payment polling timed out');
          }
        }
      }, 5000); // Poll every 5 seconds
    };

    // Open Razorpay checkout
    const options = {
      key: orderResult.key_id,
      amount: orderResult.amount,
      currency: 'INR',
      name: 'TradeLayout',
      description: `${planConfig.name} Plan - ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'}`,
      order_id: orderId,
      prefill: {
        name: userName,
        email: userEmail,
      },
      theme: {
        color: '#6366f1',
      },
      handler: async (response: any) => {
        console.log('[PaymentService] Payment success:', response);
        stopPolling();
        paymentCompleted = true;
        
        // Verify payment
        try {
          const { data: verifyData, error: verifyError } = await tradelayoutClient.functions.invoke('razorpay-verify-payment', {
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
          console.log('[PaymentService] Payment modal dismissed - starting status polling');
          // For UPI/QR payments, start polling to check if payment completed
          if (!paymentCompleted) {
            startPolling();
            onPending?.();
          }
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', (response: any) => {
      console.error('[PaymentService] Payment failed:', response.error);
      stopPolling();
      
      const reason = response.error?.reason;
      // For UPI payments that might still be processing via webhook
      if (reason === 'payment_risk_check_failed') {
        startPolling();
        onPending?.();
      } else {
        onError(response.error.description || 'Payment failed');
      }
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
    console.log('[PaymentService] Fetching payment history for user:', userId);
    
    const { data, error } = await (tradelayoutClient as any)
      .from('payment_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[PaymentService] Error fetching payment history:', error);
      return [];
    }

    console.log('[PaymentService] Payment history fetched:', data?.length || 0, 'records');
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
