import { useState, useEffect } from 'react';
import { localApiService, ApiResponse, StrategyExecutionRequest, StrategyExecutionResponse } from '@/lib/api/local-api-service';
import { useToast } from '@/hooks/use-toast';

export interface UseLocalApiReturn {
  isConnected: boolean;
  isLoading: boolean;
  executeStrategy: (request: StrategyExecutionRequest) => Promise<StrategyExecutionResponse | null>;
  executeStrategyWithConnection: (
    request: StrategyExecutionRequest,
    connectionTokens: {
      accessToken?: string;
      refreshToken?: string;
      requestToken?: string;
      brokerType: string;
      connectionId: string;
    }
  ) => Promise<StrategyExecutionResponse | null>;
  getExecutionStatus: (executionId: string) => Promise<StrategyExecutionResponse | null>;
  cancelExecution: (executionId: string) => Promise<boolean>;
  testConnection: () => Promise<boolean>;
  setApiUrl: (url: string) => void;
  currentUrl: string;
}

export function useLocalApi(): UseLocalApiReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(localApiService.getBaseUrl());
  const { toast } = useToast();

  const testConnection = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await localApiService.testConnection();
      setIsConnected(response.success);
      
      if (response.success) {
        toast({
          title: "Connection successful",
          description: "Connected to local FastAPI server",
        });
      } else {
        toast({
          title: "Connection failed",
          description: response.error || "Cannot connect to local API",
          variant: "destructive",
        });
      }
      
      return response.success;
    } catch (error) {
      setIsConnected(false);
      toast({
        title: "Connection error",
        description: "Failed to connect to local FastAPI server",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const executeStrategy = async (request: StrategyExecutionRequest): Promise<StrategyExecutionResponse | null> => {
    setIsLoading(true);
    try {
      const response = await localApiService.executeStrategy(request);
      
      if (response.success && response.data) {
        toast({
          title: "Strategy execution started",
          description: `Execution ID: ${response.data.execution_id}`,
        });
        return response.data;
      } else {
        toast({
          title: "Execution failed",
          description: response.error || "Failed to execute strategy",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Execution error",
        description: "Failed to execute strategy",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const executeStrategyWithConnection = async (
    request: StrategyExecutionRequest,
    connectionTokens: {
      accessToken?: string;
      refreshToken?: string;
      requestToken?: string;
      brokerType: string;
      connectionId: string;
    }
  ): Promise<StrategyExecutionResponse | null> => {
    setIsLoading(true);
    try {
      const response = await localApiService.executeStrategyWithConnection(request, connectionTokens);
      
      if (response.success && response.data) {
        toast({
          title: "Strategy execution started with broker connection",
          description: `Execution ID: ${response.data.execution_id} using ${connectionTokens.brokerType}`,
        });
        return response.data;
      } else {
        toast({
          title: "Execution failed",
          description: response.error || "Failed to execute strategy with connection",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Execution error",
        description: "Failed to execute strategy with connection",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getExecutionStatus = async (executionId: string): Promise<StrategyExecutionResponse | null> => {
    try {
      const response = await localApiService.getExecutionStatus(executionId);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Failed to get execution status:', error);
      return null;
    }
  };

  const cancelExecution = async (executionId: string): Promise<boolean> => {
    try {
      const response = await localApiService.cancelExecution(executionId);
      
      if (response.success) {
        toast({
          title: "Execution cancelled",
          description: "Strategy execution has been cancelled",
        });
      } else {
        toast({
          title: "Cancel failed",
          description: response.error || "Failed to cancel execution",
          variant: "destructive",
        });
      }
      
      return response.success;
    } catch (error) {
      toast({
        title: "Cancel error",
        description: "Failed to cancel execution",
        variant: "destructive",
      });
      return false;
    }
  };

  const setApiUrl = (url: string): void => {
    localApiService.setBaseUrl(url);
    setCurrentUrl(url);
    setIsConnected(false); // Reset connection status when URL changes
  };

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, [currentUrl]);

  return {
    isConnected,
    isLoading,
    executeStrategy,
    executeStrategyWithConnection,
    getExecutionStatus,
    cancelExecution,
    testConnection,
    setApiUrl,
    currentUrl,
  };
}