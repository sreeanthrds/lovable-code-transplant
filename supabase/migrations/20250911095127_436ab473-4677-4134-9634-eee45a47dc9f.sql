-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
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
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Create strategies table
CREATE TABLE IF NOT EXISTS public.strategies (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    name text NOT NULL,
    description text,
    strategy jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create user_activity table
CREATE TABLE IF NOT EXISTS public.user_activity (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    activity_type text NOT NULL,
    activity_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Create broker_connections table
CREATE TABLE IF NOT EXISTS public.broker_connections (
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
CREATE TABLE IF NOT EXISTS public.api_configurations (
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