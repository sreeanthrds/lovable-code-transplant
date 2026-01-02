-- Create api_configurations table
CREATE TABLE public.api_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    config_name TEXT NOT NULL,
    base_url TEXT NOT NULL,
    timeout INTEGER NOT NULL DEFAULT 30000,
    retries INTEGER NOT NULL DEFAULT 3,
    headers JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own api configurations"
ON public.api_configurations
FOR SELECT
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own api configurations"
ON public.api_configurations
FOR INSERT
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own api configurations"
ON public.api_configurations
FOR UPDATE
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own api configurations"
ON public.api_configurations
FOR DELETE
USING (user_id = auth.uid()::text);

-- Create index
CREATE INDEX idx_api_configurations_user_id ON public.api_configurations(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_api_configurations_updated_at
BEFORE UPDATE ON public.api_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add login_count column to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN login_count INTEGER NOT NULL DEFAULT 0;

-- Create admin delete function
CREATE OR REPLACE FUNCTION public.delete_user_profile_admin(target_user_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid()::text, 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  DELETE FROM public.user_profiles WHERE id = target_user_id;
END;
$$;