
import React, { useState } from 'react';
import { useIndicatorManagement } from './hooks/useIndicatorManagement';
import SelectedIndicator from './SelectedIndicator';
import AddIndicatorForm from './AddIndicatorForm';
import IndicatorConfigDialog from './IndicatorConfigDialog';
import { flatIndicatorConfig } from '../../utils/categorizedIndicatorConfig';
import { formatIndicatorName } from '../../utils/indicatorHelpers';

interface IndicatorData {
  display_name: string;
  indicator_name: string;
  [key: string]: any;
}

interface IndicatorSelectorProps {
  selectedIndicators: Record<string, IndicatorData>;
  onChange: (indicators: Record<string, IndicatorData>) => void;
}

const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({
  selectedIndicators,
  onChange
}) => {
  const [selectedIndicator, setSelectedIndicator] = useState('');
  const [configDialog, setConfigDialog] = useState<{
    isOpen: boolean;
    indicatorName: string;
    mode: 'add' | 'edit';
    initialValues?: Record<string, any>;
    targetKey?: string;
  }>({
    isOpen: false,
    indicatorName: '',
    mode: 'add'
  });

  const {
    indicators,
    removeIndicator,
    getAvailableIndicators
  } = useIndicatorManagement(selectedIndicators, onChange);

  const availableIndicators = getAvailableIndicators();

  const handleIndicatorSelect = (indicatorName: string) => {
    if (!indicatorName) return;
    
    setSelectedIndicator(indicatorName);
    setConfigDialog({
      isOpen: true,
      indicatorName: indicatorName,
      mode: 'add'
    });
  };

  const handleEditIndicator = (indicatorKey: string, indicatorData: IndicatorData) => {
    setConfigDialog({
      isOpen: true,
      indicatorName: indicatorData.indicator_name,
      mode: 'edit',
      initialValues: indicatorData,
      targetKey: indicatorKey
    });
  };

  const handleConfigConfirm = (params: Record<string, any>) => {
    if (configDialog.mode === 'add') {
      // Add new indicator
      const indicator = flatIndicatorConfig[configDialog.indicatorName];
      if (!indicator) return;

      const key = `${configDialog.indicatorName}_${Date.now()}`;
      const displayName = formatIndicatorName(configDialog.indicatorName, params);
      
      const newIndicatorData: IndicatorData = {
        display_name: displayName,
        indicator_name: configDialog.indicatorName,
        ...params
      };

      onChange({
        ...selectedIndicators,
        [key]: newIndicatorData
      });
      
      setSelectedIndicator('');
    } else if (configDialog.mode === 'edit' && configDialog.targetKey) {
      // Update existing indicator
      const displayName = formatIndicatorName(configDialog.indicatorName, params);
      
      const updatedIndicatorData: IndicatorData = {
        display_name: displayName,
        indicator_name: configDialog.indicatorName,
        ...params
      };

      onChange({
        ...selectedIndicators,
        [configDialog.targetKey]: updatedIndicatorData
      });
    }
  };

  // Handle complete indicator update (including display name)
  const handleIndicatorUpdate = (indicatorId: string, updatedIndicatorData: IndicatorData) => {
    const updatedIndicators = {
      ...indicators,
      [indicatorId]: updatedIndicatorData
    };
    onChange(updatedIndicators);
  };

  return (
    <div className="space-y-4">
      {Object.keys(indicators).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(indicators).map(([indicatorId, indicatorData]) => (
            <SelectedIndicator
              key={indicatorId}
              indicatorId={indicatorId}
              indicatorData={indicatorData}
              onUpdate={(newParams) => handleIndicatorUpdate(indicatorId, newParams)}
              onRemove={() => removeIndicator(indicatorId)}
              onEdit={() => handleEditIndicator(indicatorId, indicatorData)}
            />
          ))}
        </div>
      )}
      
      <AddIndicatorForm
        selectedIndicator={selectedIndicator}
        onSelectIndicator={handleIndicatorSelect}
        onAddIndicator={() => {}} // Not used anymore
      />
      
      <IndicatorConfigDialog
        isOpen={configDialog.isOpen}
        onClose={() => setConfigDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfigConfirm}
        indicatorName={configDialog.indicatorName}
        initialValues={configDialog.initialValues}
        mode={configDialog.mode}
      />
    </div>
  );
};

export default IndicatorSelector;
