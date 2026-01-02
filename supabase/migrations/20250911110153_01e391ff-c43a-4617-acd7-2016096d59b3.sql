-- Force schema cache refresh by recreating the table
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Recreate the app_role enum if needed
DROP TYPE IF EXISTS app_role CASCADE;
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');

-- Recreate the user_roles table
CREATE TABLE public.user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (has_role((auth.jwt() ->> 'sub'), 'admin'::app_role));

-- Grant necessary permissions
GRANT ALL ON public.user_roles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;