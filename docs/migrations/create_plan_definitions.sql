-- =============================================
-- PLAN DEFINITIONS TABLE & DAILY TRACKING
-- Run this migration in Supabase SQL Editor
-- =============================================

-- 1. Create plan_definitions table
CREATE TABLE IF NOT EXISTS public.plan_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  tier_level INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  
  -- Validity
  duration_type VARCHAR(20) DEFAULT 'subscription' CHECK (duration_type IN ('subscription', 'fixed', 'lifetime')),
  duration_days INTEGER,
  trial_days INTEGER DEFAULT 0,
  grace_period_days INTEGER DEFAULT 0,
  
  -- Backtest Limits (-1 = unlimited, 0 = disabled)
  backtests_daily_limit INTEGER DEFAULT 2,
  backtests_monthly_limit INTEGER DEFAULT 14,
  backtests_total_limit INTEGER DEFAULT -1,
  
  -- Live Trading Limits
  live_executions_monthly_limit INTEGER DEFAULT 0,
  
  -- Paper Trading Limits
  paper_trading_daily_limit INTEGER DEFAULT -1,
  paper_trading_monthly_limit INTEGER DEFAULT 2,
  
  -- Reset Rules
  reset_type VARCHAR(20) DEFAULT 'calendar' CHECK (reset_type IN ('calendar', 'rolling')),
  daily_reset_hour INTEGER DEFAULT 0 CHECK (daily_reset_hour >= 0 AND daily_reset_hour < 24),
  reset_timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  
  -- Pricing
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'INR',
  discount_percentage INTEGER DEFAULT 0,
  
  -- Features
  can_buy_addons BOOLEAN DEFAULT false,
  feature_flags JSONB DEFAULT '{}',
  ui_color VARCHAR(20) DEFAULT 'default',
  ui_icon VARCHAR(50),
  
  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT,
  updated_by TEXT
);

-- 2. Create index on code for fast lookups
CREATE INDEX IF NOT EXISTS idx_plan_definitions_code ON public.plan_definitions(code);
CREATE INDEX IF NOT EXISTS idx_plan_definitions_active ON public.plan_definitions(is_active, is_public);

-- 3. Enable RLS on plan_definitions
ALTER TABLE public.plan_definitions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for plan_definitions

-- Anyone can read active/public plans (for pricing page)
CREATE POLICY "Anyone can view active public plans"
ON public.plan_definitions
FOR SELECT
USING (is_active = true AND is_public = true);

-- Admins can view all plans
CREATE POLICY "Admins can view all plans"
ON public.plan_definitions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert new plans
CREATE POLICY "Admins can insert plans"
ON public.plan_definitions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update plans
CREATE POLICY "Admins can update plans"
ON public.plan_definitions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete plans
CREATE POLICY "Admins can delete plans"
ON public.plan_definitions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Add daily tracking columns to user_plans (if not exists)
DO $$ 
BEGIN
  -- Add backtests_used_today column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_plans' 
    AND column_name = 'backtests_used_today'
  ) THEN
    ALTER TABLE public.user_plans ADD COLUMN backtests_used_today INTEGER DEFAULT 0;
  END IF;
  
  -- Add paper_trading_used_today column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_plans' 
    AND column_name = 'paper_trading_used_today'
  ) THEN
    ALTER TABLE public.user_plans ADD COLUMN paper_trading_used_today INTEGER DEFAULT 0;
  END IF;
  
  -- Add usage_reset_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_plans' 
    AND column_name = 'usage_reset_date'
  ) THEN
    ALTER TABLE public.user_plans ADD COLUMN usage_reset_date DATE;
  END IF;
  
  -- Add plan_definition_id FK column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_plans' 
    AND column_name = 'plan_definition_id'
  ) THEN
    ALTER TABLE public.user_plans ADD COLUMN plan_definition_id UUID REFERENCES public.plan_definitions(id);
  END IF;
END $$;

-- 6. Seed initial plan definitions from PLAN_CONFIGS
INSERT INTO public.plan_definitions (code, name, description, tier_level, is_active, is_public, duration_type, backtests_daily_limit, backtests_monthly_limit, live_executions_monthly_limit, paper_trading_daily_limit, paper_trading_monthly_limit, price_monthly, price_yearly, can_buy_addons, ui_color, sort_order)
VALUES 
  ('FREE', 'Free', 'Basic free tier with limited access', 0, true, true, 'subscription', 2, 14, 0, -1, 2, 0, 0, false, 'secondary', 0),
  ('LAUNCH', 'Launch', 'Promotional 2-month unlimited plan', 1, true, true, 'fixed', -1, -1, 0, -1, -1, 1, 1, false, 'default', 1),
  ('PRO', 'Pro', 'Professional trading with higher limits', 2, true, true, 'subscription', -1, 100, 50, 2, -1, 499, 4999, true, 'default', 2),
  ('ENTERPRISE', 'Enterprise', 'Unlimited access for power users', 3, true, true, 'subscription', -1, -1, -1, -1, -1, 1999, 19999, true, 'destructive', 3),
  ('CUSTOM', 'Custom', 'Custom configuration for special cases', 4, false, false, 'subscription', 0, 0, 0, 0, 0, 0, 0, false, 'outline', 4)
ON CONFLICT (code) DO NOTHING;

-- 7. Update LAUNCH plan duration_days
UPDATE public.plan_definitions 
SET duration_days = 60 
WHERE code = 'LAUNCH';

-- 8. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_plan_definitions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS plan_definitions_updated_at ON public.plan_definitions;
CREATE TRIGGER plan_definitions_updated_at
  BEFORE UPDATE ON public.plan_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_definitions_updated_at();

-- 9. Grant permissions
GRANT SELECT ON public.plan_definitions TO anon;
GRANT SELECT ON public.plan_definitions TO authenticated;
GRANT ALL ON public.plan_definitions TO service_role;

-- Success message
DO $$ BEGIN RAISE NOTICE 'Migration complete: plan_definitions table created and seeded with initial plans.'; END $$;
