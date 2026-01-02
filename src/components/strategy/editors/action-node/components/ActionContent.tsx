
import React from 'react';
import { Separator } from '@/components/ui/separator';
import ActionTypeSelector from '../ActionTypeSelector';
import AlertMessage from '../AlertMessage';
import ActionTabsContainer from './ActionTabsContainer';
import { NodeData, Position } from '../types';

interface ActionContentProps {
  nodeData: NodeData;
  selectedPosition: Position;
  showLimitPrice: boolean;
  hasOptionTrading: boolean;
  startNodeSymbol?: string;
  onActionTypeChange: (value: string) => void;
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

const ActionContent: React.FC<ActionContentProps> = ({
  nodeData,
  selectedPosition,
  showLimitPrice,
  hasOptionTrading,
  startNodeSymbol,
  onActionTypeChange,
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
  if (!nodeData) {
    return <div>Loading node data...</div>;
  }

  if (nodeData.actionType === 'alert') {
    return (
      <div className="space-y-4">
        <ActionTypeSelector 
          actionType={nodeData.actionType}
          onActionTypeChange={onActionTypeChange}
        />
        <AlertMessage />
      </div>
    );
  }

  if (!selectedPosition) {
    return (
      <div className="space-y-4">
        <ActionTypeSelector 
          actionType={nodeData.actionType}
          onActionTypeChange={onActionTypeChange}
        />
        <div className="mt-4 p-4 text-center bg-muted/20 rounded-md">
          Please select or add a position
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ActionTypeSelector 
        actionType={nodeData.actionType}
        onActionTypeChange={onActionTypeChange}
      />
      
      <Separator />
      
      <ActionTabsContainer 
        actionType={nodeData.actionType}
        position={selectedPosition}
        startNodeSymbol={startNodeSymbol}
        hasOptionTrading={hasOptionTrading}
        onPositionTypeChange={onPositionTypeChange}
        onOrderTypeChange={onOrderTypeChange}
        onLimitPriceChange={onLimitPriceChange}
        onQuantityChange={onQuantityChange}
        onProductTypeChange={onProductTypeChange}
        onExpiryChange={onExpiryChange}
        onStrikeTypeChange={onStrikeTypeChange}
        onStrikeValueChange={onStrikeValueChange}
        onOptionTypeChange={onOptionTypeChange}
      />
    </div>
  );
};

export default ActionContent;
