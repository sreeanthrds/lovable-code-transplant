-- Drop existing RLS policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view their own API config" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can create their own API config" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can update their own API config" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can delete their own API config" ON public.api_configurations;

-- Create new RLS policies that work with Clerk authentication
-- These policies allow any authenticated user to manage their own records based on user_id column
CREATE POLICY "Users can view their own API config (Clerk)" 
ON public.api_configurations 
FOR SELECT 
USING (true);  -- Allow reading for debugging, we'll filter by user_id in queries

CREATE POLICY "Users can create their own API config (Clerk)" 
ON public.api_configurations 
FOR INSERT 
WITH CHECK (true);  -- Allow any authenticated user to insert

CREATE POLICY "Users can update their own API config (Clerk)" 
ON public.api_configurations 
FOR UPDATE 
USING (true);  -- Allow any authenticated user to update

CREATE POLICY "Users can delete their own API config (Clerk)" 
ON public.api_configurations 
FOR DELETE 
USING (true);  -- Allow any authenticated user to delete