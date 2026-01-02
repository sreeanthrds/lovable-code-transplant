-- Grant admin role to the current user who needs access
-- Replace with the actual user ID that needs admin access
-- Based on the user profiles, granting to the most recent user
INSERT INTO user_roles (user_id, role) 
VALUES ('user_32BNwiJN5KBJI9tzW0AIITbcQTE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;