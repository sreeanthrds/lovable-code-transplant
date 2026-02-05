
import React from 'react';
import { Expression } from '../../utils/conditions';
import { useIndicatorSelector } from './hooks/useIndicatorSelector';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import IndicatorMissingAlert from './components/IndicatorMissingAlert';
import IndicatorParameterSelector from './components/IndicatorParameterSelector';
import NoIndicatorsHelp from './components/NoIndicatorsHelp';
import MultiLevelRadioGroup from './components/MultiLevelRadioGroup';
import { TimeframeResolver } from '../../utils/timeframe-migration/TimeframeResolver';
import { useTimeframeMigration } from '../../utils/timeframe-migration/useTimeframeMigration';

interface IndicatorSelectorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
  conditionContext?: 'entry' | 'exit';
}

const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({
  expression,
  updateExpression,
  required = false,
  conditionContext = 'entry'
}) => {
  const strategyStore = useStrategyStore();
  
  // Initialize TimeframeResolver to ensure timeframes are loaded
  useTimeframeMigration();
  const {
    indicatorExpr,
    availableIndicators,
    missingIndicator,
    hasMultipleOutputs,
    getParameterOptions,
    getIndicatorDisplayName,
    updateParameter
  } = useIndicatorSelector({ expression, updateExpression });
  
  // Update indicator from multilevel selection (e.g., "TI.tf_1.EMA")
  const handleIndicatorNameChange = (value: string) => {
    const parts = value.split('.');
    if (parts.length === 3) {
      const [instrumentType, timeframeId, indicatorName] = parts;
      const updatedExpr = {
        ...indicatorExpr,
        instrumentType: instrumentType as 'TI' | 'SI',
        timeframeId,
        timeframe: undefined, // Clear legacy field
        name: indicatorName
      };
      updateExpression(updatedExpr);
    }
  };
  
  // Get current multilevel value for display
  const getCurrentIndicatorValue = () => {
    if (indicatorExpr.instrumentType && indicatorExpr.timeframeId && indicatorExpr.name) {
      return `${indicatorExpr.instrumentType}.${indicatorExpr.timeframeId}.${indicatorExpr.name}`;
    }
    return '';
  };

  // Get display text for the selected indicator
  const getIndicatorDisplayText = () => {
    if (!indicatorExpr.name) return '';
    
    const displayName = getIndicatorDisplayName(indicatorExpr.name);
    const parameter = indicatorExpr.parameter;
    
    if (parameter && hasMultipleOutputs(indicatorExpr.name)) {
      return `${displayName} (${parameter})`;
    }
    
    return displayName;
  };
  
  // Helper functions to extract data for the new component structure
  const getAvailableInstruments = () => {
    // Check if supporting instrument is enabled
    const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
    const isSupportingInstrumentEnabled = startNode?.data?.supportingInstrumentEnabled !== false;
    
    const instruments = ['TI'];
    if (isSupportingInstrumentEnabled) {
      instruments.push('SI');
    }
    return instruments;
  };

  const getAvailableTimeframes = () => {
    if (!availableIndicators || !Array.isArray(availableIndicators)) {
      return [];
    }
    
    const timeframeIds = Array.from(new Set(
      availableIndicators.map(indicator => (indicator as any).timeframe || '1m')
    ));
    
    const displayTimeframes = timeframeIds.map(timeframeId => 
      TimeframeResolver.getDisplayValue(timeframeId)
    );
    
    return Array.from(new Set(displayTimeframes)).sort();
  };
  
  return (
    <div className="space-y-2">
      {missingIndicator && indicatorExpr.name && (
        <IndicatorMissingAlert
          indicatorName={indicatorExpr.name}
          displayName={getIndicatorDisplayName(indicatorExpr.name)}
        />
      )}
      
      <MultiLevelRadioGroup
        value={getCurrentIndicatorValue()}
        onValueChange={handleIndicatorNameChange}
        availableInstruments={getAvailableInstruments()}
        availableTimeframes={getAvailableTimeframes()}
        availableIndicators={availableIndicators as Array<{ id: string; displayName: string; timeframe: string; source: string }>}
      />
      
      {indicatorExpr.name && hasMultipleOutputs(indicatorExpr.name) && (
        <IndicatorParameterSelector
          parameter={indicatorExpr.parameter}
          parameters={getParameterOptions(indicatorExpr.name)}
          onParameterChange={updateParameter}
          required={required && hasMultipleOutputs(indicatorExpr.name)}
        />
      )}
      
      {availableIndicators.length === 0 && (
        <NoIndicatorsHelp />
      )}
    </div>
  );
};

export default IndicatorSelector;
