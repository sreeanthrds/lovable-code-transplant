// =============================================
// PLAN DEFINITIONS - Database-Driven Plans
// =============================================

export type DurationType = 'subscription' | 'fixed' | 'lifetime';
export type ResetType = 'calendar' | 'rolling';

export interface PlanDefinition {
  id: string;
  code: string;
  name: string;
  description: string | null;
  tier_level: number;
  is_active: boolean;
  is_public: boolean;
  
  // Validity
  duration_type: DurationType;
  duration_days: number | null;
  trial_days: number;
  grace_period_days: number;
  
  // Backtest Limits (-1 = unlimited, 0 = disabled)
  backtests_daily_limit: number;
  backtests_monthly_limit: number;
  backtests_total_limit: number;
  
  // Live Trading Limits
  live_executions_monthly_limit: number;
  
  // Paper Trading Limits
  paper_trading_daily_limit: number;
  paper_trading_monthly_limit: number;
  
  // Reset Rules
  reset_type: ResetType;
  daily_reset_hour: number;
  reset_timezone: string;
  
  // Pricing
  price_monthly: number;
  price_yearly: number;
  currency: string;
  discount_percentage: number;
  
  // Features
  can_buy_addons: boolean;
  feature_flags: Record<string, boolean>;
  ui_color: string;
  ui_icon: string | null;
  
  // Metadata
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreatePlanInput {
  code: string;
  name: string;
  description?: string | null;
  tier_level?: number;
  is_active?: boolean;
  is_public?: boolean;
  
  duration_type?: DurationType;
  duration_days?: number | null;
  trial_days?: number;
  grace_period_days?: number;
  
  backtests_daily_limit?: number;
  backtests_monthly_limit?: number;
  backtests_total_limit?: number;
  
  live_executions_monthly_limit?: number;
  
  paper_trading_daily_limit?: number;
  paper_trading_monthly_limit?: number;
  
  reset_type?: ResetType;
  daily_reset_hour?: number;
  reset_timezone?: string;
  
  price_monthly?: number;
  price_yearly?: number;
  currency?: string;
  discount_percentage?: number;
  
  can_buy_addons?: boolean;
  feature_flags?: Record<string, boolean>;
  ui_color?: string;
  ui_icon?: string | null;
  
  sort_order?: number;
}

export type UpdatePlanInput = Partial<CreatePlanInput>;

// Default plan configuration for fallback
export const DEFAULT_FREE_PLAN: Omit<PlanDefinition, 'id' | 'created_at' | 'updated_at'> = {
  code: 'FREE',
  name: 'Free',
  description: 'Basic free tier with limited access',
  tier_level: 0,
  is_active: true,
  is_public: true,
  
  duration_type: 'subscription',
  duration_days: null,
  trial_days: 0,
  grace_period_days: 0,
  
  backtests_daily_limit: 2,
  backtests_monthly_limit: 14,
  backtests_total_limit: -1,
  
  live_executions_monthly_limit: 0,
  
  paper_trading_daily_limit: -1,
  paper_trading_monthly_limit: 2,
  
  reset_type: 'calendar',
  daily_reset_hour: 0,
  reset_timezone: 'Asia/Kolkata',
  
  price_monthly: 0,
  price_yearly: 0,
  currency: 'INR',
  discount_percentage: 0,
  
  can_buy_addons: false,
  feature_flags: {},
  ui_color: 'secondary',
  ui_icon: null,
  
  sort_order: 0,
  created_by: null,
  updated_by: null,
};

// Form state for the plan creator
export interface PlanFormState {
  // Identity
  code: string;
  name: string;
  description: string;
  tier_level: number;
  is_active: boolean;
  is_public: boolean;
  
  // Validity
  duration_type: DurationType;
  duration_days: number | null;
  trial_days: number;
  grace_period_days: number;
  
  // Limits
  backtests_daily_limit: number;
  backtests_daily_unlimited: boolean;
  backtests_monthly_limit: number;
  backtests_monthly_unlimited: boolean;
  backtests_total_limit: number;
  backtests_total_unlimited: boolean;
  
  live_executions_monthly_limit: number;
  live_executions_monthly_unlimited: boolean;
  
  paper_trading_daily_limit: number;
  paper_trading_daily_unlimited: boolean;
  paper_trading_monthly_limit: number;
  paper_trading_monthly_unlimited: boolean;
  
  // Reset Rules
  reset_type: ResetType;
  daily_reset_hour: number;
  reset_timezone: string;
  
  // Pricing
  price_monthly: number;
  price_yearly: number;
  currency: string;
  discount_percentage: number;
  
