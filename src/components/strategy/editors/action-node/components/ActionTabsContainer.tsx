
import React from 'react';
import { Separator } from '@/components/ui/separator';
import OrderDetailsPanel from './OrderDetailsPanel';
import InstrumentPanel from './InstrumentPanel';
import OptionsSettingsPanel from './OptionsSettingsPanel';
import { Position } from '../types';

interface ActionTabsContainerProps {
  actionType?: 'entry' | 'exit' | 'alert';
  position: Position;
  startNodeSymbol?: string;
  hasOptionTrading: boolean;
  onPositionTypeChange: (value: string) => void;
  onOrderTypeChange: (value: string) => void;
  onLimitPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProductTypeChange: (value: string) => void;
  onExpiryChange: (value: string) => void;
  onStrikeTypeChange: (value: string) => void;
  onStrikeValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOptionTypeChange: (value: string) => void;
}

const ActionTabsContainer: React.FC<ActionTabsContainerProps> = ({
  actionType,
  position,
  startNodeSymbol,
  hasOptionTrading,
  onPositionTypeChange,
  onOrderTypeChange,
  onLimitPriceChange,
  onQuantityChange,
  onProductTypeChange,
  onExpiryChange,
  onStrikeTypeChange,
  onStrikeValueChange,
  onOptionTypeChange
}) => {
  return (
    <div className="space-y-6">
      <OrderDetailsPanel 
        actionType={actionType}
        position={position}
        onPositionTypeChange={onPositionTypeChange}
        onOrderTypeChange={onOrderTypeChange}
        onLimitPriceChange={onLimitPriceChange}
        onQuantityChange={onQuantityChange}
        onProductTypeChange={onProductTypeChange}
      />
      
      <Separator className="my-4" />
      
      <InstrumentPanel startNodeSymbol={startNodeSymbol} />
      
      <OptionsSettingsPanel 
        hasOptionTrading={hasOptionTrading}
        position={position}
        onExpiryChange={onExpiryChange}
        onStrikeTypeChange={onStrikeTypeChange}
        onStrikeValueChange={onStrikeValueChange}
        onOptionTypeChange={onOptionTypeChange}
      />
    </div>
  );
};

export default ActionTabsContainer;
