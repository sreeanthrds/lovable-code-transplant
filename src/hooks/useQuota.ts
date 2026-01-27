import { useState, useCallback, useEffect } from 'react';
import { useClerkUser } from '@/hooks/useClerkUser';
import { getAuthenticatedTradelayoutClient } from '@/lib/supabase/tradelayout-client';
import { PLAN_CONFIGS, PlanType, UserPlan } from '@/types/billing';

// TradeLayout Supabase project credentials (for edge function calls)
const SUPABASE_URL = "https://oonepfqgzpdssfzvokgk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbmVwZnFnenBkc3NmenZva2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk5MTQsImV4cCI6MjA2NTc3NTkxNH0.lDCxgwj36EniiZthzZxhM_8coXQhXlrvv9UzemyYu6A";

export interface QuotaCheck {
  allowed: boolean;
  reason?: string;
  remaining?: number;
  dailyRemaining?: number;
  monthlyRemaining?: number;
  addonRemaining?: number;
}

export interface QuotaInfo {
  backtests: {
    dailyUsed: number;
    dailyLimit: number;
    monthlyUsed: number;
    monthlyLimit: number;
    addonRemaining: number;
    remaining: number;
  };
  liveExecutions: {
    monthlyUsed: number;
    monthlyLimit: number;
    addonRemaining: number;
    remaining: number;
  };
  paperTrading: {
    dailyUsed: number;
    dailyLimit: number;
    monthlyUsed: number;
    monthlyLimit: number;
    remaining: number;
  };
  plan: PlanType;
  planName: string;
  isExpired: boolean;
  canBuyAddons: boolean;
}