  // Features
  can_buy_addons: boolean;
  feature_flags: Record<string, boolean>;
  ui_color: string;
  ui_icon: string;
}

// Helper to convert form state to API input
export function formStateToPlanInput(state: PlanFormState): CreatePlanInput {
  return {
    code: state.code.toUpperCase().replace(/[^A-Z0-9_]/g, ''),
    name: state.name,
    description: state.description || null,
    tier_level: state.tier_level,
    is_active: state.is_active,
    is_public: state.is_public,
    
    duration_type: state.duration_type,
    duration_days: state.duration_type === 'fixed' ? state.duration_days : null,
    trial_days: state.trial_days,
    grace_period_days: state.grace_period_days,
    
    backtests_daily_limit: state.backtests_daily_unlimited ? -1 : state.backtests_daily_limit,
    backtests_monthly_limit: state.backtests_monthly_unlimited ? -1 : state.backtests_monthly_limit,
    backtests_total_limit: state.backtests_total_unlimited ? -1 : state.backtests_total_limit,
    
    live_executions_monthly_limit: state.live_executions_monthly_unlimited ? -1 : state.live_executions_monthly_limit,
    
    paper_trading_daily_limit: state.paper_trading_daily_unlimited ? -1 : state.paper_trading_daily_limit,
    paper_trading_monthly_limit: state.paper_trading_monthly_unlimited ? -1 : state.paper_trading_monthly_limit,
    
    reset_type: state.reset_type,
    daily_reset_hour: state.daily_reset_hour,
    reset_timezone: state.reset_timezone,
    
    price_monthly: state.price_monthly,
    price_yearly: state.price_yearly,
    currency: state.currency,
    discount_percentage: state.discount_percentage,
    
    can_buy_addons: state.can_buy_addons,
    feature_flags: state.feature_flags,
    ui_color: state.ui_color,
    ui_icon: state.ui_icon || null,
    
    sort_order: state.tier_level,
  };
}

// Helper to convert plan definition to form state
export function planToFormState(plan: PlanDefinition): PlanFormState {
  return {
    code: plan.code,
    name: plan.name,
    description: plan.description || '',
    tier_level: plan.tier_level,
    is_active: plan.is_active,
    is_public: plan.is_public,
    
    duration_type: plan.duration_type,
    duration_days: plan.duration_days,
    trial_days: plan.trial_days,
    grace_period_days: plan.grace_period_days,
    
    backtests_daily_limit: plan.backtests_daily_limit === -1 ? 0 : plan.backtests_daily_limit,
    backtests_daily_unlimited: plan.backtests_daily_limit === -1,
    backtests_monthly_limit: plan.backtests_monthly_limit === -1 ? 0 : plan.backtests_monthly_limit,
    backtests_monthly_unlimited: plan.backtests_monthly_limit === -1,
    backtests_total_limit: plan.backtests_total_limit === -1 ? 0 : plan.backtests_total_limit,
    backtests_total_unlimited: plan.backtests_total_limit === -1,
    
    live_executions_monthly_limit: plan.live_executions_monthly_limit === -1 ? 0 : plan.live_executions_monthly_limit,
    live_executions_monthly_unlimited: plan.live_executions_monthly_limit === -1,
    
    paper_trading_daily_limit: plan.paper_trading_daily_limit === -1 ? 0 : plan.paper_trading_daily_limit,
    paper_trading_daily_unlimited: plan.paper_trading_daily_limit === -1,
    paper_trading_monthly_limit: plan.paper_trading_monthly_limit === -1 ? 0 : plan.paper_trading_monthly_limit,
    paper_trading_monthly_unlimited: plan.paper_trading_monthly_limit === -1,
    
    reset_type: plan.reset_type,
    daily_reset_hour: plan.daily_reset_hour,
    reset_timezone: plan.reset_timezone,
    
    price_monthly: plan.price_monthly,
    price_yearly: plan.price_yearly,
    currency: plan.currency,
    discount_percentage: plan.discount_percentage,
    
    can_buy_addons: plan.can_buy_addons,
    feature_flags: plan.feature_flags || {},
    ui_color: plan.ui_color,
    ui_icon: plan.ui_icon || '',
  };
}

// Initial form state for new plans
export const INITIAL_FORM_STATE: PlanFormState = {
  code: '',
  name: '',
  description: '',
  tier_level: 0,
  is_active: true,
  is_public: true,
  
  duration_type: 'subscription',
  duration_days: null,
  trial_days: 0,
  grace_period_days: 0,
  
  backtests_daily_limit: 2,
  backtests_daily_unlimited: false,
  backtests_monthly_limit: 14,
  backtests_monthly_unlimited: false,
  backtests_total_limit: 0,
  backtests_total_unlimited: true,
  
  live_executions_monthly_limit: 0,
  live_executions_monthly_unlimited: false,
  
  paper_trading_daily_limit: 0,
  paper_trading_daily_unlimited: true,
  paper_trading_monthly_limit: 2,
  paper_trading_monthly_unlimited: false,
  
  reset_type: 'calendar',
  daily_reset_hour: 0,
  reset_timezone: 'Asia/Kolkata',
  
  price_monthly: 0,
  price_yearly: 0,
  currency: 'INR',
  discount_percentage: 0,
  
  can_buy_addons: false,
  feature_flags: {},
  ui_color: 'default',
  ui_icon: '',
};
