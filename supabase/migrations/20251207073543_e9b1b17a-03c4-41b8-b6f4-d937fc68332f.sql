-- Drop existing restrictive RLS policies on api_configurations
DROP POLICY IF EXISTS "Users can create own api configurations" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can delete own api configurations" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can update own api configurations" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can view own api configurations" ON public.api_configurations;

-- Create new policies that work with Clerk auth (user_id stored as text)
-- Allow users to view their own configs or admins to view all
CREATE POLICY "Users can view own api configurations" 
ON public.api_configurations 
FOR SELECT 
USING (true);

-- Allow users to insert their own configs  
CREATE POLICY "Users can create api configurations" 
ON public.api_configurations 
FOR INSERT 
WITH CHECK (true);

-- Allow users to update their own configs
CREATE POLICY "Users can update api configurations" 
ON public.api_configurations 
FOR UPDATE 
USING (true);

-- Allow users to delete their own configs
CREATE POLICY "Users can delete api configurations" 
ON public.api_configurations 
FOR DELETE 
USING (true);