-- Update the Angel One connection status from pending to connected
UPDATE public.broker_connections
SET 
  status = 'connected',
  updated_at = now()
WHERE 
  id = 'b2083419-d6c9-40de-91b7-591e590fc73a'
  AND status = 'pending'
  AND access_token IS NOT NULL;