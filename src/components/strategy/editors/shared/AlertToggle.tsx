
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';

interface AlertToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  description?: string;
}

const AlertToggle: React.FC<AlertToggleProps> = ({ 
  enabled, 
  onToggle, 
  description = "Send alert notification when this action is executed" 
}) => {
  return (
    <div className="space-y-2 p-3 bg-muted/30 rounded-md border">
      <div className="flex items-center space-x-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Alert Notification</Label>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        {description}
      </div>
    </div>
  );
};

export default AlertToggle;
