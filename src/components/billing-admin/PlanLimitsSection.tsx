import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Infinity } from 'lucide-react';
import type { PlanFormState } from '@/types/plan-definitions';

interface PlanLimitsSectionProps {
  formState: PlanFormState;
  onChange: (updates: Partial<PlanFormState>) => void;
}

interface LimitFieldProps {
  label: string;
  value: number;
  unlimited: boolean;
  disabled?: boolean;
  onValueChange: (value: number) => void;
  onUnlimitedChange: (unlimited: boolean) => void;
  description?: string;
}

function LimitField({ 
  label, 
  value, 
  unlimited, 
  disabled, 
  onValueChange, 
  onUnlimitedChange,
  description 
}: LimitFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${label}-unlimited`}
            checked={unlimited}
            onCheckedChange={(checked) => onUnlimitedChange(checked === true)}
            disabled={disabled}
          />
          <Label htmlFor={`${label}-unlimited`} className="text-xs text-muted-foreground flex items-center gap-1">
            <Infinity className="h-3 w-3" />
            Unlimited
          </Label>
        </div>
      </div>
      <Input
        type="number"
        min={0}
        value={unlimited ? '' : value}
        onChange={(e) => onValueChange(parseInt(e.target.value) || 0)}
        disabled={disabled || unlimited}
        placeholder={unlimited ? '∞ Unlimited' : '0'}
        className="font-mono"
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function PlanLimitsSection({ formState, onChange }: PlanLimitsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Backtests Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground border-b pb-2">Backtest Limits</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LimitField
            label="Daily Limit"
            value={formState.backtests_daily_limit}
            unlimited={formState.backtests_daily_unlimited}
            onValueChange={(v) => onChange({ backtests_daily_limit: v })}
            onUnlimitedChange={(u) => onChange({ backtests_daily_unlimited: u })}
            description="Max backtests per day"
          />
          <LimitField
            label="Monthly Limit"
            value={formState.backtests_monthly_limit}
            unlimited={formState.backtests_monthly_unlimited}
            onValueChange={(v) => onChange({ backtests_monthly_limit: v })}
            onUnlimitedChange={(u) => onChange({ backtests_monthly_unlimited: u })}
            description="Max backtests per month"
          />
          <LimitField
            label="Total Limit"
            value={formState.backtests_total_limit}
            unlimited={formState.backtests_total_unlimited}
            onValueChange={(v) => onChange({ backtests_total_limit: v })}
            onUnlimitedChange={(u) => onChange({ backtests_total_unlimited: u })}
            description="Lifetime limit (rarely used)"
          />
        </div>
      </div>

      {/* Live Executions Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground border-b pb-2">Live Trading Limits</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LimitField
            label="Monthly Limit"
            value={formState.live_executions_monthly_limit}
            unlimited={formState.live_executions_monthly_unlimited}
            onValueChange={(v) => onChange({ live_executions_monthly_limit: v })}
            onUnlimitedChange={(u) => onChange({ live_executions_monthly_unlimited: u })}
            description="Max live trades per month"
          />
          <div className="col-span-2 flex items-center justify-center text-muted-foreground text-sm">
            <p>Live trading limits are currently monthly only</p>
          </div>
        </div>
      </div>

      {/* Paper Trading Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground border-b pb-2">Paper Trading Limits</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LimitField
            label="Daily Limit"
            value={formState.paper_trading_daily_limit}
            unlimited={formState.paper_trading_daily_unlimited}
            onValueChange={(v) => onChange({ paper_trading_daily_limit: v })}
            onUnlimitedChange={(u) => onChange({ paper_trading_daily_unlimited: u })}
            description="Max paper trades per day"
          />
          <LimitField
            label="Monthly Limit"
            value={formState.paper_trading_monthly_limit}
            unlimited={formState.paper_trading_monthly_unlimited}
            onValueChange={(v) => onChange({ paper_trading_monthly_limit: v })}
            onUnlimitedChange={(u) => onChange({ paper_trading_monthly_unlimited: u })}
            description="Max paper trades per month"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground">
        <p className="font-medium mb-2">Limit Values:</p>
        <ul className="space-y-1">
          <li><span className="font-mono">-1</span> = Unlimited (no cap)</li>
          <li><span className="font-mono">0</span> = Disabled (feature not available)</li>
          <li><span className="font-mono">N</span> = Limited to N per period</li>
        </ul>
      </div>
    </div>
  );
}
