import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Zap, FileText } from 'lucide-react';

interface UsageMeterProps {
  title: string;
  icon: 'backtest' | 'live' | 'paper';
  used: number;
  limit: number;
  addonsRemaining?: number;
  resetInfo: string;
  showDaily?: {
    used: number;
    limit: number;
  };
}

const iconMap = {
  backtest: BarChart3,
  live: Zap,
  paper: FileText
};

const colorMap = {
  backtest: {
    progress: 'bg-primary',
    icon: 'text-primary bg-primary/10',
    accent: 'text-primary'
  },
  live: {
    progress: 'bg-accent',
    icon: 'text-accent bg-accent/10',
    accent: 'text-accent'
  },
  paper: {
    progress: 'bg-info',
    icon: 'text-info bg-info/10',
    accent: 'text-info'
  }
};

export const UsageMeter: React.FC<UsageMeterProps> = ({
  title,
  icon,
  used,
  limit,
  addonsRemaining,
  resetInfo,
  showDaily
}) => {
  const Icon = iconMap[icon];
  const colors = colorMap[icon];
  
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const remaining = Math.max(limit - used, 0);
  const isLow = percentage >= 80;
  const isExhausted = percentage >= 100;

  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main usage bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly</span>
            <span className={`font-medium ${isExhausted ? 'text-destructive' : isLow ? 'text-warning' : ''}`}>
              {used} / {limit}
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={percentage} 
              className="h-3"
            />
            {/* Custom colored indicator */}
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                isExhausted ? 'bg-destructive' : isLow ? 'bg-warning' : colors.progress
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Daily limit if applicable */}
        {showDaily && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Today</span>
              <span className="font-medium">
                {showDaily.used} / {showDaily.limit}
              </span>
            </div>
            <Progress 
              value={(showDaily.used / showDaily.limit) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Add-ons remaining */}
        {addonsRemaining !== undefined && addonsRemaining > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">+ Add-ons</span>
              <span className={`font-medium ${colors.accent}`}>
                {addonsRemaining} available
              </span>
            </div>
          </div>
        )}

        {/* Reset info */}
        <div className="pt-2 text-xs text-muted-foreground">
          {resetInfo}
        </div>

        {/* Consumption order hint */}
        {addonsRemaining !== undefined && addonsRemaining > 0 && (
          <div className="text-xs text-muted-foreground/70 italic">
            Add-ons used after monthly limit
          </div>
        )}
      </CardContent>
    </Card>
  );
};
