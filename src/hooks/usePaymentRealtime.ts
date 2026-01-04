import { useEffect, useCallback } from 'react';
import { tradelayoutClient } from '@/lib/supabase/tradelayout-client';
import { useToast } from '@/hooks/use-toast';
import { PLAN_CONFIGS, PlanType } from '@/types/billing';

interface UsePaymentRealtimeOptions {
  userId: string | undefined;
  onPlanUpdated: () => void;
}

export const usePaymentRealtime = ({ userId, onPlanUpdated }: UsePaymentRealtimeOptions) => {
  const { toast } = useToast();

  const handlePlanChange = useCallback((payload: any) => {
    console.log('[PaymentRealtime] Plan change detected:', payload);
    
    const newPlan = payload.new;
    const oldPlan = payload.old;
    
    // Check if this is an upgrade (plan changed to a paid plan)
    if (newPlan?.plan && newPlan.plan !== oldPlan?.plan) {
      const planConfig = PLAN_CONFIGS[newPlan.plan as PlanType];
      
      toast({
        title: 'Plan Updated! 🎉',
        description: `Your plan has been upgraded to ${planConfig?.name || newPlan.plan}!`,
      });
      
      onPlanUpdated();
    } else if (newPlan?.status === 'active' && oldPlan?.status !== 'active') {
      // Status changed to active
      toast({
        title: 'Payment Confirmed! ✅',
        description: 'Your payment has been processed successfully.',
      });
      
      onPlanUpdated();
    }
  }, [toast, onPlanUpdated]);

  const handlePaymentCaptured = useCallback((payload: any) => {
    console.log('[PaymentRealtime] Payment captured:', payload);
    
    const payment = payload.new;
    
    if (payment?.status === 'captured') {
      const planType = payment.plan_type as PlanType;
      const planConfig = PLAN_CONFIGS[planType];
      
      toast({
        title: 'Payment Successful! 🎉',
        description: `₹${payment.amount} paid for ${planConfig?.name || planType} plan.`,
      });
      
      // Refresh plan data
      onPlanUpdated();
    }
  }, [toast, onPlanUpdated]);

  useEffect(() => {
    if (!userId) return;

    console.log('[PaymentRealtime] Setting up realtime subscription for user:', userId);

    // Subscribe to user_plans changes for this user
    const planChannel = tradelayoutClient
      .channel(`user-plan-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_plans',
          filter: `user_id=eq.${userId}`,
        },
        handlePlanChange
      )
      .subscribe((status) => {
        console.log('[PaymentRealtime] Plan subscription status:', status);
      });

    // Subscribe to payment_history for this user
    const paymentChannel = tradelayoutClient
      .channel(`user-payments-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payment_history',
          filter: `user_id=eq.${userId}`,
        },
        handlePaymentCaptured
      )
      .subscribe((status) => {
        console.log('[PaymentRealtime] Payment subscription status:', status);
      });

    return () => {
      console.log('[PaymentRealtime] Cleaning up subscriptions');
      tradelayoutClient.removeChannel(planChannel);
      tradelayoutClient.removeChannel(paymentChannel);
    };
  }, [userId, handlePlanChange, handlePaymentCaptured]);
};
