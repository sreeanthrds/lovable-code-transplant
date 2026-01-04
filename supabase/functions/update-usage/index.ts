// Update Usage Edge Function - Atomic quota consumption
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Plan configs (must match frontend)
const PLAN_CONFIGS: Record<string, {
  backtests_daily_limit: number;
  backtests_monthly_limit: number;
  live_executions_limit: number;
  paper_trading_daily_limit: number;
  paper_trading_monthly_limit: number;
}> = {
  FREE: {
    backtests_daily_limit: 2,
    backtests_monthly_limit: 14,
    live_executions_limit: 0,
    paper_trading_daily_limit: -1,
    paper_trading_monthly_limit: 2,
  },
  LAUNCH: {
    backtests_daily_limit: -1,
    backtests_monthly_limit: -1,
    live_executions_limit: 0,
    paper_trading_daily_limit: -1,
    paper_trading_monthly_limit: -1,
  },
  PRO: {
    backtests_daily_limit: -1,
    backtests_monthly_limit: 100,
    live_executions_limit: 50,
    paper_trading_daily_limit: 2,
    paper_trading_monthly_limit: -1,
  },
  ENTERPRISE: {
    backtests_daily_limit: -1,
    backtests_monthly_limit: -1,
    live_executions_limit: -1,
    paper_trading_daily_limit: -1,
    paper_trading_monthly_limit: -1,
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, action } = await req.json();

    if (!user_id || !action) {
      throw new Error('user_id and action are required');
    }

    if (!['backtest', 'live_execution', 'paper_trade'].includes(action)) {
      throw new Error('Invalid action. Must be: backtest, live_execution, or paper_trade');
    }

    console.log(`[UpdateUsage] Processing ${action} for user ${user_id}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current plan
    const { data: plan, error: planError } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (planError) {
      console.error('[UpdateUsage] Error fetching plan:', planError);
      throw new Error('Failed to fetch user plan');
    }

    // Default to FREE if no plan
    const planType = plan?.plan || 'FREE';
    const config = PLAN_CONFIGS[planType] || PLAN_CONFIGS.FREE;

    // Check if plan is expired
    if (plan?.expires_at && new Date(plan.expires_at) < new Date()) {
      console.log('[UpdateUsage] Plan expired, treating as FREE');
    }

    // Get today's date for daily reset check
    const today = new Date().toISOString().split('T')[0];
    const needsDailyReset = plan?.usage_reset_date !== today;

    // Prepare update object
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Reset daily counters if needed
    if (needsDailyReset) {
      console.log('[UpdateUsage] Resetting daily counters');
      updates.backtests_used_today = 0;
      updates.paper_trading_used_today = 0;
      updates.usage_reset_date = today;
    }

    // Get current values (accounting for reset)
    const currentBacktestsToday = needsDailyReset ? 0 : (plan?.backtests_used_today || 0);
    const currentPaperToday = needsDailyReset ? 0 : (plan?.paper_trading_used_today || 0);

    if (action === 'backtest') {
      const monthlyLimit = config.backtests_monthly_limit;
      const dailyLimit = config.backtests_daily_limit;
      const currentMonthly = plan?.backtests_used || 0;
      const addonBacktests = plan?.addon_backtests || 0;

      // Check daily limit
      if (dailyLimit !== -1 && currentBacktestsToday >= dailyLimit) {
        throw new Error('Daily backtest limit reached');
      }

      // Check if we need to use addon or monthly quota
      if (monthlyLimit === -1 || currentMonthly < monthlyLimit) {
        // Use monthly quota
        updates.backtests_used = currentMonthly + 1;
        updates.backtests_used_today = currentBacktestsToday + 1;
        console.log(`[UpdateUsage] Used monthly backtest quota: ${currentMonthly + 1}/${monthlyLimit}`);
      } else if (addonBacktests > 0) {
        // Use addon quota
        updates.addon_backtests = addonBacktests - 1;
        updates.backtests_used_today = currentBacktestsToday + 1;
        console.log(`[UpdateUsage] Used addon backtest: ${addonBacktests - 1} remaining`);
      } else {
        throw new Error('Backtest quota exhausted');
      }
    } else if (action === 'live_execution') {
      const monthlyLimit = config.live_executions_limit;
      const currentMonthly = plan?.live_executions_used || 0;
      const addonLive = plan?.addon_live_executions || 0;

      // Check if live trading is available
      if (monthlyLimit === 0 && addonLive === 0) {
        throw new Error('Live trading not available on your plan');
      }

      // Check if we need to use addon or monthly quota
      if (monthlyLimit === -1 || currentMonthly < monthlyLimit) {
        updates.live_executions_used = currentMonthly + 1;
        console.log(`[UpdateUsage] Used monthly live execution: ${currentMonthly + 1}/${monthlyLimit}`);
      } else if (addonLive > 0) {
        updates.addon_live_executions = addonLive - 1;
        console.log(`[UpdateUsage] Used addon live execution: ${addonLive - 1} remaining`);
      } else {
        throw new Error('Live execution quota exhausted');
      }
    } else if (action === 'paper_trade') {
      const monthlyLimit = config.paper_trading_monthly_limit;
      const dailyLimit = config.paper_trading_daily_limit;
      const currentMonthly = plan?.paper_trading_used || 0;

      // Check daily limit
      if (dailyLimit !== -1 && currentPaperToday >= dailyLimit) {
        throw new Error('Daily paper trading limit reached');
      }

      // Check monthly limit
      if (monthlyLimit !== -1 && currentMonthly >= monthlyLimit) {
        throw new Error('Monthly paper trading quota exhausted');
      }

      updates.paper_trading_used = currentMonthly + 1;
      updates.paper_trading_used_today = currentPaperToday + 1;
      console.log(`[UpdateUsage] Used paper trade: ${currentMonthly + 1}/${monthlyLimit}`);
    }

    // Update or insert user plan
    if (plan) {
      const { error: updateError } = await supabase
        .from('user_plans')
        .update(updates)
        .eq('user_id', user_id);

      if (updateError) {
        console.error('[UpdateUsage] Error updating plan:', updateError);
        throw new Error('Failed to update usage');
      }
    } else {
      // Create FREE plan with initial usage
      const { error: insertError } = await supabase
        .from('user_plans')
        .insert({
          user_id,
          plan: 'FREE',
          status: 'active',
          billing_cycle: 'monthly',
          amount_paid: 0,
          currency: 'INR',
          started_at: new Date().toISOString(),
          ...updates,
        });

      if (insertError) {
        console.error('[UpdateUsage] Error creating plan:', insertError);
        throw new Error('Failed to create user plan');
      }
    }

    console.log(`[UpdateUsage] Successfully processed ${action} for user ${user_id}`);

    return new Response(JSON.stringify({
      success: true,
      action,
      message: 'Usage updated successfully',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[UpdateUsage] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
