-- Grant admin role to the primary user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('571a44ab-d738-42d7-91eb-c884fbe17d64', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;