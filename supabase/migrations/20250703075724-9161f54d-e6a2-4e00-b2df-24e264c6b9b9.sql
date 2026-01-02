-- Show all foreign key constraints in public schema
SELECT 
    constraint_name, 
    table_name,
    column_name
FROM information_schema.key_column_usage 
WHERE table_schema = 'public' 
AND constraint_name IN (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_schema = 'public'
);