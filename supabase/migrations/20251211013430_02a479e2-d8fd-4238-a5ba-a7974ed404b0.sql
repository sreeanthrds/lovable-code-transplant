-- Create a function to extract user ID from Clerk JWT claims
-- This allows RLS policies to work with Clerk-issued tokens
CREATE OR REPLACE FUNCTION public.get_clerk_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    NULL
  )
$$;