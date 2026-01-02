-- Fix RLS policies for broker_connections table with proper type casting
DROP POLICY IF EXISTS "Users can view their own broker connections" ON public.broker_connections;
DROP POLICY IF EXISTS "Users can create their own broker connections" ON public.broker_connections;
DROP POLICY IF EXISTS "Users can update their own broker connections" ON public.broker_connections;
DROP POLICY IF EXISTS "Users can delete their own broker connections" ON public.broker_connections;

-- Create corrected policies with proper type casting
CREATE POLICY "Users can view their own broker connections" 
ON public.broker_connections 
FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own broker connections" 
ON public.broker_connections 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own broker connections" 
ON public.broker_connections 
FOR UPDATE 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own broker connections" 
ON public.broker_connections 
FOR DELETE 
USING (auth.uid()::text = user_id);