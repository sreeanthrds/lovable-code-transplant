-- Create broker_connections table for storing broker OAuth details
CREATE TABLE public.broker_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  broker_type TEXT NOT NULL, -- 'zerodha', 'angel', 'upstox', etc.
  connection_name TEXT NOT NULL,
  
  -- OAuth tokens
  access_token TEXT,
  refresh_token TEXT, 
  request_token TEXT,
  
  -- OAuth metadata
  redirect_url TEXT,
  oauth_state TEXT,
  
  -- Token management
  token_expires_at TIMESTAMP WITH TIME ZONE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Connection status
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending', -- 'pending', 'connected', 'disconnected', 'error'
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique connection per user per broker
  UNIQUE(user_id, broker_type, connection_name)
);

-- Enable Row Level Security
ALTER TABLE public.broker_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own broker connections
CREATE POLICY "Users can view their own broker connections" 
ON public.broker_connections 
FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own broker connections" 
ON public.broker_connections 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own broker connections" 
ON public.broker_connections 
FOR UPDATE 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own broker connections" 
ON public.broker_connections 
FOR DELETE 
USING (auth.uid()::text = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_broker_connections_updated_at
BEFORE UPDATE ON public.broker_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();