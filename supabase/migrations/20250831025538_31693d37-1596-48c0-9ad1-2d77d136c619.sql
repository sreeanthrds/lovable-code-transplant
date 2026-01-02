-- Add policy to allow system security event logging
CREATE POLICY "Allow system security events" 
ON public.user_activity 
FOR INSERT 
WITH CHECK (user_id = 'system' AND activity_type = 'security_event');