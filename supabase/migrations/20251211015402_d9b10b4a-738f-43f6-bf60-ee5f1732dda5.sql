-- Phase 2: Update RLS policies to use get_clerk_user_id() instead of auth.uid()
-- This enables Clerk JWT authentication to work with Supabase RLS

-- =============================================
-- BROKER_CONNECTIONS TABLE
-- =============================================

DROP POLICY IF EXISTS "Users can view own broker connections" ON public.broker_connections;
DROP POLICY IF EXISTS "Users can create own broker connections" ON public.broker_connections;
DROP POLICY IF EXISTS "Users can update own broker connections" ON public.broker_connections;
DROP POLICY IF EXISTS "Users can delete own broker connections" ON public.broker_connections;

CREATE POLICY "Users can view own broker connections" 
ON public.broker_connections 
FOR SELECT 
USING (user_id = get_clerk_user_id());

CREATE POLICY "Users can create own broker connections" 
ON public.broker_connections 
FOR INSERT 
WITH CHECK (user_id = get_clerk_user_id());

CREATE POLICY "Users can update own broker connections" 
ON public.broker_connections 
FOR UPDATE 
USING (user_id = get_clerk_user_id());

CREATE POLICY "Users can delete own broker connections" 
ON public.broker_connections 
FOR DELETE 
USING (user_id = get_clerk_user_id());

-- =============================================
-- USER_ACTIVITY TABLE
-- =============================================

DROP POLICY IF EXISTS "Users can view own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can insert own activity" ON public.user_activity;

CREATE POLICY "Users can view own activity" 
ON public.user_activity 
FOR SELECT 
USING (user_id = get_clerk_user_id() OR has_role(get_clerk_user_id(), 'admin'));

CREATE POLICY "Users can insert own activity" 
ON public.user_activity 
FOR INSERT 
WITH CHECK (user_id = get_clerk_user_id());

-- =============================================
-- USER_PROFILES TABLE
-- =============================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;

CREATE POLICY "Users can view own profile" 
ON public.user_profiles 
FOR SELECT 
USING (id = get_clerk_user_id() OR has_role(get_clerk_user_id(), 'admin'));

CREATE POLICY "Users can update own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (id = get_clerk_user_id());

CREATE POLICY "Admins can insert profiles" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (has_role(get_clerk_user_id(), 'admin') OR id = get_clerk_user_id());

-- =============================================
-- USER_ROLES TABLE
-- =============================================

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(get_clerk_user_id(), 'admin') OR user_id = get_clerk_user_id());

CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (has_role(get_clerk_user_id(), 'admin'));

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (has_role(get_clerk_user_id(), 'admin'));