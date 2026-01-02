
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import InputField from '../../shared/InputField';

interface TimeBasedExitSettings {
  enabled: boolean;
  exitTime?: string;
  exitAtMarketClose?: boolean;
  minutesBeforeClose?: number;
}

interface TimeBasedExitSettingsProps {
  settings: TimeBasedExitSettings;
  onChange: (settings: TimeBasedExitSettings) => void;
}

const TimeBasedExitSettings: React.FC<TimeBasedExitSettingsProps> = ({
  settings,
  onChange
}) => {
  const updateSetting = (key: keyof TimeBasedExitSettings, value: any) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const handleExitOptionChange = (value: string) => {
    if (value === 'specific-time') {
      onChange({
        ...settings,
        exitAtMarketClose: false,
        exitTime: settings.exitTime || '15:30' // Set default time if none exists
      });
    } else if (value === 'market-close') {
      onChange({
        ...settings,
        exitAtMarketClose: true,
        exitTime: '', // Clear specific time
        minutesBeforeClose: settings.minutesBeforeClose || 5 // Set default if none exists
      });
    }
  };

  const getSelectedExitOption = () => {
    return settings.exitAtMarketClose ? 'market-close' : 'specific-time';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="time-based-exit"
          checked={settings.enabled}
          onCheckedChange={(checked) => updateSetting('enabled', checked)}
        />
        <Label htmlFor="time-based-exit" className="text-sm">
          Enable time-based strategy exit
        </Label>
      </div>

      {settings.enabled && (
        <div className="space-y-4 pl-4 border-l-2 border-border">
          <RadioGroup
            value={getSelectedExitOption()}
            onValueChange={handleExitOptionChange}
            className="space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific-time" id="specific-time" />
                <Label htmlFor="specific-time" className="text-sm">
                  Exit at specific time
                </Label>
              </div>
              
              {getSelectedExitOption() === 'specific-time' && (
                <div className="pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="exit-time" className="text-sm">Exit Time</Label>
                    <Input
                      id="exit-time"
                      type="time"
                      value={settings.exitTime || ''}
                      onChange={(e) => updateSetting('exitTime', e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="market-close" id="market-close" />
                <Label htmlFor="market-close" className="text-sm">
                  Exit at market close
                </Label>
              </div>
              
              {getSelectedExitOption() === 'market-close' && (
                <div className="pl-6">
                  <InputField
                    label="Minutes before market close"
                    id="minutes-before-close"
                    type="number"
                    value={settings.minutesBeforeClose || 5}
                    onChange={(e) => updateSetting('minutesBeforeClose', parseInt(e.target.value) || 5)}
                    min={1}
                    max={60}
                    step={1}
                    description="Exit positions this many minutes before market close"
                  />
                </div>
              )}
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
};

export default TimeBasedExitSettings;
