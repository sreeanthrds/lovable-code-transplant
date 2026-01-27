import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Infinity, Clock, ArrowUpRight, Zap } from 'lucide-react';
import { QuotaInfo } from '@/hooks/useQuota';

interface BacktestQuotaBannerProps {
  quotaInfo: QuotaInfo;
  resetHour: number;
  resetTimezone: string;
  loading?: boolean;
}

const formatResetTime = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
};

const BacktestQuotaBanner: React.FC<BacktestQuotaBannerProps> = ({
  quotaInfo,
  resetHour,
  resetTimezone,
  loading = false,
}) => {
  const navigate = useNavigate();
  const { backtests, plan, planName } = quotaInfo;
  const isUnlimited = backtests.remaining === -1;
  const isLow = !isUnlimited && backtests.remaining <= 2 && backtests.remaining > 0;
  const isExhausted = !isUnlimited && backtests.remaining === 0;

  if (loading) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border animate-pulse">
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="h-5 w-24 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border ${
      isExhausted 
        ? 'bg-destructive/10 border-destructive/30' 
        : isLow 
          ? 'bg-warning/10 border-warning/30'
          : 'bg-muted/50 border-border'
    }`}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Remaining Count */}
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Backtests:</span>
          {isUnlimited ? (
            <Badge variant="secondary" className="gap-1">
              <Infinity className="w-3 h-3" />
              Unlimited
            </Badge>
          ) : (
            <Badge 
              variant={isExhausted ? 'destructive' : isLow ? 'secondary' : 'default'}
              className="font-bold"
            >
              {backtests.remaining} remaining
            </Badge>
          )}
          {backtests.addonRemaining > 0 && (
            <Badge variant="outline" className="text-xs">
              +{backtests.addonRemaining} add-ons
            </Badge>
          )}
        </div>

        {/* Reset Time */}
        {!isUnlimited && backtests.dailyLimit !== -1 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              Resets at {formatResetTime(resetHour)} {resetTimezone.split('/')[1]?.replace('_', ' ') || resetTimezone}
            </span>
          </div>
        )}

        {/* Plan Badge */}
        <Badge variant="outline" className="text-xs capitalize">
          {planName} Plan
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {(isExhausted || isLow) && plan === 'FREE' && (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => navigate('/pricing')}
            className="gap-1"
          >
            Upgrade
            <ArrowUpRight className="w-3 h-3" />
          </Button>
        )}
        {(isExhausted || isLow) && plan !== 'FREE' && quotaInfo.canBuyAddons && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/app/account?tab=payments')}
            className="gap-1"
          >
            Buy Add-ons
            <ArrowUpRight className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default BacktestQuotaBanner;
