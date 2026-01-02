
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Eye, RefreshCw } from 'lucide-react';

interface SecurityEvent {
  timestamp: string;
  event: string;
  level: 'info' | 'warning' | 'error';
  details?: Record<string, any>;
}

const SecurityMonitor: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock security events for demonstration
  const mockEvents: SecurityEvent[] = [
    {
      timestamp: new Date().toISOString(),
      event: 'SIGNIN_SUCCESS',
      level: 'info',
      details: { userId: 'user-123' }
    },
    {
      timestamp: new Date(Date.now() - 300000).toISOString(),
      event: 'RATE_LIMIT_EXCEEDED',
      level: 'warning',
      details: { action: 'signin', identifier: 'user***' }
    },
    {
      timestamp: new Date(Date.now() - 600000).toISOString(),
      event: 'STRATEGY_SAVED',
      level: 'info',
      details: { strategyId: 'strategy-456', userId: 'user-789' }
    }
  ];

  useEffect(() => {
    // In a real implementation, this would fetch from a security audit log
    setEvents(mockEvents);
  }, []);

  const refreshEvents = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setEvents([...mockEvents]);
      setIsLoading(false);
    }, 1000);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <Eye className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Monitor
            </CardTitle>
            <CardDescription>
              Real-time security events and system monitoring (Demo Mode)
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refreshEvents} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No security events recorded.</p>
          ) : (
            events.map((event, index) => (
              <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex items-start gap-3">
                  {getLevelIcon(event.level)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.event}</span>
                      <Badge variant={getLevelColor(event.level) as any}>
                        {event.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                    {event.details && (
                      <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityMonitor;
