import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';

export const useBrokerOAuthCallback = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const callback = searchParams.get('callback');
      const state = searchParams.get('state');
      const authToken = searchParams.get('auth_token');

      if (callback === 'angelone' && state && authToken) {
        console.log('Processing Angel One OAuth callback');

        try {
          // Call edge function to complete OAuth flow
          const { data, error } = await supabase.functions.invoke('angel-one-oauth-callback', {
            body: {
              state,
              auth_token: authToken,
            },
          });

          if (error) throw error;

          if (data.success) {
            toast({
              title: 'Connected Successfully',
              description: 'Your Angel One broker account has been connected',
            });

            // Clear URL parameters
            searchParams.delete('callback');
            searchParams.delete('state');
            searchParams.delete('auth_token');
            setSearchParams(searchParams);

            // Refresh the page to update connection status
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            throw new Error(data.error || 'Failed to complete connection');
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast({
            title: 'Connection Failed',
            description: error instanceof Error ? error.message : 'Failed to complete broker connection',
            variant: 'destructive',
          });

          // Clear URL parameters
          searchParams.delete('callback');
          searchParams.delete('state');
          searchParams.delete('auth_token');
          setSearchParams(searchParams);
        }
      }
    };

    handleCallback();
  }, [searchParams]);
};
