-- First, let's clean up the incorrect admin entries
DELETE FROM user_roles WHERE user_id IN ('your_clerk_user_id', '571a44ab-d738-42d7-91eb-c884fbe17d64');

-- We'll keep the user_2yfjTGEKjL7XkklQyBaMP6SN2Lc entry as it might be valid
-- The application will handle adding the correct admin role for the current user