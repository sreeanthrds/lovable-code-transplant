
import React from 'react';
import { NodeData, Position } from './types';
import ActionContent from './components/ActionContent';

interface ActionNodeContentProps {
  nodeData: NodeData;
  showLimitPrice: boolean;
  hasOptionTrading: boolean;
  selectedPosition: Position;
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

const ActionNodeContent: React.FC<ActionNodeContentProps> = (props) => {
  return (
    <ActionContent {...props} />
  );
};

export default ActionNodeContent;
