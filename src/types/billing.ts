// =============================================
// BILLING TYPES - Industry Standard
// =============================================

export type PlanType = 'FREE' | 'LAUNCH' | 'PRO' | 'ENTERPRISE' | 'CUSTOM';
export type PlanStatusType = 'active' | 'expired' | 'cancelled' | 'trial' | 'paused';
export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

// Plan hierarchy - higher number = higher tier (cannot downgrade while active)
export const PLAN_HIERARCHY: Record<PlanType, number> = {
  FREE: 0,
  LAUNCH: 1,
  PRO: 2,
  ENTERPRISE: 3,
  CUSTOM: 4,
};

export interface UserPlan {
  id: string;
  user_id: string;
  plan: PlanType;
  status: PlanStatusType;
  
  // Billing details
  billing_cycle: BillingCycle;
  amount_paid: number;
  currency: string;
  
  // Dates
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  trial_ends_at: string | null;
  
  // Usage limits (from plan config, can be overridden)
  backtests_limit: number | null;
  live_executions_limit: number | null;
  paper_trading_limit: number | null;
  
  // Monthly usage tracking
  backtests_used: number;
  live_executions_used: number;
  paper_trading_used: number;
  
  // Daily usage tracking
  backtests_used_today: number;
  paper_trading_used_today: number;
  usage_reset_date: string | null;
  
  // Add-ons (never expire)
  addon_backtests: number;
  addon_live_executions: number;
  
  // Payment info
  payment_provider: string | null;
  payment_id: string | null;
  subscription_id: string | null;
  
  // Admin
  admin_notes: string | null;
  updated_by: string | null;
  
  created_at: string;
  updated_at: string;
}

// Plan configuration with limits
// FREE: 2 backtests/day, 14/month, 2 paper trades/month
// LAUNCH: Unlimited backtests & paper trades for 2 months (promo)
// PRO: 100 backtests/month, 2 paper/day, 50 live/month
export interface PlanConfig {
  name: string;
  backtests_daily_limit: number;    // -1 = unlimited
  backtests_monthly_limit: number;  // -1 = unlimited
  live_executions_limit: number;    // -1 = unlimited
  paper_trading_daily_limit: number;  // -1 = unlimited
  paper_trading_monthly_limit: number; // -1 = unlimited
  price_monthly: number;
  price_yearly: number;
  duration_months?: number;  // For promo plans like LAUNCH
  can_buy_addons: boolean;
  color: string;
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  FREE: {
    name: 'Free',
    backtests_daily_limit: 2,
    backtests_monthly_limit: 14,
    live_executions_limit: 0,
    paper_trading_daily_limit: -1,
    paper_trading_monthly_limit: 2,
    price_monthly: 0,
    price_yearly: 0,
    can_buy_addons: false,
    color: 'secondary',
  },
  LAUNCH: {
    name: 'Launch',
    backtests_daily_limit: -1,      // unlimited
    backtests_monthly_limit: -1,    // unlimited
    live_executions_limit: 0,       // not available yet
    paper_trading_daily_limit: -1,  // unlimited
    paper_trading_monthly_limit: -1, // unlimited
    price_monthly: 1,  // TEST price
    price_yearly: 1,
    duration_months: 2,  // 2 month promo
    can_buy_addons: false,
    color: 'default',
  },
  PRO: {
    name: 'Pro',
    backtests_daily_limit: -1,        // no daily limit
    backtests_monthly_limit: 100,     // 100 backtests per month
    live_executions_limit: 50,        // 50 live trades per month
    paper_trading_daily_limit: 2,     // 2 paper trades per day
    paper_trading_monthly_limit: -1,  // no monthly limit (only daily)
    price_monthly: 499,  // actual price (test: 1)
    price_yearly: 4999,
    can_buy_addons: true,
    color: 'default',
  },
  ENTERPRISE: {
    name: 'Enterprise',
    backtests_daily_limit: -1,
    backtests_monthly_limit: -1,
    live_executions_limit: -1,
    paper_trading_daily_limit: -1,
    paper_trading_monthly_limit: -1,
    price_monthly: 1999,
    price_yearly: 19999,
    can_buy_addons: true,
    color: 'destructive',
  },
  CUSTOM: {
    name: 'Custom',
    backtests_daily_limit: 0,
    backtests_monthly_limit: 0,
    live_executions_limit: 0,
    paper_trading_daily_limit: 0,
    paper_trading_monthly_limit: 0,
    price_monthly: 0,
    price_yearly: 0,
    can_buy_addons: false,
    color: 'outline',
  },
};

// Add-on packages (never expire, consumed after monthly quota)
export const ADDON_PACKAGES = {
  COMBO: {
    name: 'Combo Pack',
    backtests: 30,
    live_executions: 15,
    price: 199,
  },
  BACKTEST_ONLY: {
    name: 'Backtest Pack',
    backtests: 30,
    live_executions: 0,
    price: 99,
  },
  LIVE_ONLY: {
    name: 'Live Trading Pack',
    backtests: 0,
    live_executions: 15,
    price: 149,
  },
};

// Legacy types for compatibility
export interface PlanInfo {
  plan: PlanType | string;
  plan_code: string;
  expires?: number;
  expires_date?: string;
  renews_at?: string;
  status: 'active' | 'expiring' | 'expired';
}

export interface UsageQuotas {
  backtests: {
    daily_used: number;
    daily_limit: number;
    monthly_used: number;
    monthly_limit: number;
    addons_remaining: number;
    resets_in_days: number;
  };
  live_executions: {
    monthly_used: number;
    monthly_limit: number;
    addons_remaining: number;
    resets_in_days: number;
  };
  paper_trading: {
    daily_used: number;
    daily_limit: number;
    resets_at: string;
  };
}

export interface AddOns {
  backtests: number;
  live_executions: number;
  referral_bonus?: {
    backtests: number;
  };
}

export interface PaymentRecord {
  payment_id: string;
  order_id: string;
  amount: number;
  status: 'captured' | 'failed' | 'authorized' | 'refunded';
  date: string;
  description?: string;
}

export interface BillingSummary {
  plan: PlanInfo;
  usage: UsageQuotas;
  addons: AddOns;
}
