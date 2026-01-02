
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputField from '../../shared/InputField';

interface PerformanceBasedExitSettings {
  enabled: boolean;
  dailyPnLTarget?: {
    enabled: boolean;
    targetAmount: number;
    targetType: 'absolute' | 'percentage';
  };
  dailyLossLimit?: {
    enabled: boolean;
    limitAmount: number;
    limitType: 'absolute' | 'percentage';
  };
}

interface PerformanceBasedExitSettingsProps {
  settings: PerformanceBasedExitSettings;
  onChange: (settings: PerformanceBasedExitSettings) => void;
}

const PerformanceBasedExitSettings: React.FC<PerformanceBasedExitSettingsProps> = ({
  settings,
  onChange
}) => {
  const updateSetting = (key: keyof PerformanceBasedExitSettings, value: any) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const updatePnLTarget = (key: string, value: any) => {
    onChange({
      ...settings,
      dailyPnLTarget: {
        enabled: settings.dailyPnLTarget?.enabled || false,
        targetAmount: settings.dailyPnLTarget?.targetAmount || 0,
        targetType: settings.dailyPnLTarget?.targetType || 'absolute',
        [key]: value
      }
    });
  };

  const updateLossLimit = (key: string, value: any) => {
    onChange({
      ...settings,
      dailyLossLimit: {
        enabled: settings.dailyLossLimit?.enabled || false,
        limitAmount: settings.dailyLossLimit?.limitAmount || 0,
        limitType: settings.dailyLossLimit?.limitType || 'absolute',
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="performance-based-exit"
          checked={settings.enabled}
          onCheckedChange={(checked) => updateSetting('enabled', checked)}
        />
        <Label htmlFor="performance-based-exit" className="text-sm">
          Enable performance-based strategy exit
        </Label>
      </div>

      {settings.enabled && (
        <div className="space-y-4 pl-4 border-l-2 border-border">
          {/* Daily P&L Target */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pnl-target"
                checked={settings.dailyPnLTarget?.enabled || false}
                onCheckedChange={(checked) => updatePnLTarget('enabled', checked)}
              />
              <Label htmlFor="pnl-target" className="text-sm">
                Daily profit target
              </Label>
            </div>
            
            {settings.dailyPnLTarget?.enabled && (
              <div className="flex items-center space-x-2 pl-6">
                <InputField
                  label="Amount"
                  id="target-amount"
                  type="number"
                  value={settings.dailyPnLTarget.targetAmount}
                  onChange={(e) => updatePnLTarget('targetAmount', parseFloat(e.target.value) || 0)}
                  min={0}
                  className="w-24"
                />
                <Select
                  value={settings.dailyPnLTarget.targetType}
                  onValueChange={(value) => updatePnLTarget('targetType', value)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="absolute">₹</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Daily Loss Limit */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="loss-limit"
                checked={settings.dailyLossLimit?.enabled || false}
                onCheckedChange={(checked) => updateLossLimit('enabled', checked)}
              />
              <Label htmlFor="loss-limit" className="text-sm">
                Daily loss limit
              </Label>
            </div>
            
            {settings.dailyLossLimit?.enabled && (
              <div className="flex items-center space-x-2 pl-6">
                <InputField
                  label="Amount"
                  id="limit-amount"
                  type="number"
                  value={settings.dailyLossLimit.limitAmount}
                  onChange={(e) => updateLossLimit('limitAmount', parseFloat(e.target.value) || 0)}
                  min={0}
                  className="w-24"
                />
                <Select
                  value={settings.dailyLossLimit.limitType}
                  onValueChange={(value) => updateLossLimit('limitType', value)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="absolute">₹</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceBasedExitSettings;
