
import React from 'react';
import { EnhancedNumberInput, EnhancedSelectField } from '@/components/ui/form/enhanced';
import EnhancedSwitch from '@/components/ui/form/enhanced/EnhancedSwitch';
import EnhancedRadioGroup from '@/components/ui/form/enhanced/EnhancedRadioGroup';
import { TrailingStopConfig, TriggerType, TimeUnit } from '../exit-node/types';

interface TrailingStopSectionProps {
  trailingStop: TrailingStopConfig;
  handleTrailingStopParamChange: (updates: Partial<TrailingStopConfig>) => void;
  handleTrailingStopReEntryToggle: (enabled: boolean) => void;
  handleReEntryUpdate: (
    feature: 'trailingStop',
    updates: Partial<{ maxEntries: number }>
  ) => void;
}

const TrailingStopSection: React.FC<TrailingStopSectionProps> = ({
  trailingStop,
  handleTrailingStopParamChange,
  handleTrailingStopReEntryToggle,
  handleReEntryUpdate
}) => {
  // Set default trigger type if not available
  const triggerType = trailingStop.triggerType || 'percentage';

  const handleTriggerTypeChange = (value: string) => {
    handleTrailingStopParamChange({ triggerType: value as TriggerType });
  };

  const handleWaitForMarketToggle = (enabled: boolean) => {
    handleTrailingStopParamChange({ 
      waitForMarket: enabled,
      waitTime: enabled ? (trailingStop.waitTime || 5) : undefined,
      waitTimeUnit: enabled ? (trailingStop.waitTimeUnit || 'seconds') : undefined
    });
  };

  const handleWaitTimeChange = (value: number | undefined) => {
    handleTrailingStopParamChange({ waitTime: value });
  };

  const handleTimeUnitChange = (value: string) => {
    handleTrailingStopParamChange({ waitTimeUnit: value as TimeUnit });
  };

  const handleLimitBufferChange = (value: number | undefined) => {
    handleTrailingStopParamChange({ limitBuffer: value });
  };

  const renderDistanceInput = () => {
    switch (triggerType) {
      case 'percentage':
        return (
          <EnhancedNumberInput
            label="Initial Distance (%)"
            value={trailingStop.initialDistance}
            onChange={(value) => handleTrailingStopParamChange({ initialDistance: value })}
            min={0.1}
            step={0.1}
            tooltip="Initial trailing distance as percentage"
          />
        );
      case 'points':
        return (
          <EnhancedNumberInput
            label="Initial Distance (Points)"
            value={trailingStop.initialPoints}
            onChange={(value) => handleTrailingStopParamChange({ initialPoints: value })}
            min={0.1}
            step={0.1}
            tooltip="Initial trailing distance in points"
          />
        );
      case 'pnl':
        return (
          <EnhancedNumberInput
            label="Initial Distance (P&L)"
            value={trailingStop.initialPnl}
            onChange={(value) => handleTrailingStopParamChange({ initialPnl: value })}
            min={0}
            step={100}
            tooltip="Initial trailing distance in P&L amount"
          />
        );
      default:
        return null;
    }
  };

  const renderStepSizeInput = () => {
    switch (triggerType) {
      case 'percentage':
        return (
          <EnhancedNumberInput
            label="Step Size (%)"
            value={trailingStop.stepSize}
            onChange={(value) => handleTrailingStopParamChange({ stepSize: value })}
            min={0.1}
            step={0.1}
            tooltip="Step size for trailing adjustment as percentage"
          />
        );
      case 'points':
        return (
          <EnhancedNumberInput
            label="Step Size (Points)"
            value={trailingStop.pointsStepSize}
            onChange={(value) => handleTrailingStopParamChange({ pointsStepSize: value })}
            min={0.1}
            step={0.1}
            tooltip="Step size for trailing adjustment in points"
          />
        );
      case 'pnl':
        return (
          <EnhancedNumberInput
            label="Step Size (P&L)"
            value={trailingStop.pnlStepSize}
            onChange={(value) => handleTrailingStopParamChange({ pnlStepSize: value })}
            min={0}
            step={100}
            tooltip="Step size for trailing adjustment in P&L amount"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="pl-4 space-y-3 pt-1">
      <EnhancedRadioGroup
        label="Trigger Type"
        value={triggerType}
        onChange={handleTriggerTypeChange}
        options={[
          { value: 'percentage', label: 'Percentage' },
          { value: 'points', label: 'Points' },
          { value: 'pnl', label: 'P&L' },
        ]}
        layout="horizontal"
        tooltip="Type of measurement to use for trailing stop"
      />
      
      {renderDistanceInput()}
      {renderStepSizeInput()}
      
      <div className="pt-1 pb-2 border-t border-border/30 mt-2">
        <EnhancedSwitch
          id="wait-for-market-toggle"
          label="Wait before Market Order"
          checked={trailingStop.waitForMarket || false}
          onCheckedChange={handleWaitForMarketToggle}
          tooltip="Wait for a specified time before converting to market order"
        />
        
        {trailingStop.waitForMarket && (
          <div className="pl-4 space-y-3 pt-2 flex items-center gap-2">
            <EnhancedNumberInput
              label="Wait Time"
              value={trailingStop.waitTime || 5}
              onChange={handleWaitTimeChange}
              min={1}
              step={1}
              tooltip="Time to wait before converting to market order"
              className="flex-1"
            />
            
            <EnhancedSelectField
              label="Time Unit"
              value={trailingStop.waitTimeUnit || 'seconds'}
              onChange={handleTimeUnitChange}
              options={[
                { value: 'seconds', label: 'Seconds' },
                { value: 'minutes', label: 'Minutes' },
                { value: 'hours', label: 'Hours' }
              ]}
              tooltip="Unit of time to wait"
              className="flex-1"
            />
          </div>
        )}
      </div>

      <div className="pt-1 pb-2 border-t border-border/30">
        <EnhancedNumberInput
          label="Limit Price Buffer"
          value={trailingStop.limitBuffer}
          onChange={handleLimitBufferChange}
          min={0}
          step={0.1}
          tooltip="Buffer amount from trigger price for limit orders"
        />
      </div>
      
      <div className="pt-1 border-t border-border/30">
        <EnhancedSwitch
          id="trailing-stop-reentry-toggle"
          label="Re-entry After Trailing Stop"
          checked={trailingStop.reEntry?.enabled || false}
          onCheckedChange={handleTrailingStopReEntryToggle}
          tooltip="Re-enter the position after trailing stop is triggered"
        />
        
        {trailingStop.reEntry?.enabled && (
          <div className="pl-4 space-y-3 pt-2">
            <EnhancedNumberInput
              label="Group Number"
              value={1}
              onChange={() => {}} 
              disabled={true}
              min={1}
              step={1}
              tooltip="Group number for re-entry coordination"
            />
            
            <EnhancedNumberInput
              label="Max Entries"
              value={trailingStop.reEntry?.maxEntries}
              onChange={(value) => handleReEntryUpdate('trailingStop', { maxEntries: value })}
              min={1}
              step={1}
              tooltip="Maximum number of entries after trailing stop"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TrailingStopSection;
