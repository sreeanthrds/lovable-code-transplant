-- Grant admin role to the correct Clerk user ID
INSERT INTO public.user_roles (user_id, role) 
VALUES ('user_2yfjTGEKjL7XkklQyBaMP6SN2Lc', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;