-- Fix search path for the broker connection active status function
CREATE OR REPLACE FUNCTION public.update_broker_connection_active_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update is_active to false for expired connections
  UPDATE public.broker_connections
  SET is_active = false,
      updated_at = now()
  WHERE token_expires_at IS NOT NULL 
    AND token_expires_at <= now()
    AND is_active = true;
END;
$$;