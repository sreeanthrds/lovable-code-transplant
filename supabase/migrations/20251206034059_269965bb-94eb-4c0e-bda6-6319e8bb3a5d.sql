-- Create app_role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable Row-Level Security on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id TEXT, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles (admins can manage all, users can view own)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid()::text, 'admin') OR user_id = auth.uid()::text);

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid()::text, 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid()::text, 'admin'));

-- Create user_profiles table
CREATE TABLE public.user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (id = auth.uid()::text OR public.has_role(auth.uid()::text, 'admin'));

CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (id = auth.uid()::text);

CREATE POLICY "Admins can insert profiles"
ON public.user_profiles
FOR INSERT
WITH CHECK (public.has_role(auth.uid()::text, 'admin') OR id = auth.uid()::text);

-- Create user_activity table
CREATE TABLE public.user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    activity_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Activity RLS policies
CREATE POLICY "Users can view own activity"
ON public.user_activity
FOR SELECT
USING (user_id = auth.uid()::text OR public.has_role(auth.uid()::text, 'admin'));

CREATE POLICY "Users can insert own activity"
ON public.user_activity
FOR INSERT
WITH CHECK (user_id = auth.uid()::text);

-- Create indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at);

-- Create admin function to get all profiles (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_all_user_profiles_for_admin()
RETURNS SETOF public.user_profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.user_profiles
  WHERE public.has_role(auth.uid()::text, 'admin')
  ORDER BY created_at DESC;
$$;