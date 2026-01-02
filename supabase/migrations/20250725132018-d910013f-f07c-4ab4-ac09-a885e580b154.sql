-- Phase 1: Critical Security Fixes - RLS Policies and Admin System

-- First, drop the existing overly permissive policies
DROP POLICY IF EXISTS "Users can view strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can create strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can update strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can delete strategies" ON public.strategies;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can view activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can create activity" ON public.user_activity;

-- Create secure RLS policies for strategies table
CREATE POLICY "Users can view own strategies" 
ON public.strategies 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own strategies" 
ON public.strategies 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own strategies" 
ON public.strategies 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own strategies" 
ON public.strategies 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- Create secure RLS policies for user_profiles table
CREATE POLICY "Users can view own profile" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can create own profile" 
ON public.user_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile" 
ON public.user_profiles 
FOR UPDATE 
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Create secure RLS policies for user_activity table
CREATE POLICY "Users can view own activity" 
ON public.user_activity 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own activity" 
ON public.user_activity 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admin policies using proper role-based access control
CREATE POLICY "Admins can view all strategies" 
ON public.strategies 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all activity" 
ON public.user_activity 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix the has_role function to use TEXT user_id (for Clerk compatibility)
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

CREATE OR REPLACE FUNCTION public.has_role(_user_id text, _role app_role)
RETURNS boolean
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

-- Update user_roles table to use TEXT for user_id (Clerk compatibility)
ALTER TABLE public.user_roles ALTER COLUMN user_id TYPE text;

-- Add security event logging table for audit trail
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  event_type text NOT NULL,
  event_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events" 
ON public.security_events 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add input validation functions
CREATE OR REPLACE FUNCTION public.validate_email(email text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
$$;

CREATE OR REPLACE FUNCTION public.validate_phone(phone text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT phone ~* '^\+?[1-9]\d{1,14}$'
$$;