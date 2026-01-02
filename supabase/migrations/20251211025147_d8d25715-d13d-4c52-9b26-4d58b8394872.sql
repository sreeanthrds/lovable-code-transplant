-- Fix RLS for strategies table
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own strategies"
ON public.strategies FOR SELECT
USING (user_id = get_clerk_user_id());

CREATE POLICY "Users can create own strategies"
ON public.strategies FOR INSERT
WITH CHECK (user_id = get_clerk_user_id());

CREATE POLICY "Users can update own strategies"
ON public.strategies FOR UPDATE
USING (user_id = get_clerk_user_id());

CREATE POLICY "Users can delete own strategies"
ON public.strategies FOR DELETE
USING (user_id = get_clerk_user_id());

-- Fix RLS for strategy_versions table
ALTER TABLE public.strategy_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own strategy versions"
ON public.strategy_versions FOR SELECT
USING (user_id = get_clerk_user_id());

CREATE POLICY "Users can create own strategy versions"
ON public.strategy_versions FOR INSERT
WITH CHECK (user_id = get_clerk_user_id());

CREATE POLICY "Users can update own strategy versions"
ON public.strategy_versions FOR UPDATE
USING (user_id = get_clerk_user_id());

CREATE POLICY "Users can delete own strategy versions"
ON public.strategy_versions FOR DELETE
USING (user_id = get_clerk_user_id());

-- Fix api_configurations policies (replace 'true' with proper user checks)
DROP POLICY IF EXISTS "Users can view own api configurations" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can create api configurations" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can update api configurations" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can delete api configurations" ON public.api_configurations;

CREATE POLICY "Users can view own api configurations"
ON public.api_configurations FOR SELECT
USING (user_id = get_clerk_user_id());

CREATE POLICY "Users can create api configurations"
ON public.api_configurations FOR INSERT
WITH CHECK (user_id = get_clerk_user_id());

CREATE POLICY "Users can update api configurations"
ON public.api_configurations FOR UPDATE
USING (user_id = get_clerk_user_id());

CREATE POLICY "Users can delete api configurations"
ON public.api_configurations FOR DELETE
USING (user_id = get_clerk_user_id());