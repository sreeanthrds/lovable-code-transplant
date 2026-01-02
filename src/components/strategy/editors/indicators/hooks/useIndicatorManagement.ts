
import { useIndicatorParameters } from './useIndicatorParameters';
import { useIndicatorAddition } from './useIndicatorAddition';
import { useIndicatorRemoval } from './useIndicatorRemoval';
import { useIndicatorUsage } from './useIndicatorUsage';
import { UseIndicatorManagementProps, IndicatorManagementReturn, IndicatorData } from './types';
import { handleError } from '../../../utils/errorHandling';
import { flatIndicatorConfig } from '../../../utils/categorizedIndicatorConfig';

// Fix TS1205 error by using 'export type' for type re-export
export type { UseIndicatorManagementProps };

/**
 * Hook to manage indicator state and operations
 */
export const useIndicatorManagement = (
  selectedIndicators: Record<string, IndicatorData>,
  onChange: (indicators: Record<string, IndicatorData>) => void
): IndicatorManagementReturn => {
  try {
    const props = { selectedIndicators, onChange };
    
    // Use smaller, focused hooks
    const {
      selectedIndicator,
      setSelectedIndicator,
      openStates,
      handleParameterChange,
      toggleOpen
    } = useIndicatorParameters(props);
    
    const { handleAddIndicator: addIndicatorBase } = useIndicatorAddition(props);
    const { handleRemoveIndicator } = useIndicatorRemoval(props);
    const { findUsages } = useIndicatorUsage();
    
    // Wrapper for handleAddIndicator to handle the selected indicator from state
    const handleAddIndicator = (newIndicator: any) => {
      if (!selectedIndicator) return;
      
      const newKey = addIndicatorBase(selectedIndicator, newIndicator);
      
      if (newKey) {
        // Update UI state after adding indicator
        setSelectedIndicator("");
        toggleOpen(newKey);
      }
    };

    const addIndicator = () => {
      if (!selectedIndicator) return;
      
      const indicator = flatIndicatorConfig[selectedIndicator];
      if (indicator) {
        handleAddIndicator(indicator);
      }
    };

    const removeIndicator = (indicatorName: string) => {
      handleRemoveIndicator(indicatorName);
    };

    const updateIndicator = (indicatorName: string, newParams: any) => {
      const existingIndicator = selectedIndicators[indicatorName];
      if (!existingIndicator) return;

      const updatedIndicator: IndicatorData = {
        ...existingIndicator,
        ...newParams
      };

      const updatedIndicators = {
        ...selectedIndicators,
        [indicatorName]: updatedIndicator
      };
      onChange(updatedIndicators);
    };

    const getAvailableIndicators = () => {
      return Object.keys(flatIndicatorConfig).filter(name => !selectedIndicators[name]);
    };
    
    return {
      selectedIndicator,
      openStates,
      setSelectedIndicator,
      handleAddIndicator,
      handleRemoveIndicator,
      handleParameterChange,
      toggleOpen,
      findUsages,
      indicators: selectedIndicators,
      addIndicator,
      removeIndicator,
      updateIndicator,
      getAvailableIndicators
    };
  } catch (error) {
    handleError(error, 'useIndicatorManagement');
    
    // Provide fallback implementation to prevent UI crashes
    return {
      selectedIndicator: "",
      openStates: {},
      setSelectedIndicator: () => {},
      handleAddIndicator: () => {},
      handleRemoveIndicator: () => {},
      handleParameterChange: () => {},
      toggleOpen: () => {},
      findUsages: () => [],
      indicators: {},
      addIndicator: () => {},
      removeIndicator: () => {},
      updateIndicator: () => {},
      getAvailableIndicators: () => []
    };
  }
};
