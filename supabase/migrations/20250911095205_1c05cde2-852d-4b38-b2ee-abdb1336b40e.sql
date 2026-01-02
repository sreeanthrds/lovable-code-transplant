-- Create utility functions with proper search path
CREATE OR REPLACE FUNCTION public.has_role(_user_id text, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_broker_connection_active_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.broker_connections
  SET is_active = false,
      updated_at = now()
  WHERE token_expires_at IS NOT NULL 
    AND token_expires_at <= now()
    AND is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_user_profiles_for_admin()
RETURNS TABLE(id text, email text, first_name text, last_name text, phone_number text, username text, created_at text, last_login text, login_count integer, marketing_consent boolean)
LANGUAGE sql
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

CREATE OR REPLACE FUNCTION public.delete_user_profile_admin(user_id_to_delete text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM user_activity WHERE user_id = user_id_to_delete;
    DELETE FROM user_roles WHERE user_id = user_id_to_delete;
    DELETE FROM strategies WHERE user_id = user_id_to_delete;
    DELETE FROM user_profiles WHERE id = user_id_to_delete;
END;
$$;