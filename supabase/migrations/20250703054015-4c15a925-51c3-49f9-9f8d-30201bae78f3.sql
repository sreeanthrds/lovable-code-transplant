-- Insert admin role for testing
-- Replace 'your_clerk_user_id' with your actual Clerk user ID
INSERT INTO public.user_roles (user_id, role) 
VALUES ('your_clerk_user_id', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;