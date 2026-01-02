
import { useCallback } from 'react';
import { Position } from '../types';

interface UsePositionHandlersProps {
  selectedPosition: Position | null;
  handlePositionChange: (positionVpi: string, updates: Partial<Position>) => void;
}

export const usePositionHandlers = ({
  selectedPosition,
  handlePositionChange
}: UsePositionHandlersProps) => {
  // Handler for the selected position
  const handleSelectedPositionChange = useCallback((updates: Partial<Position>) => {
    console.log('handleSelectedPositionChange called with updates:', updates);
    console.log('Selected position VPI:', selectedPosition?.vpi);
    if (!selectedPosition) {
      console.log('No selected position!');
      return;
    }
    
    console.log('Calling handlePositionChange for VPI:', selectedPosition.vpi);
    handlePositionChange(selectedPosition.vpi, updates);
  }, [selectedPosition, handlePositionChange]);

  // Generate position-specific handlers
  const positionHandlers = selectedPosition ? {
    handlePositionTypeChange: (value: string) => 
      handleSelectedPositionChange({ positionType: value as 'buy' | 'sell' }),
    
    handleOrderTypeChange: (value: string) => 
      handleSelectedPositionChange({ 
        orderType: value as 'market' | 'limit',
        ...(value === 'market' && { limitPrice: undefined })
      }),
    
    handleLimitPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
      if (value === undefined || !isNaN(value)) {
        handleSelectedPositionChange({ limitPrice: value });
      }
    },
    
    handleQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      // Handle empty value case
      if (e.target.value === '') {
        handleSelectedPositionChange({ quantity: undefined });
        return;
      }
      
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value > 0) {
        handleSelectedPositionChange({ quantity: value });
      }
    },
    
    handleMultiplierChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log('handleMultiplierChange called with value:', e.target.value);
      console.log('Selected position:', selectedPosition);
      
      // Handle empty value case
      if (e.target.value === '') {
        console.log('Setting multiplier to undefined');
        handleSelectedPositionChange({ multiplier: undefined });
        return;
      }
      
      const value = parseFloat(e.target.value);
      console.log('Parsed multiplier value:', value);
      if (!isNaN(value) && value > 0) {
        console.log('Calling handleSelectedPositionChange with multiplier:', value);
        handleSelectedPositionChange({ multiplier: value });
      }
    },
    
    handleProductTypeChange: (value: string) => 
      handleSelectedPositionChange({ productType: value as 'intraday' | 'carryForward' }),
    
    handleExpiryChange: (value: string) => 
      handleSelectedPositionChange({ 
        optionDetails: {
          ...selectedPosition.optionDetails,
          expiry: value
        }
      }),
    
    handleStrikeTypeChange: (value: string) => {
      // Make sure we validate the value to match the expected type
      const validatedValue = value as Position['optionDetails']['strikeType'];
      
      const updatedDetails = {
        ...selectedPosition.optionDetails,
        strikeType: validatedValue
      };
      
      // If changing to premium type and no strike value is set, set a default
      if (value === 'premium' && !selectedPosition.optionDetails?.strikeValue) {
        updatedDetails.strikeValue = 100;
      }
      
      handleSelectedPositionChange({ optionDetails: updatedDetails });
    },
    
    handleStrikeValueChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      // Handle empty value case
      if (e.target.value === '') {
        handleSelectedPositionChange({ 
          optionDetails: {
            ...selectedPosition.optionDetails,
            strikeValue: undefined
          }
        });
        return;
      }
      
      const value = parseFloat(e.target.value);
      if (!isNaN(value)) {
        handleSelectedPositionChange({ 
          optionDetails: {
            ...selectedPosition.optionDetails,
            strikeValue: value
          }
        });
      }
    },
    
    handleOptionTypeChange: (value: string) => {
      // Make sure we validate the value to match the expected type
      const validatedValue = value as 'CE' | 'PE';
      
      handleSelectedPositionChange({ 
        optionDetails: {
          ...selectedPosition.optionDetails,
          optionType: validatedValue
        }
      });
    }
  } : {
    handlePositionTypeChange: () => {},
    handleOrderTypeChange: () => {},
    handleLimitPriceChange: () => {},
    handleQuantityChange: () => {},
    handleMultiplierChange: () => {},
    handleProductTypeChange: () => {},
    handleExpiryChange: () => {},
    handleStrikeTypeChange: () => {},
    handleStrikeValueChange: () => {},
    handleOptionTypeChange: () => {}
  };

  return {
    handleSelectedPositionChange,
    ...positionHandlers
  };
};
