import React, { useMemo } from 'react';
import { useSSELogsStore, SSELogEntry } from '@/stores/sse-logs-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trash2, Radio, AlertCircle, CheckCircle, Zap, TrendingUp, Flag } from 'lucide-react';

const eventTypeConfig: Record<SSELogEntry['eventType'], { color: string; icon: React.ReactNode; label: string }> = {
  connection: { color: 'bg-blue-500/20 text-blue-400', icon: <Radio className="w-3 h-3" />, label: 'Connection' },
  initial_state: { color: 'bg-purple-500/20 text-purple-400', icon: <CheckCircle className="w-3 h-3" />, label: 'Initial' },
  tick_update: { color: 'bg-green-500/20 text-green-400', icon: <Zap className="w-3 h-3" />, label: 'Tick' },
  node_events: { color: 'bg-yellow-500/20 text-yellow-400', icon: <TrendingUp className="w-3 h-3" />, label: 'Node' },
  trade_update: { color: 'bg-emerald-500/20 text-emerald-400', icon: <TrendingUp className="w-3 h-3" />, label: 'Trade' },
  session_complete: { color: 'bg-cyan-500/20 text-cyan-400', icon: <Flag className="w-3 h-3" />, label: 'Complete' },
  error: { color: 'bg-red-500/20 text-red-400', icon: <AlertCircle className="w-3 h-3" />, label: 'Error' }
};

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit'
  }) + `.${ms}`;
}

export function SSELogsPanel() {
  const { logs, clearLogs } = useSSELogsStore();
  
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      counts[log.eventType] = (counts[log.eventType] || 0) + 1;
    });
    return counts;
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">SSE Event Logs</h2>
          <Badge variant="secondary" className="text-xs">
            {logs.length} events
          </Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearLogs}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear Logs
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/30 bg-muted/20 flex-wrap">
        {Object.entries(stats).map(([type, count]) => {
          const config = eventTypeConfig[type as SSELogEntry['eventType']];
          return (
            <Badge key={type} variant="outline" className={`text-xs ${config?.color || ''}`}>
              {config?.icon}
              <span className="ml-1">{config?.label || type}: {count}</span>
            </Badge>
          );
        })}
      </div>

      {/* Logs List */}
      <ScrollArea className="flex-1">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No events received yet. Connect to a live session to see logs.</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {logs.map((log) => {
              const config = eventTypeConfig[log.eventType];
              return (
                <div 
                  key={log.id} 
                  className="flex items-start gap-2 p-2 rounded bg-muted/20 hover:bg-muted/40 transition-colors text-sm font-mono"
                >
                  <span className="text-muted-foreground text-xs whitespace-nowrap">
                    {formatTime(log.timestamp)}
                  </span>
                  <Badge variant="outline" className={`text-xs shrink-0 ${config?.color || ''}`}>
                    {config?.icon}
                    <span className="ml-1">{config?.label || log.eventType}</span>
                  </Badge>
                  <span className="text-foreground break-all">{log.message}</span>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
