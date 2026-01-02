-- Fix user_id column type mismatch in strategies table
-- Change from UUID to TEXT to match Clerk user IDs

ALTER TABLE public.strategies 
ALTER COLUMN user_id TYPE TEXT;

-- Also fix user_activity table to match
ALTER TABLE public.user_activity 
ALTER COLUMN user_id TYPE TEXT;