
import React, { useState, useEffect } from 'react';
import { RadioGroupField, SelectField, InputField } from '../shared';
import { Position } from './types';
import { getExpiryOptions } from './utils/expiryOptionsRegistry';

interface OptionsSettingsSectionProps {
  position: Position;
  exchange?: string;
  symbol?: string;
  onExpiryChange: (value: string) => void;
  onStrikeTypeChange: (value: string) => void;
  onStrikeValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOptionTypeChange: (value: string) => void;
}

const OptionsSettingsSection: React.FC<OptionsSettingsSectionProps> = ({
  position,
  exchange,
  symbol,
  onExpiryChange,
  onStrikeTypeChange,
  onStrikeValueChange,
  onOptionTypeChange
}) => {
  // Get filtered expiry options based on exchange and symbol
  const expiryOptions = getExpiryOptions(exchange, symbol);
  // Ensure optionDetails is never undefined
  const optionDetails = position.optionDetails || {};
  
  const [strikeCategory, setStrikeCategory] = useState<'ATM' | 'ITM' | 'OTM' | 'premium'>(
    optionDetails.strikeType === 'premium' ? 'premium' : 
    optionDetails.strikeType === 'ATM' ? 'ATM' :
    optionDetails.strikeType?.startsWith('ITM') ? 'ITM' : 
    optionDetails.strikeType?.startsWith('OTM') ? 'OTM' : 'ATM'
  );
  
  const [strikeDistance, setStrikeDistance] = useState<string>(
    optionDetails.strikeType && 
    (optionDetails.strikeType.startsWith('ITM') || optionDetails.strikeType.startsWith('OTM')) ? 
    optionDetails.strikeType : ''
  );
  
  const [premiumValue, setPremiumValue] = useState<number | undefined>(
    optionDetails.strikeType === 'premium' ? optionDetails.strikeValue : 100
  );

  useEffect(() => {
    if (optionDetails.strikeType) {
      if (optionDetails.strikeType === 'ATM') {
        setStrikeCategory('ATM');
        setStrikeDistance('');
      } else if (optionDetails.strikeType === 'premium') {
        setStrikeCategory('premium');
        setStrikeDistance('');
        if (optionDetails.strikeValue) {
          setPremiumValue(optionDetails.strikeValue);
        }
      } else if (optionDetails.strikeType.startsWith('ITM')) {
        setStrikeCategory('ITM');
        setStrikeDistance(optionDetails.strikeType);
      } else if (optionDetails.strikeType.startsWith('OTM')) {
        setStrikeCategory('OTM');
        setStrikeDistance(optionDetails.strikeType);
      }
    }
  }, [optionDetails]);

  const handleStrikeCategoryChange = (value: string) => {
    setStrikeCategory(value as any);
    
    if (value === 'ATM') {
      onStrikeTypeChange(value);
      setStrikeDistance('');
    } else if (value === 'premium') {
      onStrikeTypeChange(value);
      onStrikeValueChange({ target: { value: premiumValue !== undefined ? premiumValue.toString() : '' } } as React.ChangeEvent<HTMLInputElement>);
      setStrikeDistance('');
    } else if (value === 'ITM') {
      const newStrikeType = 'ITM1';
      onStrikeTypeChange(newStrikeType);
      setStrikeDistance(newStrikeType);
    } else if (value === 'OTM') {
      const newStrikeType = 'OTM1';
      onStrikeTypeChange(newStrikeType);
      setStrikeDistance(newStrikeType);
    }
  };

  const handleStrikeDistanceChange = (value: string) => {
    setStrikeDistance(value);
    onStrikeTypeChange(value);
  };

  const handlePremiumValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow empty field
    if (e.target.value === '') {
      setPremiumValue(undefined);
      onStrikeValueChange(e);
      return;
    }
    
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setPremiumValue(value);
      onStrikeValueChange(e);
    }
  };

  useEffect(() => {
    if (strikeCategory === 'premium' && optionDetails.strikeType === 'premium') {
      if (optionDetails.strikeValue === undefined) {
        onStrikeValueChange({ target: { value: premiumValue !== undefined ? premiumValue.toString() : '' } } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      <SelectField
        label="Expiry"
        id="expiry"
        value={optionDetails.expiry || expiryOptions[0]?.value || 'M0'}
        onChange={onExpiryChange}
        options={expiryOptions}
      />
      
      <SelectField
        label="Strike Selection"
        id="strike-category"
        value={strikeCategory}
        onChange={handleStrikeCategoryChange}
        options={[
          { value: 'ATM', label: 'At The Money (ATM)' },
          { value: 'ITM', label: 'In The Money (ITM)' },
          { value: 'OTM', label: 'Out of The Money (OTM)' },
          { value: 'premium', label: 'Closest Premium' }
        ]}
      />
      
      {(strikeCategory === 'ITM' || strikeCategory === 'OTM') && (
        <SelectField
          label={`${strikeCategory === 'ITM' ? 'ITM' : 'OTM'} Distance`}
          id="strike-distance"
          value={strikeDistance}
          onChange={handleStrikeDistanceChange}
          options={
            strikeCategory === 'OTM' 
              ? Array.from({ length: 15 }, (_, i) => ({
                  value: `${strikeCategory}${i + 1}`,
                  label: `${i + 1} Strike${i > 0 ? 's' : ''} ${strikeCategory}`
                }))
              : Array.from({ length: 15 }, (_, i) => ({
                  value: `${strikeCategory}${i + 1}`,
                  label: `${i + 1} Strike${i > 0 ? 's' : ''} ${strikeCategory}`
                }))
          }
        />
      )}
      
      {strikeCategory === 'premium' && (
        <InputField
          label="Target Premium (₹)"
          id="premium-value"
          type="number"
          min={1}
          value={optionDetails.strikeValue === undefined ? '' : optionDetails.strikeValue}
          onChange={handlePremiumValueChange}
          placeholder="Enter target premium"
        />
      )}
      
      <RadioGroupField
        label="Option Type"
        value={optionDetails.optionType || 'CE'}
        onChange={onOptionTypeChange}
        options={[
          { value: 'CE', label: 'Call (CE)' },
          { value: 'PE', label: 'Put (PE)' }
        ]}
        layout="horizontal"
      />
    </div>
  );
};

export default OptionsSettingsSection;
