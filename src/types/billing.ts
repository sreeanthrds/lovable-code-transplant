// =============================================
// BILLING TYPES - Industry Standard
// =============================================

export type PlanType = 'FREE' | 'LAUNCH' | 'PRO' | 'ENTERPRISE' | 'CUSTOM';
export type PlanStatusType = 'active' | 'expired' | 'cancelled' | 'trial' | 'paused';
export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

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
  
  // Usage limits
  backtests_limit: number | null;
  live_executions_limit: number | null;
  paper_trading_limit: number | null;
  
  // Usage tracking
  backtests_used: number;
  live_executions_used: number;
  paper_trading_used: number;
  
  // Add-ons
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

// Plan configuration with default limits
export const PLAN_CONFIGS: Record<PlanType, {
  name: string;
  backtests_limit: number;
  live_executions_limit: number;
  paper_trading_limit: number;
  price_monthly: number;
  price_yearly: number;
  color: string;
}> = {
  FREE: {
    name: 'Free',
    backtests_limit: 5,
    live_executions_limit: 0,
    paper_trading_limit: 2,
    price_monthly: 0,
    price_yearly: 0,
    color: 'secondary',
  },
  LAUNCH: {
    name: 'Launch',
    backtests_limit: 25,
    live_executions_limit: 10,
    paper_trading_limit: 5,
    price_monthly: 1, // TEST: ₹1 for testing
    price_yearly: 1,  // TEST: ₹1 for testing
    color: 'default',
  },
  PRO: {
    name: 'Pro',
    backtests_limit: 100,
    live_executions_limit: 50,
    paper_trading_limit: 10,
    price_monthly: 1, // TEST: ₹1 for testing
    price_yearly: 1,  // TEST: ₹1 for testing
    color: 'default',
  },
  ENTERPRISE: {
    name: 'Enterprise',
    backtests_limit: -1, // unlimited
    live_executions_limit: -1,
    paper_trading_limit: -1,
    price_monthly: 1, // TEST: ₹1 for testing
    price_yearly: 1,  // TEST: ₹1 for testing
    color: 'destructive',
  },
  CUSTOM: {
    name: 'Custom',
    backtests_limit: 0,
    live_executions_limit: 0,
    paper_trading_limit: 0,
    price_monthly: 0,
    price_yearly: 0,
    color: 'outline',
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
