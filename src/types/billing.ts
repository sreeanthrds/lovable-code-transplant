// Billing Types - User-facing billing data structures

export type PlanType = 'FREE' | 'LAUNCH' | 'PRO';

export interface PlanInfo {
  plan: PlanType;
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
