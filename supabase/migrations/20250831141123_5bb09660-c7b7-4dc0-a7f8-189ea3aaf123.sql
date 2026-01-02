-- Create API configuration table
CREATE TABLE public.api_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  base_url TEXT NOT NULL,
  timeout INTEGER DEFAULT 30000,
  retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own API config" 
ON public.api_configurations 
FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own API config" 
ON public.api_configurations 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own API config" 
ON public.api_configurations 
FOR UPDATE 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own API config" 
ON public.api_configurations 
FOR DELETE 
USING (auth.uid()::text = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_api_configurations_updated_at
BEFORE UPDATE ON public.api_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint to ensure one config per user
ALTER TABLE public.api_configurations 
ADD CONSTRAINT unique_user_api_config UNIQUE (user_id);