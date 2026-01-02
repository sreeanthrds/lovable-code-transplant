-- Create the user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles table
CREATE POLICY IF NOT EXISTS "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (has_role((auth.jwt() ->> 'sub'), 'admin'::app_role));