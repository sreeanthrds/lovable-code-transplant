-- Create admin function to delete user profile and related data
CREATE OR REPLACE FUNCTION delete_user_profile_admin(user_id_to_delete text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Delete user activities
    DELETE FROM user_activity WHERE user_id = user_id_to_delete;
    
    -- Delete user roles
    DELETE FROM user_roles WHERE user_id = user_id_to_delete;
    
    -- Delete user strategies
    DELETE FROM strategies WHERE user_id = user_id_to_delete;
    
    -- Delete user profile
    DELETE FROM user_profiles WHERE id = user_id_to_delete;
END;
$$;