const DEFAULT_QUOTA_INFO: QuotaInfo = {
  backtests: { dailyUsed: 0, dailyLimit: 2, monthlyUsed: 0, monthlyLimit: 14, addonRemaining: 0, remaining: 14 },
  liveExecutions: { monthlyUsed: 0, monthlyLimit: 0, addonRemaining: 0, remaining: 0 },
  paperTrading: { dailyUsed: 0, dailyLimit: -1, monthlyUsed: 0, monthlyLimit: 2, remaining: 2 },
  plan: 'FREE',
  planName: 'Free',
  isExpired: false,
  canBuyAddons: false,
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

// Utility function for exponential backoff retry
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelayMs?: number; maxDelayMs?: number } = {}
): Promise<T> => {
  const { maxRetries = RETRY_CONFIG.maxRetries, baseDelayMs = RETRY_CONFIG.baseDelayMs, maxDelayMs = RETRY_CONFIG.maxDelayMs } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        console.error(`[useQuota] All ${maxRetries + 1} attempts failed:`, lastError);
        throw lastError;
      }
      
      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
      const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
      const delay = Math.min(exponentialDelay + jitter, maxDelayMs);
      
      console.log(`[useQuota] Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const useQuota = () => {
  const { userId } = useClerkUser();
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo>(DEFAULT_QUOTA_INFO);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);

  // Fetch user plan and calculate quota info
  const fetchQuotaInfo = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Use authenticated client for RLS-protected queries
      const client = await getAuthenticatedTradelayoutClient();
      const { data, error } = await client
        .from('user_plans' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('[useQuota] Error fetching plan:', error);
        setQuotaInfo(DEFAULT_QUOTA_INFO);
        setLoading(false);
        return;
      }

      // If no plan or expired, use FREE defaults
      const plan = data as unknown as UserPlan | null;
      const isExpired = plan?.expires_at ? new Date(plan.expires_at) < new Date() : false;
      const effectivePlan: PlanType = (!plan || isExpired) ? 'FREE' : (plan.plan as PlanType);
      const config = PLAN_CONFIGS[effectivePlan];

      setUserPlan(plan);

      // Calculate remaining quotas
      const backtestsMonthlyRemaining = config.backtests_monthly_limit === -1 
        ? Infinity 
        : Math.max(0, config.backtests_monthly_limit - (plan?.backtests_used || 0));
      
      const backtestsDailyRemaining = config.backtests_daily_limit === -1 
        ? Infinity 
        : Math.max(0, config.backtests_daily_limit - (plan?.backtests_used_today || 0));

      const backtestsAddonRemaining = plan?.addon_backtests || 0;
      
      // Total remaining = min of daily remaining, (monthly remaining + addons)
      const backtestsRemaining = config.backtests_monthly_limit === -1 
        ? Infinity 
        : Math.min(
            backtestsDailyRemaining === Infinity ? Infinity : backtestsDailyRemaining,
            backtestsMonthlyRemaining + backtestsAddonRemaining
          );

      const liveMonthlyRemaining = config.live_executions_limit === -1 
        ? Infinity 
        : Math.max(0, config.live_executions_limit - (plan?.live_executions_used || 0));
      const liveAddonRemaining = plan?.addon_live_executions || 0;
      const liveRemaining = config.live_executions_limit === -1 
        ? Infinity 
        : liveMonthlyRemaining + liveAddonRemaining;

      const paperDailyRemaining = config.paper_trading_daily_limit === -1 
        ? Infinity 
        : Math.max(0, config.paper_trading_daily_limit - (plan?.paper_trading_used_today || 0));
      const paperMonthlyRemaining = config.paper_trading_monthly_limit === -1 
        ? Infinity 
        : Math.max(0, config.paper_trading_monthly_limit - (plan?.paper_trading_used || 0));
      const paperRemaining = Math.min(
        paperDailyRemaining === Infinity ? Infinity : paperDailyRemaining,
        paperMonthlyRemaining === Infinity ? Infinity : paperMonthlyRemaining
      );

      setQuotaInfo({
        backtests: {
          dailyUsed: plan?.backtests_used_today || 0,
          dailyLimit: config.backtests_daily_limit,
          monthlyUsed: plan?.backtests_used || 0,
          monthlyLimit: config.backtests_monthly_limit,
          addonRemaining: backtestsAddonRemaining,
          remaining: backtestsRemaining === Infinity ? -1 : backtestsRemaining,
        },
        liveExecutions: {
          monthlyUsed: plan?.live_executions_used || 0,
          monthlyLimit: config.live_executions_limit,
          addonRemaining: liveAddonRemaining,
          remaining: liveRemaining === Infinity ? -1 : liveRemaining,
        },
        paperTrading: {
          dailyUsed: plan?.paper_trading_used_today || 0,
          dailyLimit: config.paper_trading_daily_limit,
          monthlyUsed: plan?.paper_trading_used || 0,
          monthlyLimit: config.paper_trading_monthly_limit,
          remaining: paperRemaining === Infinity ? -1 : paperRemaining,
        },
        plan: effectivePlan,
        planName: config.name,
        isExpired,
        canBuyAddons: config.can_buy_addons,
      });
    } catch (err) {
      console.error('[useQuota] Error:', err);
      setQuotaInfo(DEFAULT_QUOTA_INFO);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchQuotaInfo();
  }, [fetchQuotaInfo]);

  // Check if user can run a backtest
  const canRunBacktest = useCallback(async (): Promise<QuotaCheck> => {
    await fetchQuotaInfo();
    
    const { backtests, isExpired, plan } = quotaInfo;
    
    if (isExpired) {
      return { allowed: false, reason: 'Your plan has expired. Please renew to continue.' };
    }

    // Unlimited plan
    if (backtests.remaining === -1) {
      return { allowed: true, remaining: -1 };
    }

    // Check daily limit first
    if (backtests.dailyLimit !== -1 && backtests.dailyUsed >= backtests.dailyLimit) {
      return { 
        allowed: false, 
        reason: 'Daily backtest limit reached. Try again tomorrow.',
        dailyRemaining: 0,
      };
    }

    // Check monthly + addon limit
    const totalAvailable = (backtests.monthlyLimit === -1 ? Infinity : backtests.monthlyLimit) + backtests.addonRemaining;
    if (backtests.monthlyUsed >= totalAvailable) {
      const upgradeMsg = plan === 'FREE' 
        ? 'Upgrade your plan for more backtests.' 
        : 'Purchase add-ons for additional backtests.';
      return { 
        allowed: false, 
        reason: `Monthly backtest quota exhausted. ${upgradeMsg}`,
        monthlyRemaining: 0,
        addonRemaining: backtests.addonRemaining,
      };
    }

    return { 
      allowed: true, 
      remaining: backtests.remaining,
      dailyRemaining: backtests.dailyLimit === -1 ? -1 : backtests.dailyLimit - backtests.dailyUsed,
      monthlyRemaining: backtests.monthlyLimit === -1 ? -1 : backtests.monthlyLimit - backtests.monthlyUsed,
      addonRemaining: backtests.addonRemaining,
    };
  }, [quotaInfo, fetchQuotaInfo]);

  // Check if user can start a live trading session
  const canRunLiveSession = useCallback(async (): Promise<QuotaCheck> => {
    await fetchQuotaInfo();
    
    const { liveExecutions, isExpired, plan } = quotaInfo;
    
    if (isExpired) {
      return { allowed: false, reason: 'Your plan has expired. Please renew to continue.' };
    }

    // Check if live trading is available for this plan
    if (liveExecutions.monthlyLimit === 0 && liveExecutions.addonRemaining === 0) {
      return { 
        allowed: false, 
        reason: 'Live trading is not available on your current plan. Upgrade to PRO to unlock.',
      };
    }

    // Unlimited
    if (liveExecutions.remaining === -1) {
      return { allowed: true, remaining: -1 };
    }

    // Check quota
    if (liveExecutions.remaining <= 0) {
      const upgradeMsg = plan === 'FREE' 
        ? 'Upgrade to PRO for live trading.' 
        : 'Purchase add-ons for additional live executions.';
      return { 
        allowed: false, 
        reason: `Live execution quota exhausted. ${upgradeMsg}`,
        remaining: 0,
        addonRemaining: liveExecutions.addonRemaining,
      };
    }

    return { 
      allowed: true, 
      remaining: liveExecutions.remaining,
      monthlyRemaining: liveExecutions.monthlyLimit - liveExecutions.monthlyUsed,
      addonRemaining: liveExecutions.addonRemaining,
    };
  }, [quotaInfo, fetchQuotaInfo]);

  // Check if user can run a paper trade
  const canRunPaperTrade = useCallback(async (): Promise<QuotaCheck> => {
    await fetchQuotaInfo();
    
    const { paperTrading, isExpired } = quotaInfo;
    
    if (isExpired) {
      return { allowed: false, reason: 'Your plan has expired. Please renew to continue.' };
    }

    // Unlimited
    if (paperTrading.remaining === -1) {
      return { allowed: true, remaining: -1 };
    }

    // Check daily limit
    if (paperTrading.dailyLimit !== -1 && paperTrading.dailyUsed >= paperTrading.dailyLimit) {
      return { 
        allowed: false, 
        reason: 'Daily paper trading limit reached. Try again tomorrow.',
        dailyRemaining: 0,
      };
    }

    // Check monthly limit
    if (paperTrading.remaining <= 0) {
      return { 
        allowed: false, 
        reason: 'Monthly paper trading quota exhausted. Upgrade your plan for more.',
        remaining: 0,
      };
    }

    return { 
      allowed: true, 
      remaining: paperTrading.remaining,
      dailyRemaining: paperTrading.dailyLimit === -1 ? -1 : paperTrading.dailyLimit - paperTrading.dailyUsed,
      monthlyRemaining: paperTrading.monthlyLimit === -1 ? -1 : paperTrading.monthlyLimit - paperTrading.monthlyUsed,
    };
  }, [quotaInfo, fetchQuotaInfo]);


  // Consume backtest quota via direct database upsert (client-side MVP approach)
  const consumeBacktest = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      const client = await getAuthenticatedTradelayoutClient();
      const today = new Date().toISOString().split('T')[0];
      
      // First, try to get existing plan
      const { data: existingPlan } = await client
        .from('user_plans' as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const plan = existingPlan as any;
      
      // Check if daily reset is needed
      const needsDailyReset = !plan?.usage_reset_date || plan.usage_reset_date !== today;
      const currentBacktestsToday = needsDailyReset ? 0 : (plan?.backtests_used_today || 0);

      const upsertData: any = {
        user_id: userId,
        plan: plan?.plan || 'FREE',
        status: plan?.status || 'active',
        billing_cycle: plan?.billing_cycle || 'monthly',
        amount_paid: plan?.amount_paid || 0,
        currency: plan?.currency || 'INR',
        started_at: plan?.started_at || new Date().toISOString(),
        backtests_used: (plan?.backtests_used || 0) + 1,
        backtests_used_today: currentBacktestsToday + 1,
        usage_reset_date: today,
        live_executions_used: plan?.live_executions_used || 0,
        paper_trading_used: plan?.paper_trading_used || 0,
        paper_trading_used_today: needsDailyReset ? 0 : (plan?.paper_trading_used_today || 0),
        addon_backtests: plan?.addon_backtests || 0,
        addon_live_executions: plan?.addon_live_executions || 0,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await client
        .from('user_plans' as any)
        .upsert(upsertData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('[useQuota] Upsert failed, trying update only:', upsertError);
        
        // Fallback: try update only (for RLS restrictions on insert)
        if (plan) {
          const { error: updateError } = await client
            .from('user_plans' as any)
            .update({
              backtests_used: (plan.backtests_used || 0) + 1,
              backtests_used_today: currentBacktestsToday + 1,
              usage_reset_date: today,
              paper_trading_used_today: needsDailyReset ? 0 : (plan.paper_trading_used_today || 0),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          if (updateError) {
            console.warn('[useQuota] Update also failed:', updateError);
          }
        }
      }

      console.log('[useQuota] Backtest quota consumed successfully');
      await fetchQuotaInfo();
      return true;
    } catch (err) {
      console.error('[useQuota] Error consuming backtest:', err);
      return false;
    }
  }, [userId, fetchQuotaInfo]);

  // Consume live execution quota via direct database update
  const consumeLiveExecution = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      const client = await getAuthenticatedTradelayoutClient();
      
      const { data: existingPlan } = await client
        .from('user_plans' as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const plan = existingPlan as any;

      if (plan) {
        const { error } = await client
          .from('user_plans' as any)
          .update({
            live_executions_used: (plan.live_executions_used || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) {
          console.error('[useQuota] Failed to update live execution usage:', error);
        }
      }

      console.log('[useQuota] Live execution quota consumed successfully');
      await fetchQuotaInfo();
      return true;
    } catch (err) {
      console.error('[useQuota] Error consuming live execution:', err);
      return false;
    }
  }, [userId, fetchQuotaInfo]);

  // Consume paper trading quota via direct database update
  const consumePaperTrade = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      const client = await getAuthenticatedTradelayoutClient();
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existingPlan } = await client
        .from('user_plans' as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const plan = existingPlan as any;
      const needsDailyReset = !plan?.usage_reset_date || plan.usage_reset_date !== today;
      const currentPaperToday = needsDailyReset ? 0 : (plan?.paper_trading_used_today || 0);

      if (plan) {
        const { error } = await client
          .from('user_plans' as any)
          .update({
            paper_trading_used: (plan.paper_trading_used || 0) + 1,
            paper_trading_used_today: currentPaperToday + 1,
            usage_reset_date: today,
            backtests_used_today: needsDailyReset ? 0 : plan.backtests_used_today,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) {
          console.error('[useQuota] Failed to update paper trade usage:', error);
        }
      }

      console.log('[useQuota] Paper trade quota consumed successfully');

      await fetchQuotaInfo();
      return true;
    } catch (err) {
      console.error('[useQuota] Error consuming paper trade:', err);
      return false;
    }
  }, [userId, fetchQuotaInfo]);

  return {
    quotaInfo,
    loading,
    userPlan,
    canRunBacktest,
    canRunLiveSession,
    canRunPaperTrade,
    consumeBacktest,
    consumeLiveExecution,
    consumePaperTrade,
    refreshQuota: fetchQuotaInfo,
  };
};
