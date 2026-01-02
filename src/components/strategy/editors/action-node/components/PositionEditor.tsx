
import React from 'react';
import { Position } from '../types';
import { InputField, RadioGroupField, SelectField } from '../../shared';
import OptionsSettingsPanel from './OptionsSettingsPanel';
import { EnhancedNumberInput } from '@/components/ui/form/enhanced';

interface PositionEditorProps {
  position: Position;
  hasOptionTrading: boolean;
  isEntryNode?: boolean;
  exchange?: string;
  symbol?: string;
  onPositionChange: (updates: Partial<Position>) => void;
  onPositionTypeChange: (value: string) => void;
  onOrderTypeChange: (value: string) => void;
  onLimitPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMultiplierChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProductTypeChange: (value: string) => void;
  onExpiryChange: (value: string) => void;
  onStrikeTypeChange: (value: string) => void;
  onStrikeValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOptionTypeChange: (value: string) => void;
}

const PositionEditor: React.FC<PositionEditorProps> = ({
  position,
  hasOptionTrading,
  isEntryNode = false,
  exchange,
  symbol,
  onPositionChange,
  onPositionTypeChange,
  onOrderTypeChange,
  onLimitPriceChange,
  onQuantityChange,
  onMultiplierChange,
  onProductTypeChange,
  onExpiryChange,
  onStrikeTypeChange,
  onStrikeValueChange,
  onOptionTypeChange
}) => {
  const handleVpiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPositionChange({ vpi: e.target.value });
  };



  // Create wrapped handlers for the EnhancedNumberInput components
  const handleLimitPriceChange = (value: number | undefined) => {
    const simulatedEvent = {
      target: {
        value: value !== undefined ? String(value) : '',
        id: 'limit-price',
        type: 'number'
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onLimitPriceChange(simulatedEvent);
  };
  
  const handleQuantityChange = (value: number | undefined) => {
    const simulatedEvent = {
      target: {
        value: value !== undefined ? String(value) : '',
        id: 'quantity',
        type: 'number'
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onQuantityChange(simulatedEvent);
  };
  
  const handleMultiplierChange = (value: number | undefined) => {
    console.log('PositionEditor handleMultiplierChange wrapper called with:', value);
    console.log('Creating simulated event for onMultiplierChange');
    const simulatedEvent = {
      target: {
        value: value !== undefined ? String(value) : '',
        id: 'multiplier',
        type: 'number'
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    console.log('Calling onMultiplierChange with simulated event:', simulatedEvent);
    onMultiplierChange(simulatedEvent);
  };
  
  const handleStrikeValueChange = (value: number | undefined) => {
    const simulatedEvent = {
      target: {
        value: value !== undefined ? String(value) : '',
        id: 'strike-value',
        type: 'number'
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onStrikeValueChange(simulatedEvent);
  };

  // Display limit price input conditionally
  const showLimitPrice = position.orderType === 'limit';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <InputField
          label="VPI"
          id="vpi"
          value={position.vpi || ''}
          onChange={handleVpiChange}
          placeholder="Position ID"
          readOnly={true}
          description="Virtual Position ID (read-only)"
        />
        
        <EnhancedNumberInput
          label="Max Entries"
          id="max-entries"
          min={1}
          max={99}
          value={position.maxEntries ?? 1}
          onChange={(value) => onPositionChange({ maxEntries: value || 1 })}
          description="Maximum entries allowed"
        />
      </div>
      
      
      <RadioGroupField
        label="Position Type"
        value={position.positionType || 'buy'}
        onChange={onPositionTypeChange}
        options={[
          { value: 'buy', label: 'Buy' },
          { value: 'sell', label: 'Sell' }
        ]}
        layout="horizontal"
      />
      
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="Order Type"
          id="order-type"
          value={position.orderType || 'market'}
          onChange={onOrderTypeChange}
          options={[
            { value: 'market', label: 'Market' },
            { value: 'limit', label: 'Limit (Coming Soon)', disabled: true }
          ]}
        />
        
        <EnhancedNumberInput
          label="Quantity"
          id="quantity"
          min={1}
          value={position.quantity}
          onChange={handleQuantityChange}
          placeholder="Quantity"
        />
      </div>
      
      {showLimitPrice && (
        <EnhancedNumberInput
          label="Limit Price"
          id="limit-price"
          value={position.limitPrice}
          onChange={handleLimitPriceChange}
          placeholder="Limit price"
          min={0.01}
          step={0.01}
        />
      )}
      
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="Product Type"
          id="product-type"
          value={position.productType || 'intraday'}
          onChange={onProductTypeChange}
          options={[
            { value: 'intraday', label: 'Intraday (MIS)' },
            { value: 'carryForward', label: 'Carry Forward (CNC)' }
          ]}
        />
        
        <EnhancedNumberInput
          label="Multiplier(Lot size)"
          id="multiplier"
          min={0.01}
          step={0.01}
          value={position.multiplier}
          onChange={handleMultiplierChange}
          placeholder="Multiplier"
        />
      </div>
      
      {hasOptionTrading && (
        <OptionsSettingsPanel 
          position={position}
          hasOptionTrading={hasOptionTrading}
          exchange={exchange}
          symbol={symbol}
          onExpiryChange={onExpiryChange}
          onStrikeTypeChange={onStrikeTypeChange}
          onStrikeValueChange={onStrikeValueChange}
          onOptionTypeChange={onOptionTypeChange}
        />
      )}
    </div>
  );
};

export default PositionEditor;
