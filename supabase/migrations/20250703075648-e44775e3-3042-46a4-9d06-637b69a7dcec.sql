-- Drop foreign key constraints that are causing issues
-- Check what constraints exist first
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_schema = 'public' 
AND constraint_name LIKE '%user_id%';