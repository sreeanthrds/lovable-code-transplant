-- Create broker_connections table
CREATE TABLE public.broker_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    broker_type TEXT NOT NULL,
    connection_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    is_active BOOLEAN NOT NULL DEFAULT false,
    api_key TEXT,
    api_secret TEXT,
    client_id TEXT,
    totp_secret TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    oauth_state TEXT,
    redirect_url TEXT,
    feed_token TEXT,
    broker_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broker_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own broker connections"
ON public.broker_connections
FOR SELECT
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own broker connections"
ON public.broker_connections
FOR INSERT
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own broker connections"
ON public.broker_connections
FOR UPDATE
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own broker connections"
ON public.broker_connections
FOR DELETE
USING (user_id = auth.uid()::text);

-- Create indexes
CREATE INDEX idx_broker_connections_user_id ON public.broker_connections(user_id);
CREATE INDEX idx_broker_connections_status ON public.broker_connections(status);

-- Trigger for updated_at
CREATE TRIGGER update_broker_connections_updated_at
BEFORE UPDATE ON public.broker_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();