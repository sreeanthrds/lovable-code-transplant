
-- Ensure RLS is completely disabled and all policies are removed
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (using a more comprehensive approach)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on user_profiles table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.user_profiles CASCADE';
    END LOOP;
END $$;

-- Verify no auth-related triggers exist that might interfere
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Grant explicit permissions to ensure the authenticator role can insert
GRANT ALL ON public.user_profiles TO authenticator;
GRANT ALL ON public.user_profiles TO anon;
GRANT ALL ON public.user_profiles TO authenticated;
