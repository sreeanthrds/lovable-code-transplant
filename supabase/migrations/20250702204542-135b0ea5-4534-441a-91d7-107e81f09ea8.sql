
-- Drop existing RLS policies that depend on auth.uid() since we're using Clerk
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;

-- Disable RLS on user_profiles since we're using Clerk for auth (not Supabase Auth)
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on strategies table since we're using Clerk
DROP POLICY IF EXISTS "Users can view their own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can view own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can create their own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can update their own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can delete their own strategies" ON public.strategies;

ALTER TABLE public.strategies DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on user_activity table since we're using Clerk
DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can view own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can create their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can update their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can delete their own activity" ON public.user_activity;

ALTER TABLE public.user_activity DISABLE ROW LEVEL SECURITY;
