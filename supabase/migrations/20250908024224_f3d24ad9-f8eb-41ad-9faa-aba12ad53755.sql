-- Add API credentials columns to broker_connections table
ALTER TABLE public.broker_connections 
ADD COLUMN api_key TEXT,
ADD COLUMN api_secret TEXT;