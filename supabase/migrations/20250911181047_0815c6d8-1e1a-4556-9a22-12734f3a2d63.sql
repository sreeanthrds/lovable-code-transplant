-- Update NULL request_token for Angel One connections with proper session identifier
UPDATE broker_connections 
SET request_token = 'angel-one-session-' || extract(epoch from created_at)::text || '-' || substring(id::text, 1, 8),
    updated_at = now()
WHERE request_token IS NULL 
  AND broker_type = 'angel-one' 
  AND access_token IS NOT NULL;