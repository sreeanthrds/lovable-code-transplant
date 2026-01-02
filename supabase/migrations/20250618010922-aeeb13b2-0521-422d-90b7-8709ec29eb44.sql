
-- Enable RLS on all tables that don't have it yet
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for strategies table
CREATE POLICY "Users can view their own strategies" 
  ON public.strategies 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own strategies" 
  ON public.strategies 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies" 
  ON public.strategies 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategies" 
  ON public.strategies 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for user_activity table
CREATE POLICY "Users can view their own activity" 
  ON public.user_activity 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity" 
  ON public.user_activity 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity" 
  ON public.user_activity 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity" 
  ON public.user_activity 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for user_profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" 
  ON public.user_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
  ON public.user_profiles 
  FOR DELETE 
  USING (auth.uid() = id);

-- Add database constraints for data integrity
ALTER TABLE public.user_profiles 
  ADD CONSTRAINT valid_email 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.user_profiles 
  ADD CONSTRAINT valid_phone 
  CHECK (phone_number IS NULL OR phone_number ~* '^\+?[1-9]\d{1,14}$');

ALTER TABLE public.user_profiles 
  ADD CONSTRAINT valid_username 
  CHECK (username IS NULL OR username ~* '^[a-zA-Z0-9_.-]{3,30}$');

-- Ensure user_id is not nullable for security-critical tables
ALTER TABLE public.strategies 
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.user_activity 
  ALTER COLUMN user_id SET NOT NULL;
