-- Create custom types
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_profiles table
CREATE TABLE public.user_profiles (
    id text NOT NULL PRIMARY KEY,
    email text NOT NULL,
    first_name text,
    last_name text,
    phone_number text,
    username text,
    created_at timestamp with time zone DEFAULT now(),
    last_login timestamp with time zone,
    login_count integer DEFAULT 0,
    marketing_consent boolean DEFAULT false
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Create strategies table
CREATE TABLE public.strategies (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    name text NOT NULL,
    description text,
    strategy jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create user_activity table
CREATE TABLE public.user_activity (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    activity_type text NOT NULL,
    activity_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Create broker_connections table
CREATE TABLE public.broker_connections (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    connection_name text NOT NULL,
    broker_type text NOT NULL,
    api_key text,
    api_secret text,
    access_token text,
    refresh_token text,
    request_token text,
    redirect_url text,
    oauth_state text,
    status text DEFAULT 'pending'::text,
    is_active boolean DEFAULT true,
    token_expires_at timestamp with time zone,
    generated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create api_configurations table
CREATE TABLE public.api_configurations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    base_url text NOT NULL,
    timeout integer DEFAULT 30000,
    retries integer DEFAULT 3,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;

-- Create utility functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id text, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
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
SET search_path TO 'public'
AS $$
BEGIN
  -- Update is_active to false for expired connections
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
SET search_path TO 'public'
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
SET search_path TO 'public'
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

-- Create triggers
CREATE TRIGGER update_strategies_updated_at
    BEFORE UPDATE ON public.strategies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_broker_connections_updated_at
    BEFORE UPDATE ON public.broker_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_configurations_updated_at
    BEFORE UPDATE ON public.api_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile only" ON public.user_profiles
    FOR SELECT USING (id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can create own profile only" ON public.user_profiles
    FOR INSERT WITH CHECK (id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can update own profile only" ON public.user_profiles
    FOR UPDATE USING (id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = (auth.jwt() ->> 'sub'::text)
        AND user_roles.role = 'admin'::app_role
    ));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (has_role((auth.jwt() ->> 'sub'::text), 'admin'::app_role));

-- RLS Policies for strategies
CREATE POLICY "Users can view strategies" ON public.strategies
    FOR SELECT USING (true);

CREATE POLICY "Users can create strategies" ON public.strategies
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update strategies" ON public.strategies
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete strategies" ON public.strategies
    FOR DELETE USING (true);

-- RLS Policies for user_activity
CREATE POLICY "Users can view their own activity" ON public.user_activity
    FOR SELECT USING ((auth.uid())::text = user_id);

CREATE POLICY "Users can create their own activity" ON public.user_activity
    FOR INSERT WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can update their own activity" ON public.user_activity
    FOR UPDATE USING ((auth.uid())::text = user_id) WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own activity" ON public.user_activity
    FOR DELETE USING ((auth.uid())::text = user_id);

CREATE POLICY "Allow system security events" ON public.user_activity
    FOR INSERT WITH CHECK ((user_id = 'system'::text) AND (activity_type = 'security_event'::text));

-- RLS Policies for broker_connections
CREATE POLICY "Allow all broker connection operations" ON public.broker_connections
    FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for api_configurations
CREATE POLICY "Users can view their own API config" ON public.api_configurations
    FOR SELECT USING ((auth.uid())::text = user_id);

CREATE POLICY "Users can create their own API config" ON public.api_configurations
    FOR INSERT WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can update their own API config" ON public.api_configurations
    FOR UPDATE USING ((auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own API config" ON public.api_configurations
    FOR DELETE USING ((auth.uid())::text = user_id);