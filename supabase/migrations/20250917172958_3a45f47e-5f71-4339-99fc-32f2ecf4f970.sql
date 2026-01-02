-- Update existing pending connections that have tokens to be connected status
UPDATE public.broker_connections 
SET status = 'connected',
    updated_at = now()
WHERE status = 'pending' 
  AND (access_token IS NOT NULL OR request_token IS NOT NULL);

-- Update expired connections to error status  
UPDATE public.broker_connections
SET status = 'error',
    updated_at = now()
WHERE token_expires_at IS NOT NULL 
  AND token_expires_at <= now()
  AND status = 'connected';