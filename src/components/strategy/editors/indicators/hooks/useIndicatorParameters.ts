
import { useState } from 'react';
import { formatIndicatorName } from '../../../utils/indicatorHelpers';
import { UseIndicatorManagementProps } from './types';

export const useIndicatorParameters = ({
  selectedIndicators,
  onChange
}: UseIndicatorManagementProps) => {
  const [selectedIndicator, setSelectedIndicator] = useState("");
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

  const handleParameterChange = (indicatorId: string, paramName: string, value: any) => {
    const currentIndicator = selectedIndicators[indicatorId];
    if (!currentIndicator) return;

    // Update the parameter
    const updatedParams = {
      ...currentIndicator,
      [paramName]: value
    };

    // Regenerate display name using the indicator_name and all parameters
    const displayName = formatIndicatorName(currentIndicator.indicator_name, updatedParams);
    updatedParams.display_name = displayName;

    const updatedIndicators = {
      ...selectedIndicators,
      [indicatorId]: updatedParams
    };

    onChange(updatedIndicators);
  };

  const toggleOpen = (indicatorId: string) => {
    setOpenStates(prev => ({
      ...prev,
      [indicatorId]: !prev[indicatorId]
    }));
  };

  return {
    selectedIndicator,
    setSelectedIndicator,
    openStates,
    handleParameterChange,
    toggleOpen
  };
};
