import { useState, useEffect } from 'react';

interface SessionStatus {
  status: 'not_submitted' | 'queued' | 'running' | 'completed';
  session_id: string;
  has_results: boolean;
  queued: boolean;
  running: boolean;
  completed: boolean;
  loading: boolean;
}

/**
 * Hook to get session status for a specific strategy
 * 
 * States:
 * - "not_submitted": Not in queue, no results
 * - "queued": In queue but not running yet
 * - "running": Currently executing
 * - "completed": Finished, results available
 */
export const useSessionStatus = (
  userId: string | null,
  strategyId: string,
  brokerConnectionId: string | undefined,
  apiBaseUrl: string | null,
  refreshTrigger?: number // Optional trigger to force refresh
): SessionStatus => {
  const [status, setStatus] = useState<SessionStatus>({
    status: 'not_submitted',
    session_id: '',
    has_results: false,
    queued: false,
    running: false,
    completed: false,
    loading: true
  });

  useEffect(() => {
    if (!userId || !strategyId || !brokerConnectionId || !apiBaseUrl) {
      setStatus({
        status: 'not_submitted',
        session_id: '',
        has_results: false,
        queued: false,
        running: false,
        completed: false,
        loading: false
      });
      return;
    }

    const fetchStatus = async () => {
      try {
        const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const response = await fetch(
          `${baseUrl}/api/live-trading/session-status/${userId}/${strategyId}/${brokerConnectionId}`,
          {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStatus({
            status: data.status,
            session_id: data.session_id,
            has_results: data.has_results,
            queued: data.queued,
            running: data.running,
            completed: data.completed,
            loading: false
          });
        } else {
          setStatus(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Failed to fetch session status:', error);
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStatus();
  }, [userId, strategyId, brokerConnectionId, apiBaseUrl, refreshTrigger]);

  return status;
};
