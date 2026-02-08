-- =============================================
-- ADD FEATURES COLUMN TO PLAN_DEFINITIONS
-- Run this migration to add feature bullet points support
-- =============================================

-- Add features column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plan_definitions' 
    AND column_name = 'features'
  ) THEN
    ALTER TABLE public.plan_definitions ADD COLUMN features JSONB DEFAULT '[]';
  END IF;
END $$;

-- Update existing plans with default features
UPDATE public.plan_definitions 
SET features = '["2 backtests per day", "14 backtests per month", "Paper trading access"]'::jsonb
WHERE code = 'FREE' AND (features IS NULL OR features = '[]'::jsonb);

UPDATE public.plan_definitions 
SET features = '["Unlimited strategies", "Full backtest access", "Paper trading", "Priority support", "Your ₹500 adjusts when you upgrade to Pro"]'::jsonb
WHERE code = 'LAUNCH' AND (features IS NULL OR features = '[]'::jsonb);

UPDATE public.plan_definitions 
SET features = '["100 backtests per month", "50 live executions per month", "Unlimited paper trading", "Priority support", "Add-on purchases"]'::jsonb
WHERE code = 'PRO' AND (features IS NULL OR features = '[]'::jsonb);

UPDATE public.plan_definitions 
SET features = '["Unlimited backtests", "Unlimited live executions", "Unlimited paper trading", "Dedicated support", "Custom integrations", "API access"]'::jsonb
WHERE code = 'ENTERPRISE' AND (features IS NULL OR features = '[]'::jsonb);

-- Success message
DO $$ BEGIN RAISE NOTICE 'Migration complete: features column added to plan_definitions table.'; END $$;
