import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Clock, Timer } from 'lucide-react';
import { BacktestSession } from '@/types/backtest-session';
import { cn } from '@/lib/utils';

interface BacktestProgressProps {
  session: BacktestSession;
}

const BacktestProgress: React.FC<BacktestProgressProps> = ({ session }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime] = useState(() => Date.now());

  // Timer effect
  useEffect(() => {
    if (session.status === 'starting' || session.status === 'running') {
      const interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [session.status, startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (session.status) {
      case 'starting':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (session.status) {
      case 'starting':
        return `Starting backtest for ${session.total_days} day${session.total_days > 1 ? 's' : ''}...`;
      case 'running':
        if (session.current_day) {
          return `Processing ${session.current_day} (${session.completed_days} of ${session.total_days} completed)`;
        }
        return `Processing backtest (${session.completed_days} of ${session.total_days} completed)`;
      case 'completed':
        return `Backtest completed - ${session.total_days} day${session.total_days > 1 ? 's' : ''} processed`;
      case 'failed':
        return session.error || 'Backtest failed';
      default:
        return 'Ready';
    }
  };

  const isRunning = session.status === 'starting' || session.status === 'running';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon()}
            Backtest Progress
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {isRunning && (
              <span className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {formatTime(elapsedSeconds)}
              </span>
            )}
            <span>
              {session.completed_days} / {session.total_days} days
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className={cn(
            session.status === 'failed' ? "text-destructive" : "text-muted-foreground"
          )}>
            {getStatusText()}
          </span>
          <span className="text-muted-foreground">
            {session.completed_days} / {session.total_days} days
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BacktestProgress;
