
import { useCallback } from 'react';
import { Position } from '../types';

interface UseOptionSettingsProps {
  position: Position;
  onPositionChange: (updates: Partial<Position>) => void;
}

export const useOptionSettings = ({
  position,
  onPositionChange
}: UseOptionSettingsProps) => {
  // Create option details object if it doesn't exist
  const ensureOptionDetails = useCallback(() => {
    if (!position.optionDetails) {
      // Initialize with defaults and update the position
      onPositionChange({ 
        optionDetails: {
          expiry: 'W0',
          strikeType: 'ATM',
          optionType: 'CE'
        }
      });
    }
  }, [position, onPositionChange]);
  
  const handleExpiryChange = useCallback((value: string) => {
    ensureOptionDetails();
    onPositionChange({ 
      optionDetails: {
        ...position.optionDetails,
        expiry: value
      }
    });
  }, [position.optionDetails, onPositionChange, ensureOptionDetails]);
  
  const handleStrikeTypeChange = useCallback((value: string) => {
    ensureOptionDetails();
    
    // Make sure we validate the value to match the expected type
    const validatedStrikeType = value as Position['optionDetails']['strikeType'];
    
    // For premium type, ensure we initialize with default strike value if not already set
    const updatedOptions = { 
      ...position.optionDetails,
      strikeType: validatedStrikeType
    };
    
    // If changing to premium type and no strike value is set, set a default
    if (value === 'premium' && !position.optionDetails?.strikeValue) {
      updatedOptions.strikeValue = 100;
    }
    
    onPositionChange({ 
      optionDetails: updatedOptions
    });
  }, [position.optionDetails, onPositionChange, ensureOptionDetails]);
  
  const handleStrikeValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    ensureOptionDetails();
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      onPositionChange({ 
        optionDetails: {
          ...position.optionDetails,
          strikeValue: value
        }
      });
    }
  }, [position.optionDetails, onPositionChange, ensureOptionDetails]);
  
  const handleOptionTypeChange = useCallback((value: string) => {
    ensureOptionDetails();
    // Make sure we validate the value to match the expected type
    const validatedOptionType = value as 'CE' | 'PE';
    
    onPositionChange({ 
      optionDetails: {
        ...position.optionDetails,
        optionType: validatedOptionType
      }
    });
  }, [position.optionDetails, onPositionChange, ensureOptionDetails]);
  
  return {
    handleExpiryChange,
    handleStrikeTypeChange,
    handleStrikeValueChange,
    handleOptionTypeChange
  };
};
