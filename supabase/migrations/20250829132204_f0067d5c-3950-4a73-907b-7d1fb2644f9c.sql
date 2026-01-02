-- Fix the admin function to return proper types and include all required fields
CREATE OR REPLACE FUNCTION get_all_user_profiles_for_admin()
RETURNS TABLE (
    id text,
    email text,
    first_name text,
    last_name text,
    phone_number text,
    username text,
    created_at text,
    last_login text,
    login_count integer,
    marketing_consent boolean
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        up.id, 
        up.email, 
        up.first_name, 
        up.last_name, 
        up.phone_number, 
        up.username, 
        up.created_at::text as created_at,
        up.last_login::text as last_login,
        up.login_count, 
        up.marketing_consent
    FROM user_profiles up
    ORDER BY up.created_at DESC;
$$;