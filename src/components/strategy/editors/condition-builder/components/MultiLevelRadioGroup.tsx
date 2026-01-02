import React, { useState, useEffect } from 'react';
import { RadioGroupField } from '../../shared';
import { TimeframeResolver } from '../../../utils/timeframe-migration/TimeframeResolver';
import { useTimeframeMigration } from '../../../utils/timeframe-migration/useTimeframeMigration';

interface StepData {
  instrumentType?: string;
  timeframe?: string;
  indicator?: string;
}

interface MultiLevelRadioGroupProps {
  value?: string;
  onValueChange: (value: string) => void;
  availableInstruments: string[];
  availableTimeframes: string[];
  availableIndicators: Array<{ id: string; displayName: string; timeframe: string; source: string }>;
}

const MultiLevelRadioGroup: React.FC<MultiLevelRadioGroupProps> = ({
  value,
  onValueChange,
  availableInstruments,
  availableTimeframes,
  availableIndicators
}) => {
  const [stepData, setStepData] = useState<StepData>({});
  
  // Initialize TimeframeResolver to ensure timeframes are loaded
  useTimeframeMigration();

  // Initialize from value
  useEffect(() => {
    console.log('🔄 MultiLevelRadioGroup: Initializing from value:', value);
    if (value && value.includes('.')) {
      const parts = value.split('.');
      if (parts.length === 3) {
        const [instrumentType, timeframeId, indicator] = parts;
        console.log('📋 Parsed parts:', { instrumentType, timeframeId, indicator });
        
        // Convert timeframe ID to display value for UI consistency
        const timeframeDisplay = TimeframeResolver.getDisplayValue(timeframeId);
        console.log('🔄 Converted timeframe:', { timeframeId, timeframeDisplay });
        
        const newStepData = { instrumentType, timeframe: timeframeDisplay, indicator };
        console.log('📊 Setting stepData:', newStepData);
        setStepData(newStepData);
      }
    } else {
      console.log('🔄 Clearing stepData');
      setStepData({});
    }
  }, [value]);

  const handleInstrumentChange = (instrumentType: string) => {
    console.log('🔄 Instrument changed to:', instrumentType);
    const newStepData = { instrumentType };
    setStepData(newStepData);
    console.log('📊 Available indicators for instrument:', 
      availableIndicators.filter(ind => ind.source === instrumentType)
    );
  };

  const handleTimeframeChange = (timeframe: string) => {
    const newStepData = { ...stepData, timeframe };
    setStepData(newStepData);
  };

  const handleIndicatorChange = (indicator: string) => {
    const newStepData = { ...stepData, indicator };
    setStepData(newStepData);
    
    // Find the actual timeframe ID for the selected indicator
    const selectedIndicator = availableIndicators.find(ind => ind.id === indicator);
    const timeframeId = selectedIndicator?.timeframe || newStepData.timeframe;
    
    // Emit final value with timeframe ID (not display value)
    const finalValue = `${newStepData.instrumentType}.${timeframeId}.${indicator}`;
    onValueChange(finalValue);
  };

  const getFilteredTimeframes = () => {
    if (!stepData.instrumentType || !availableIndicators || !Array.isArray(availableIndicators)) {
      console.log('⚠️ getFilteredTimeframes: Missing data', {
        instrumentType: stepData.instrumentType,
        availableIndicators: availableIndicators?.length,
        isArray: Array.isArray(availableIndicators)
      });
      return [];
    }
    
    const filteredIndicators = availableIndicators.filter(indicator => indicator.source === stepData.instrumentType);
    console.log('📋 Filtered indicators for', stepData.instrumentType, ':', filteredIndicators);
    
    const timeframeIds = Array.from(new Set(
      filteredIndicators.map(indicator => indicator.timeframe || '1m')
    ));
    
    console.log('🕐 Raw timeframe IDs:', timeframeIds);
    
    // Convert timeframe IDs to display values and sort
    const displayTimeframes = timeframeIds.map(timeframeId => 
      TimeframeResolver.getDisplayValue(timeframeId)
    );
    
    console.log('📅 Final display timeframes:', displayTimeframes);
    return Array.from(new Set(displayTimeframes)).sort();
  };

  const getFilteredIndicators = () => {
    if (!stepData.instrumentType || !stepData.timeframe || !availableIndicators || !Array.isArray(availableIndicators)) {
      return [];
    }
    
    return availableIndicators.filter(indicator => 
      indicator.source === stepData.instrumentType && 
      TimeframeResolver.getDisplayValue(indicator.timeframe) === stepData.timeframe
    );
  };

  // Get instrument type options
  const instrumentTypeOptions = availableInstruments.map(instrument => ({
    value: instrument,
    label: instrument === 'TI' ? 'Trading Instrument' : 'Support Instrument'
  }));

  // Get timeframe options
  const timeframeOptions = getFilteredTimeframes().map(timeframe => ({
    value: timeframe,
    label: timeframe
  }));

  // Get indicator options
  const indicatorOptions = getFilteredIndicators().map(indicator => ({
    value: indicator.id,
    label: indicator.displayName
  }));

  return (
    <div className="space-y-4">
      {/* Step 1: Instrument Type - Always visible */}
      <div className="p-3 border border-blue-200 rounded-lg bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
        <RadioGroupField
          label="Instrument Type" 
          value={stepData.instrumentType || ''}
          options={instrumentTypeOptions}
          onChange={handleInstrumentChange}
          layout="horizontal"
          required={true}
        />
      </div>

      {/* Step 2: Timeframe - Shows after instrument selection */}
      {stepData.instrumentType && timeframeOptions.length > 0 && (
        <div className="p-3 border border-green-200 rounded-lg bg-green-50/50 dark:border-green-800 dark:bg-green-950/30">
          <RadioGroupField
            label={`Timeframe (${timeframeOptions.length} available)`}
            value={stepData.timeframe || ''}
            options={timeframeOptions}
            onChange={handleTimeframeChange}
            layout="horizontal"
            required={true}
          />
        </div>
      )}

      {/* Step 3: Indicator - Shows after timeframe selection */}
      {stepData.timeframe && indicatorOptions.length > 0 && (
        <div className="p-3 border border-purple-200 rounded-lg bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30">
          <RadioGroupField
            label="Indicator" 
            value={stepData.indicator || ''}
            options={indicatorOptions}
            onChange={handleIndicatorChange}
            layout="vertical"
            required={true}
          />
        </div>
      )}
    </div>
  );
};

export default MultiLevelRadioGroup;