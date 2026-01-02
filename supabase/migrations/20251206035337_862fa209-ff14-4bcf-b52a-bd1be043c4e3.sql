-- Fix strategies table: Change user_id from uuid to text for Clerk compatibility
-- First drop existing policies
DROP POLICY IF EXISTS "Users can create their own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can delete their own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can update their own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can view their own strategies" ON strategies;

-- Change user_id column type from uuid to text
ALTER TABLE strategies ALTER COLUMN user_id TYPE text USING user_id::text;

-- Recreate RLS policies with text comparison
CREATE POLICY "Users can create their own strategies" 
ON strategies FOR INSERT 
WITH CHECK (user_id = (auth.uid())::text);

CREATE POLICY "Users can delete their own strategies" 
ON strategies FOR DELETE 
USING (user_id = (auth.uid())::text);

CREATE POLICY "Users can update their own strategies" 
ON strategies FOR UPDATE 
USING (user_id = (auth.uid())::text);

CREATE POLICY "Users can view their own strategies" 
ON strategies FOR SELECT 
USING (user_id = (auth.uid())::text);

-- Also fix strategy_versions table
DROP POLICY IF EXISTS "Users can create their own strategy versions" ON strategy_versions;
DROP POLICY IF EXISTS "Users can delete their own strategy versions" ON strategy_versions;
DROP POLICY IF EXISTS "Users can view their own strategy versions" ON strategy_versions;

ALTER TABLE strategy_versions ALTER COLUMN user_id TYPE text USING user_id::text;

CREATE POLICY "Users can create their own strategy versions" 
ON strategy_versions FOR INSERT 
WITH CHECK (user_id = (auth.uid())::text);

CREATE POLICY "Users can delete their own strategy versions" 
ON strategy_versions FOR DELETE 
USING (user_id = (auth.uid())::text);

CREATE POLICY "Users can view their own strategy versions" 
ON strategy_versions FOR SELECT 
USING (user_id = (auth.uid())::text);