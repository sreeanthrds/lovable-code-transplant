-- Mark expired connection as expired
UPDATE public.broker_connections
SET 
  status = 'expired',
  is_active = false,
  updated_at = now()
WHERE 
  id = 'b2083419-d6c9-40de-91b7-591e590fc73a'
  AND token_expires_at < now();