
import React from 'react';
import { EnhancedNumberInput, EnhancedSelectField } from '@/components/ui/form/enhanced';
import EnhancedSwitch from '@/components/ui/form/enhanced/EnhancedSwitch';
import EnhancedRadioGroup from '@/components/ui/form/enhanced/EnhancedRadioGroup';
import { StopLossConfig, TriggerType, TimeUnit } from '../exit-node/types';
import { DollarSign, PercentIcon, Hash, Clock, Shield } from 'lucide-react';

interface StopLossSectionProps {
  stopLoss: StopLossConfig;
  handleStopLossParamChange: (updates: Partial<StopLossConfig>) => void;
  handleStopLossReEntryToggle: (enabled: boolean) => void;
  handleReEntryUpdate: (
    feature: 'stopLoss',
    updates: Partial<{ maxEntries: number }>
  ) => void;
}

const StopLossSection: React.FC<StopLossSectionProps> = ({
  stopLoss,
  handleStopLossParamChange,
  handleStopLossReEntryToggle,
  handleReEntryUpdate
}) => {
  // Set default trigger type if not available
  const triggerType = stopLoss.triggerType || 'percentage';

  const handleTriggerTypeChange = (value: string) => {
    handleStopLossParamChange({ triggerType: value as TriggerType });
  };

  const handleWaitForMarketToggle = (enabled: boolean) => {
    handleStopLossParamChange({ 
      waitForMarket: enabled,
      waitTime: enabled ? (stopLoss.waitTime || 5) : undefined,
      waitTimeUnit: enabled ? (stopLoss.waitTimeUnit || 'seconds') : undefined
    });
  };

  const handleWaitTimeChange = (value: number | undefined) => {
    handleStopLossParamChange({ waitTime: value });
  };

  const handleTimeUnitChange = (value: string) => {
    handleStopLossParamChange({ waitTimeUnit: value as TimeUnit });
  };

  const handleLimitBufferChange = (value: number | undefined) => {
    handleStopLossParamChange({ limitBuffer: value });
  };

  const renderTriggerInput = () => {
    switch (triggerType) {
      case 'percentage':
        return (
          <EnhancedNumberInput
            label="Stop Percentage"
            value={stopLoss.stopPercentage}
            onChange={(value) => handleStopLossParamChange({ stopPercentage: value })}
            min={0.1}
            max={100}
            step={0.1}
            tooltip="Percentage below entry price for stop loss"
          />
        );
      case 'points':
        return (
          <EnhancedNumberInput
            label="Stop Points"
            value={stopLoss.stopPoints}
            onChange={(value) => handleStopLossParamChange({ stopPoints: value })}
            min={0.1}
            step={0.1}
            tooltip="Points below entry price for stop loss"
          />
        );
      case 'pnl':
        return (
          <EnhancedNumberInput
            label="Stop P&L"
            value={stopLoss.stopPnl}
            onChange={(value) => handleStopLossParamChange({ stopPnl: value })}
            min={0}
            step={100}
            tooltip="Maximum loss amount for stop loss trigger"
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
        tooltip="Type of measurement to use for stop loss"
      />
      
      {renderTriggerInput()}
      
      <div className="pt-1 pb-2 border-t border-border/30 mt-2">
        <EnhancedSwitch
          id="wait-for-market-toggle"
          label="Wait before Market Order"
          checked={stopLoss.waitForMarket || false}
          onCheckedChange={handleWaitForMarketToggle}
          tooltip="Wait for a specified time before converting to market order"
        />
        
        {stopLoss.waitForMarket && (
          <div className="pl-4 space-y-3 pt-2 flex items-center gap-2">
            <EnhancedNumberInput
              label="Wait Time"
              value={stopLoss.waitTime || 5}
              onChange={handleWaitTimeChange}
              min={1}
              step={1}
              tooltip="Time to wait before converting to market order"
              className="flex-1"
            />
            
            <EnhancedSelectField
              label="Time Unit"
              value={stopLoss.waitTimeUnit || 'seconds'}
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
          value={stopLoss.limitBuffer}
          onChange={handleLimitBufferChange}
          min={0}
          step={0.1}
          tooltip="Buffer amount from trigger price for limit orders"
        />
      </div>
      
      <div className="pt-1 border-t border-border/30">
        <EnhancedSwitch
          id="stop-loss-reentry-toggle"
          label="Re-entry After Stop Loss"
          checked={stopLoss.reEntry?.enabled || false}
          onCheckedChange={handleStopLossReEntryToggle}
          tooltip="Re-enter the position after stop loss is triggered"
        />
        
        {stopLoss.reEntry?.enabled && (
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
              value={stopLoss.reEntry?.maxEntries}
              onChange={(value) => handleReEntryUpdate('stopLoss', { maxEntries: value })}
              min={1}
              step={1}
              tooltip="Maximum number of entries after stop loss"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StopLossSection;
