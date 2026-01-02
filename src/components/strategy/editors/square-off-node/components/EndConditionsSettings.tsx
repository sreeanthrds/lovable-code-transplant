import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImmediateExitSettings from './ImmediateExitSettings';
import TimeBasedExitSettings from './TimeBasedExitSettings';
import PerformanceBasedExitSettings from './PerformanceBasedExitSettings';
import AlertToggle from '../../shared/AlertToggle';
import { EndConditions } from '../types';

interface EndConditionsSettingsProps {
  endConditions: EndConditions;
  onChange: (conditions: EndConditions) => void;
}

const EndConditionsSettings: React.FC<EndConditionsSettingsProps> = ({
  endConditions,
  onChange
}) => {
  const updateImmediateExit = (immediateExit: EndConditions['immediateExit']) => {
    onChange({
      ...endConditions,
      immediateExit
    });
  };

  const updateTimeBasedExit = (timeBasedExit: EndConditions['timeBasedExit']) => {
    onChange({
      ...endConditions,
      timeBasedExit
    });
  };

  const updatePerformanceBasedExit = (performanceBasedExit: EndConditions['performanceBasedExit']) => {
    onChange({
      ...endConditions,
      performanceBasedExit
    });
  };

  const updateAlertNotification = (enabled: boolean) => {
    onChange({
      ...endConditions,
      alertNotification: { enabled }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-red-200 dark:border-red-700 bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            Immediate Exit
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white/60 dark:bg-black/20 rounded-lg border border-red-200/30 dark:border-red-700/30">
          <ImmediateExitSettings
            settings={endConditions.immediateExit || { enabled: false }}
            onChange={updateImmediateExit}
          />
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Time-Based Exit
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white/60 dark:bg-black/20 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
          <TimeBasedExitSettings
            settings={endConditions.timeBasedExit || { enabled: false }}
            onChange={updateTimeBasedExit}
          />
        </CardContent>
      </Card>

      <Card className="border-2 border-violet-200 dark:border-violet-700 bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
            Performance-Based Exit
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white/60 dark:bg-black/20 rounded-lg border border-violet-200/30 dark:border-violet-700/30">
          <PerformanceBasedExitSettings
            settings={endConditions.performanceBasedExit || { enabled: false }}
            onChange={updatePerformanceBasedExit}
          />
        </CardContent>
      </Card>

      <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/30">
          <AlertToggle
            enabled={endConditions.alertNotification?.enabled || false}
            onToggle={updateAlertNotification}
            description="Send alert notification when strategy end conditions are met"
          />
        </div>
      </div>
    </div>
  );
};

export default EndConditionsSettings;
