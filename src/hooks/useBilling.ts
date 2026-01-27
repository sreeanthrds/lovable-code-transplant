// ============================================
// BILLING HOOK - Uses TradeLayout Supabase
// Fetches plan, usage, and payment data
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { useAppAuth } from '@/contexts/AuthContext';
import { tradelayoutClient } from '@/lib/supabase/tradelayout-client';
import { getUserPaymentHistory } from '@/lib/services/payment-service';
import type { BillingSummary, PaymentRecord, PlanInfo, UsageQuotas, AddOns, PlanType } from '@/types/billing';
import { PLAN_CONFIGS } from '@/types/billing';

interface UserPlanRow {
  plan: PlanType;
  status: string;
  billing_cycle: string;
  expires_at: string | null;
  started_at: string | null;
  backtests_used: number;
  live_executions_used: number;
  paper_trading_used: number;
  addon_backtests: number;
  addon_live_executions: number;
}

export const useBilling = () => {
  const { userId } = useAppAuth();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Fetch user plan from Supabase
      const { data: planData, error: planError } = await tradelayoutClient
        .from('user_plans' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planError) {
        console.error('[useBilling] Plan fetch error:', planError);
      }

      const planRow = planData as unknown as UserPlanRow | null;
      const planType: PlanType = planRow?.plan || 'FREE';
      const planConfig = PLAN_CONFIGS[planType];

      // Build plan info
      const planInfo: PlanInfo = {
        plan: planType,
        plan_code: `${planType}_${planRow?.billing_cycle?.toUpperCase() || 'FREE'}`,
        expires: planRow?.expires_at ? new Date(planRow.expires_at).getTime() / 1000 : undefined,
        expires_date: planRow?.expires_at ? new Date(planRow.expires_at).toISOString().split('T')[0] : undefined,
        renews_at: planRow?.expires_at ? new Date(planRow.expires_at).toISOString().split('T')[0] : undefined,
        status: planRow?.status === 'active' ? 'active' : 'expired'
      };

      // Calculate days until reset (assuming monthly reset from started_at)
      const now = new Date();
      const startedAt = planRow?.started_at ? new Date(planRow.started_at) : now;
      const daysSinceStart = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24));
      const daysIntoMonth = daysSinceStart % 30;
      const resetsInDays = 30 - daysIntoMonth;

      // Build usage data
      const usageData: UsageQuotas = {
        backtests: {
          daily_used: 0,
          daily_limit: planConfig.backtests_daily_limit === -1 ? 999 : planConfig.backtests_daily_limit,
          monthly_used: planRow?.backtests_used || 0,
          monthly_limit: planConfig.backtests_monthly_limit === -1 ? 999 : planConfig.backtests_monthly_limit,
          addons_remaining: planRow?.addon_backtests || 0,
          resets_in_days: resetsInDays
        },
        live_executions: {
          monthly_used: planRow?.live_executions_used || 0,
          monthly_limit: planConfig.live_executions_limit === -1 ? 999 : planConfig.live_executions_limit,
          addons_remaining: planRow?.addon_live_executions || 0,
          resets_in_days: resetsInDays
        },
        paper_trading: {
          daily_used: planRow?.paper_trading_used || 0,
          daily_limit: planConfig.paper_trading_monthly_limit === -1 ? 999 : planConfig.paper_trading_monthly_limit,
          resets_at: '12:00 AM'
        }
      };

      // Build add-ons data
      const addonsData: AddOns = {
        backtests: planRow?.addon_backtests || 0,
        live_executions: planRow?.addon_live_executions || 0,
        referral_bonus: {
          backtests: 0
        }
      };

      // Fetch payment history
      const paymentHistory = await getUserPaymentHistory(userId);
      const formattedPayments: PaymentRecord[] = paymentHistory.map(p => ({
        payment_id: p.payment_id,
        order_id: p.order_id,
        amount: p.amount,
        status: p.status === 'pending' ? 'authorized' : p.status as PaymentRecord['status'],
        date: new Date(p.created_at).toISOString().split('T')[0],
        description: `${PLAN_CONFIGS[p.plan_type as PlanType]?.name || p.plan_type || 'Unknown'} ${p.billing_cycle === 'yearly' ? 'Annual' : 'Monthly'} Subscription`
      }));

      setSummary({
        plan: planInfo,
        usage: usageData,
        addons: addonsData
      });
      setPayments(formattedPayments);

    } catch (err) {
      console.error('[useBilling] Fetch error:', err);
      setError('Failed to load billing data');
      
      // Set default FREE plan on error
      setSummary({
        plan: {
          plan: 'FREE',
          plan_code: 'FREE',
          status: 'active'
        },
        usage: {
          backtests: { daily_used: 0, daily_limit: 2, monthly_used: 0, monthly_limit: 5, addons_remaining: 0, resets_in_days: 30 },
          live_executions: { monthly_used: 0, monthly_limit: 0, addons_remaining: 0, resets_in_days: 30 },
          paper_trading: { daily_used: 0, daily_limit: 2, resets_at: '12:00 AM' }
        },
        addons: { backtests: 0, live_executions: 0, referral_bonus: { backtests: 0 } }
      });
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const refresh = useCallback(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  return {
    summary,
    payments,
    loading,
    error,
    refresh
  };
};
