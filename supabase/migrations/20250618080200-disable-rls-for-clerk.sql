
-- Disable RLS completely for Clerk authentication
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies since they won't work with Clerk
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

-- Update the trigger function to not rely on auth.users since we're using Clerk
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
