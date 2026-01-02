import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { ConnectionStatus as ConnectionStatusType } from '@/types/live-trading-websocket';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  error?: string | null;
}

export function ConnectionStatus({ status, error }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="w-3 h-3" />,
          label: 'Connected',
          variant: 'default' as const,
          className: 'bg-green-500/20 text-green-400 border-green-500/30'
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          label: 'Connecting...',
          variant: 'secondary' as const,
          className: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        };
      case 'reconnecting':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          label: 'Reconnecting...',
          variant: 'secondary' as const,
          className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          label: 'Connection Error',
          variant: 'destructive' as const,
          className: 'bg-red-500/20 text-red-400 border-red-500/30'
        };
      default:
        return {
          icon: <WifiOff className="w-3 h-3" />,
          label: 'Disconnected',
          variant: 'outline' as const,
          className: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex flex-col gap-1">
      <Badge variant={config.variant} className={`flex items-center gap-1.5 w-fit ${config.className}`}>
        {config.icon}
        <span className="text-xs font-medium">{config.label}</span>
      </Badge>
      {error && status === 'error' && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
