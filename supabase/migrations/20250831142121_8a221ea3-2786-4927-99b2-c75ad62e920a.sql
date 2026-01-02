-- Permanently disable RLS on api_configurations table
ALTER TABLE public.api_configurations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies since RLS is disabled
DROP POLICY IF EXISTS "Users can view their own API config (Clerk)" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can create their own API config (Clerk)" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can update their own API config (Clerk)" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can delete their own API config (Clerk)" ON public.api_configurations;