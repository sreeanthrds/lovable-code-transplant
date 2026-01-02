import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, Pause, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { liveTradingApi } from '@/lib/api/live-trading';

interface StrategyControlsProps {
  userId: string;
  strategyId: string;
  strategyName: string;
  status: 'running' | 'paused' | 'stopped';
  onStatusChange?: (newStatus: 'running' | 'paused' | 'stopped') => void;
  brokerConnectionId?: string;
}

export function StrategyControls({
  userId,
  strategyId,
  strategyName,
  status,
  onStatusChange,
  brokerConnectionId = 'default-broker'
}: StrategyControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await liveTradingApi.startTrading({
        user_id: userId,
        strategy_id: strategyId,
        broker_connection_id: brokerConnectionId
      });
      
      toast({
        title: 'Strategy Started',
        description: `${strategyName} is now running`,
      });
      
      onStatusChange?.('running');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start strategy',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    try {
      await liveTradingApi.stopTrading(userId, strategyId);
      
      toast({
        title: 'Strategy Stopped',
        description: `${strategyName} is ready for next run`,
      });
      
      // Reset to inactive - ready for next run
      onStatusChange?.('stopped');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to stop strategy',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    setIsLoading(true);
    try {
      await liveTradingApi.pauseTrading(userId, strategyId);
      
      toast({
        title: 'Strategy Paused',
        description: `${strategyName} has been paused`,
      });
      
      onStatusChange?.('paused');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to pause strategy',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'stopped') {
    return (
      <Button 
        onClick={handleStart} 
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Play className="w-4 h-4 mr-2" />
        )}
        Start Trading
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      {status === 'running' && (
        <Button 
          onClick={handlePause} 
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Pause className="w-4 h-4 mr-2" />
          )}
          Pause
        </Button>
      )}
      
      {status === 'paused' && (
        <Button 
          onClick={handleStart} 
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          Resume
        </Button>
      )}
      
      <Button 
        onClick={handleStop} 
        disabled={isLoading}
        variant="destructive"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Square className="w-4 h-4 mr-2" />
        )}
        Stop
      </Button>
    </div>
  );
}
