-- Disable RLS on strategies table since we're using Clerk for auth
-- Authorization is handled in application code by filtering user_id
ALTER TABLE strategies DISABLE ROW LEVEL SECURITY;

-- Disable RLS on strategy_versions table
ALTER TABLE strategy_versions DISABLE ROW LEVEL SECURITY;

-- Drop the RLS policies since they're no longer needed
DROP POLICY IF EXISTS "Users can create their own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can delete their own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can update their own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can view their own strategies" ON strategies;

DROP POLICY IF EXISTS "Users can create their own strategy versions" ON strategy_versions;
DROP POLICY IF EXISTS "Users can delete their own strategy versions" ON strategy_versions;
DROP POLICY IF EXISTS "Users can view their own strategy versions" ON strategy_versions;