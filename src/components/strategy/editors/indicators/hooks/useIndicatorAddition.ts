
import { v4 as uuidv4 } from 'uuid';
import { formatIndicatorName } from '../../../utils/indicatorHelpers';
import { UseIndicatorManagementProps, IndicatorData } from './types';

export const useIndicatorAddition = ({
  selectedIndicators,
  onChange
}: UseIndicatorManagementProps) => {
  
  const handleAddIndicator = (selectedIndicatorName: string, indicator: any) => {
    // Generate a unique ID for the new indicator
    const indicatorId = uuidv4();
    
    // Create default parameters for the indicator
    const defaultParams: Record<string, any> = {
      indicator_name: indicator.function_name || selectedIndicatorName
    };
    
    // Set default values for parameters
    indicator.parameters.forEach((param: any) => {
      if (param.default !== undefined) {
        defaultParams[param.name] = param.default;
      } else if (param.type === 'integer') {
        defaultParams[param.name] = 14; // Common default
      } else if (param.type === 'select' && param.options && param.options.length > 0) {
        defaultParams[param.name] = param.options[0].value;
      }
    });
    
    // Generate display name
    const displayName = formatIndicatorName(indicator.function_name || selectedIndicatorName, defaultParams);
    
    // Create the complete indicator object that conforms to IndicatorData
    const indicatorData: IndicatorData = {
      display_name: displayName,
      indicator_name: indicator.function_name || selectedIndicatorName,
      ...defaultParams
    };
    
    // Add to selected indicators using UUID as key
    const updatedIndicators = {
      ...selectedIndicators,
      [indicatorId]: indicatorData
    };
    
    onChange(updatedIndicators);
    
    return indicatorId;
  };

  return { handleAddIndicator };
};
