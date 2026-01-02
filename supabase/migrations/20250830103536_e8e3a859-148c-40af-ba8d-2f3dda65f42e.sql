-- Insert admin role for current user
INSERT INTO user_roles (user_id, role) 
VALUES ((auth.jwt() ->> 'sub'), 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;