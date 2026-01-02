
import React from 'react';
import { Separator } from '@/components/ui/separator';
import OrderDetailsSection from '../OrderDetailsSection';
import { Position } from '../types';

interface OrderDetailsPanelProps {
  actionType?: 'entry' | 'exit' | 'alert';
  position: Position;
  onPositionTypeChange: (value: string) => void;
  onOrderTypeChange: (value: string) => void;
  onLimitPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProductTypeChange: (value: string) => void;
}

const OrderDetailsPanel: React.FC<OrderDetailsPanelProps> = ({
  actionType,
  position,
  onPositionTypeChange,
  onOrderTypeChange,
  onLimitPriceChange,
  onQuantityChange,
  onProductTypeChange
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-4">Order Details</h3>
      <OrderDetailsSection 
        actionType={actionType}
        position={position}
        onPositionTypeChange={onPositionTypeChange}
        onOrderTypeChange={onOrderTypeChange}
        onLimitPriceChange={onLimitPriceChange}
        onQuantityChange={onQuantityChange}
        onProductTypeChange={onProductTypeChange}
      />
    </div>
  );
};

export default OrderDetailsPanel;
