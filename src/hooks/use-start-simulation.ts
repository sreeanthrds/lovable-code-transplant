import { useState, useCallback } from 'react';
import { getApiConfig } from '@/lib/api-config';
import { useClerkUser } from './useClerkUser';
import { useLiveSimulationStore, SimulationSession } from '@/stores/live-simulation-store';
import { StartSimulationResponse } from '@/types/live-simulation-api';
import { toast } from 'sonner';

interface UseStartSimulationReturn {
  startSimulation: (params: {
    strategyId: string;
    strategyName: string;
    brokerConnectionId: string;
    simulationDate: string;
    speedMultiplier: number;
  }) => Promise<SimulationSession | null>;
  isLoading: boolean;
  error: string | null;
}

export const useStartSimulation = (): UseStartSimulationReturn => {
  const { userId } = useClerkUser();
  const { setActiveSession } = useLiveSimulationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSimulation = useCallback(async ({
    strategyId,
    strategyName,
    brokerConnectionId,
    simulationDate,
    speedMultiplier
  }: {
    strategyId: string;
    strategyName: string;
    brokerConnectionId: string;
    simulationDate: string;
    speedMultiplier: number;
  }): Promise<SimulationSession | null> => {
    if (!userId) {
      toast.error('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const config = await getApiConfig(userId);
      
      const request = {
        user_id: userId,
        strategy_id: strategyId,
        strategy_name: strategyName,
        broker_connection_id: brokerConnectionId
      };

      console.log('[Simulation] Starting simulation:', request);
      console.log('[Simulation] API URL:', `${config.baseUrl}/api/v1/live/start`);
      
      const response = await fetch(`${config.baseUrl}/api/v1/live/start`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(request)
      });

      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.text();

      // Check if response is HTML (ngrok warning page or error)
      if (contentType.includes('text/html') || responseText.startsWith('<!DOCTYPE')) {
        console.error('[Simulation] API returned HTML instead of JSON');
        throw new Error('API unavailable - received HTML response');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      // Parse the response - matches: { session_id, stream_url, status: 'starting' }
      const data: StartSimulationResponse = JSON.parse(responseText);
      console.log('[Simulation] API Response:', data);

      const session: SimulationSession = {
        sessionId: data.session_id,
        strategyId,
        strategyName,
        brokerType: 'clickhouse',
        simulationDate,
        speedMultiplier,
        status: data.status === 'starting' ? 'starting' : 'running',
        createdAt: new Date().toISOString()
      };

      setActiveSession(session);
      toast.success('Simulation started successfully');
      
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start simulation';
      console.error('[Simulation] Failed to start:', err);
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, setActiveSession]);

  return {
    startSimulation,
    isLoading,
    error
  };
};
