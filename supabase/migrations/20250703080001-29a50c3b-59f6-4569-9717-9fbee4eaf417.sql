-- Also fix user_activity table to match Clerk user IDs
ALTER TABLE public.user_activity DROP CONSTRAINT IF EXISTS user_activity_user_id_fkey;

ALTER TABLE public.user_activity 
ALTER COLUMN user_id TYPE TEXT;