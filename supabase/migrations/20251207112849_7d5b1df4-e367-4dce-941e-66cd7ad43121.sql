-- Drop and recreate the function to accept user_id as parameter
DROP FUNCTION IF EXISTS public.get_all_user_profiles_for_admin();

CREATE OR REPLACE FUNCTION public.get_all_user_profiles_for_admin(requesting_user_id text DEFAULT NULL)
RETURNS SETOF user_profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.user_profiles
  WHERE public.has_role(requesting_user_id, 'admin')
  ORDER BY created_at DESC;
$$;