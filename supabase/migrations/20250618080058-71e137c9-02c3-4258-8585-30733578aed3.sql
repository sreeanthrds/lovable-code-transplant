
-- First, let's see what policies exist and drop them all
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
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.user_profiles';
    END LOOP;
END $$;

-- Disable RLS temporarily
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop the existing foreign key constraint
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Change the id column from UUID to TEXT to handle Clerk user IDs
ALTER TABLE public.user_profiles ALTER COLUMN id TYPE TEXT;

-- Re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Recreate the RLS policies with the new column type
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (auth.uid()::text = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.user_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = id);

-- Update the trigger function to work with text IDs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id::text,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
