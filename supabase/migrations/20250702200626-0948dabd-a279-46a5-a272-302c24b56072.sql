
-- Enable RLS on user_profiles table if not already enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (auth.uid()::text = id);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can create their own profile" 
  ON public.user_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (auth.uid()::text = id);

-- Create policy to allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" 
  ON public.user_profiles 
  FOR DELETE 
  USING (auth.uid()::text = id);
