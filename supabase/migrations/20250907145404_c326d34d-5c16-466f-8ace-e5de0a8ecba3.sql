-- Create broker_connections table for storing broker API connections
CREATE TABLE IF NOT EXISTS public.broker_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_type TEXT NOT NULL,
  connection_name TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  request_token TEXT,
  redirect_url TEXT,
  oauth_state TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  generated_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'disconnected', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, connection_name)
);

-- Enable Row Level Security
ALTER TABLE public.broker_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for broker_connections
CREATE POLICY "Users can view their own broker connections" 
ON public.broker_connections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own broker connections" 
ON public.broker_connections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own broker connections" 
ON public.broker_connections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own broker connections" 
ON public.broker_connections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_broker_connections_updated_at
BEFORE UPDATE ON public.broker_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();