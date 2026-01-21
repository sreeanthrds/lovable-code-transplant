import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
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
    if (session.status === 'starting' || session.status === 'streaming') {
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

  const completedDays = Array.from(session.daily_results.values()).filter(
    d => d.status === 'completed'
  ).length;
  
  const runningDays = Array.from(session.daily_results.values()).filter(
    d => d.status === 'running'
  ).length;

  const getStatusIcon = () => {
    switch (session.status) {
      case 'starting':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'streaming':
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
        return 'Initializing backtest...';
      case 'streaming':
        return `Processing day ${completedDays + runningDays} of ${session.total_days}`;
      case 'completed':
        return 'Backtest completed';
      case 'failed':
        return session.error || 'Backtest failed';
      default:
        return 'Ready';
    }
  };

  const isRunning = session.status === 'starting' || session.status === 'streaming';

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
              {completedDays} / {session.total_days} days
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={session.progress} className="h-2" />
        <p className={cn(
          "text-sm",
          session.status === 'failed' ? "text-destructive" : "text-muted-foreground"
        )}>
          {getStatusText()}
        </p>
      </CardContent>
    </Card>
  );
};

export default BacktestProgress;
