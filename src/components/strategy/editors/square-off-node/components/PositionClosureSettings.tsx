
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import FieldTooltip from '../../shared/FieldTooltip';

interface PositionClosureSettings {
  orderType: 'market' | 'limit';
  limitOffset?: number;
  forceClose: boolean;
}

interface PositionClosureSettingsProps {
  settings: PositionClosureSettings;
  onChange: (settings: PositionClosureSettings) => void;
}

const PositionClosureSettings: React.FC<PositionClosureSettingsProps> = ({
  settings,
  onChange
}) => {
  const updateSetting = (key: keyof PositionClosureSettings, value: any) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Force close all positions</Label>
          <FieldTooltip 
            content="All positions will be closed immediately at market price when square-off is triggered."
            side="right"
          />
        </div>
        
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded border border-border">
          All open positions will be closed at market price, regardless of individual exit conditions. 
          This ensures complete position closure when this square-off node is executed.
        </div>
      </div>
    </div>
  );
};

export default PositionClosureSettings;
