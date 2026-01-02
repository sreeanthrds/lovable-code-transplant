import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import FieldTooltip from '../../shared/FieldTooltip';

interface ImmediateExitSettings {
  enabled: boolean;
}

interface ImmediateExitSettingsProps {
  settings: ImmediateExitSettings;
  onChange: (settings: ImmediateExitSettings) => void;
}

const ImmediateExitSettings: React.FC<ImmediateExitSettingsProps> = ({
  settings,
  onChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Enable Immediate Exit</Label>
          <FieldTooltip 
            content="Execute square-off immediately when this node is triggered, closing all positions without any delay or conditions."
            side="right"
          />
        </div>
        <Switch
          checked={settings.enabled}
          onCheckedChange={(checked) => onChange({ enabled: checked })}
        />
      </div>
      
      {settings.enabled && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded border border-border">
          When enabled, this node will execute square-off immediately upon trigger, 
          closing all open positions at market price without waiting for any time or performance conditions.
        </div>
      )}
    </div>
  );
};

export default ImmediateExitSettings;
