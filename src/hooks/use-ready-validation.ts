import { useState, useEffect } from 'react';
import { BrokerConnection } from './use-broker-connections';

interface ReadyValidation {
  ready: boolean;
  reason: string;
  broker_status: string;
  broker_type?: string;
  loading: boolean;
}

/**
 * Hook to validate if a strategy is READY for execution
 * 
 * READY means:
 * 1. No duplicate strategy_id + broker_connection_id combination
 * 2. Broker connection is valid and connected
 * 
 * For backtest mode (when skipApiValidation=true):
 * - Only validates that broker connection is selected and exists in loaded connections
 */
export const useReadyValidation = (
  userId: string | null,
  strategyId: string,
  brokerConnectionId: string | undefined,
  existingCombinations: [string, string][],
  apiBaseUrl: string | null,
  // Optional: pass loaded connections for UI-side validation (backtest mode)
  brokerConnections?: BrokerConnection[]
): ReadyValidation => {
  const [validation, setValidation] = useState<ReadyValidation>({
    ready: false,
    reason: 'Not validated',
    broker_status: 'unknown',
    loading: true
  });

  useEffect(() => {
    // Backtest mode: UI-side validation only (when apiBaseUrl is null but connections provided)
    if (!apiBaseUrl && brokerConnections) {
      if (!brokerConnectionId) {
        setValidation({
          ready: false,
          reason: 'Select a broker connection',
          broker_status: 'not_selected',
          loading: false
        });
        return;
      }
      
      // Check if connection exists in loaded connections
      const connection = brokerConnections.find(c => c.id === brokerConnectionId);
      if (!connection) {
        setValidation({
          ready: false,
          reason: 'Invalid broker connection',
          broker_status: 'invalid',
          loading: false
        });
        return;
      }
      
      // Valid for backtest
      setValidation({
        ready: true,
        reason: 'Ready for backtest',
        broker_status: connection.status || 'connected',
        broker_type: connection.broker_type,
        loading: false
      });
      return;
    }

    if (!userId || !strategyId || !brokerConnectionId || !apiBaseUrl) {
      setValidation({
        ready: false,
        reason: 'Missing broker connection',
        broker_status: 'not_selected',
        loading: false
      });
      return;
    }

    const validateReady = async () => {
      try {
        const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const payload = {
          user_id: userId,
          strategy_id: strategyId,
          broker_connection_id: brokerConnectionId,
          existing_combinations: existingCombinations
        };
        
        console.log('🔍 Validating with payload:', payload);
        
        const response = await fetch(`${baseUrl}/api/live-trading/validate-ready`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Validation response:', data);
          setValidation({
            ready: data.ready,
            reason: data.reason,
            broker_status: data.broker_status,
            broker_type: data.broker_type,
            loading: false
          });
        } else {
          const errorText = await response.text();
          console.error('❌ Validation failed:', response.status, errorText);
          setValidation({
            ready: false,
            reason: `Validation failed: ${response.status}`,
            broker_status: 'error',
            loading: false
          });
        }
      } catch (error) {
        console.error('Failed to validate ready state:', error);
        setValidation({
          ready: false,
          reason: 'Network error',
          broker_status: 'error',
          loading: false
        });
      }
    };

    validateReady();
  }, [userId, strategyId, brokerConnectionId, existingCombinations, apiBaseUrl]);

  return validation;
};
