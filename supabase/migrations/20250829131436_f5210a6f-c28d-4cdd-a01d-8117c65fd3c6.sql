-- Create admin function to get user profiles bypassing RLS
CREATE OR REPLACE FUNCTION get_all_user_profiles_for_admin()
RETURNS TABLE (
    id text,
    email text,
    first_name text,
    last_name text
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT up.id, up.email, up.first_name, up.last_name
    FROM user_profiles up;
$$;