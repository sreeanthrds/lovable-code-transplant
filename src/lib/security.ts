
import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';

export const logSecurityEvent = async (event: string, data?: any, userId?: string) => {
  console.log(`[SECURITY] ${event}`, data || '');
  
  try {
    // Log security events to database for monitoring
    await supabase
      .from('user_activity')
      .insert({
        user_id: userId || 'system',
        activity_type: 'security_event',
        activity_data: {
          event,
          data: data || {},
          timestamp: new Date().toISOString(),
          ip: 'unknown' // Could be enhanced with actual IP detection
        }
      });
  } catch (error) {
    console.error('Failed to log security event to database:', error);
  }
};
