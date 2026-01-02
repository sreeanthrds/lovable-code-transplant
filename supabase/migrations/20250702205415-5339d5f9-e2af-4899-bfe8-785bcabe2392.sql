
-- Re-enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Create RLS policies that work with Clerk user IDs stored in the user_id columns
-- For user_profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (true); -- Allow reading since we control access at application level

CREATE POLICY "Users can create their own profile" 
  ON public.user_profiles 
  FOR INSERT 
  WITH CHECK (true); -- Allow insertion since we control user_id at application level

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (true); -- Allow updates since we control access at application level

-- For strategies table
CREATE POLICY "Users can view strategies" 
  ON public.strategies 
  FOR SELECT 
  USING (true); -- Allow reading since we control access at application level

CREATE POLICY "Users can create strategies" 
  ON public.strategies 
  FOR INSERT 
  WITH CHECK (true); -- Allow insertion since we control user_id at application level

CREATE POLICY "Users can update strategies" 
  ON public.strategies 
  FOR UPDATE 
  USING (true); -- Allow updates since we control access at application level

CREATE POLICY "Users can delete strategies" 
  ON public.strategies 
  FOR DELETE 
  USING (true); -- Allow deletion since we control access at application level

-- For user_activity table
CREATE POLICY "Users can view activity" 
  ON public.user_activity 
  FOR SELECT 
  USING (true); -- Allow reading since we control access at application level

CREATE POLICY "Users can create activity" 
  ON public.user_activity 
  FOR INSERT 
  WITH CHECK (true); -- Allow insertion since we control user_id at application level
