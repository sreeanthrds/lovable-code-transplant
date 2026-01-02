-- First, let's see the current table structure and constraints
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('strategies', 'user_activity', 'user_profiles', 'user_roles')
ORDER BY table_name, ordinal_position;