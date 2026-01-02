-- Try to drop the foreign key constraint that's causing the issue
-- First let's see what constraint exists on strategies table
\d strategies;