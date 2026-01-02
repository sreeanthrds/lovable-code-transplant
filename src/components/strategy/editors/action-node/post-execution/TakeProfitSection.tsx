
import React from 'react';
import { EnhancedNumberInput, EnhancedSelectField } from '@/components/ui/form/enhanced';
import EnhancedSwitch from '@/components/ui/form/enhanced/EnhancedSwitch';
import EnhancedRadioGroup from '@/components/ui/form/enhanced/EnhancedRadioGroup';
import { TakeProfitConfig, TriggerType, TimeUnit } from '../exit-node/types';

interface TakeProfitSectionProps {
  takeProfit: TakeProfitConfig;
  handleTakeProfitParamChange: (updates: Partial<TakeProfitConfig>) => void;
  handleTakeProfitReEntryToggle: (enabled: boolean) => void;
  handleReEntryUpdate: (
    feature: 'takeProfit',
    updates: Partial<{ maxEntries: number }>
  ) => void;
}

const TakeProfitSection: React.FC<TakeProfitSectionProps> = ({
  takeProfit,
  handleTakeProfitParamChange,
  handleTakeProfitReEntryToggle,
  handleReEntryUpdate
}) => {
  // Set default trigger type if not available
  const triggerType = takeProfit.triggerType || 'percentage';

  const handleTriggerTypeChange = (value: string) => {
    handleTakeProfitParamChange({ triggerType: value as TriggerType });
  };

  const handleWaitForMarketToggle = (enabled: boolean) => {
    handleTakeProfitParamChange({ 
      waitForMarket: enabled,
      waitTime: enabled ? (takeProfit.waitTime || 5) : undefined,
      waitTimeUnit: enabled ? (takeProfit.waitTimeUnit || 'seconds') : undefined
    });
  };

  const handleWaitTimeChange = (value: number | undefined) => {
    handleTakeProfitParamChange({ waitTime: value });
  };

  const handleTimeUnitChange = (value: string) => {
    handleTakeProfitParamChange({ waitTimeUnit: value as TimeUnit });
  };

  const handleLimitBufferChange = (value: number | undefined) => {
    handleTakeProfitParamChange({ limitBuffer: value });
  };

  const renderTargetInput = () => {
    switch (triggerType) {
      case 'percentage':
        return (
          <EnhancedNumberInput
            label="Target Percentage"
            value={takeProfit.targetPercentage}
            onChange={(value) => handleTakeProfitParamChange({ targetPercentage: value })}
            min={0.1}
            step={0.1}
            tooltip="Target percentage for take profit"
          />
        );
      case 'points':
        return (
          <EnhancedNumberInput
            label="Target Points"
            value={takeProfit.targetPoints}
            onChange={(value) => handleTakeProfitParamChange({ targetPoints: value })}
            min={0.1}
            step={0.1}
            tooltip="Target points for take profit"
          />
        );
      case 'pnl':
        return (
          <EnhancedNumberInput
            label="Target P&L"
            value={takeProfit.targetPnl}
            onChange={(value) => handleTakeProfitParamChange({ targetPnl: value })}
            min={0}
            step={100}
            tooltip="Target P&L amount for take profit"
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
        tooltip="Type of measurement to use for take profit"
      />
      
      {renderTargetInput()}
      
      <div className="pt-1 pb-2 border-t border-border/30 mt-2">
        <EnhancedSwitch
          id="wait-for-market-toggle"
          label="Wait before Market Order"
          checked={takeProfit.waitForMarket || false}
          onCheckedChange={handleWaitForMarketToggle}
          tooltip="Wait for a specified time before converting to market order"
        />
        
        {takeProfit.waitForMarket && (
          <div className="pl-4 space-y-3 pt-2 flex items-center gap-2">
            <EnhancedNumberInput
              label="Wait Time"
              value={takeProfit.waitTime || 5}
              onChange={handleWaitTimeChange}
              min={1}
              step={1}
              tooltip="Time to wait before converting to market order"
              className="flex-1"
            />
            
            <EnhancedSelectField
              label="Time Unit"
              value={takeProfit.waitTimeUnit || 'seconds'}
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
          value={takeProfit.limitBuffer}
          onChange={handleLimitBufferChange}
          min={0}
          step={0.1}
          tooltip="Buffer amount from trigger price for limit orders"
        />
      </div>
      
      <div className="pt-1 border-t border-border/30">
        <EnhancedSwitch
          id="take-profit-reentry-toggle"
          label="Re-entry After Take Profit"
          checked={takeProfit.reEntry?.enabled || false}
          onCheckedChange={handleTakeProfitReEntryToggle}
          tooltip="Re-enter the position after take profit is triggered"
        />
        
        {takeProfit.reEntry?.enabled && (
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
              value={takeProfit.reEntry?.maxEntries}
              onChange={(value) => handleReEntryUpdate('takeProfit', { maxEntries: value })}
              min={1}
              step={1}
              tooltip="Maximum number of entries after take profit"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeProfitSection;
