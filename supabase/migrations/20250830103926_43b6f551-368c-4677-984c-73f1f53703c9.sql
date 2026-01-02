-- Disable RLS on user_profiles for admin access
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on strategies for admin access  
ALTER TABLE strategies DISABLE ROW LEVEL SECURITY;