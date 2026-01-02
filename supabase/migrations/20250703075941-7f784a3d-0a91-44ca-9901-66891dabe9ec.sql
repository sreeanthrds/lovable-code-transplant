-- Try to drop the foreign key constraint
ALTER TABLE public.strategies DROP CONSTRAINT IF EXISTS strategies_user_id_fkey;

-- Now change the column type
ALTER TABLE public.strategies 
ALTER COLUMN user_id TYPE TEXT;