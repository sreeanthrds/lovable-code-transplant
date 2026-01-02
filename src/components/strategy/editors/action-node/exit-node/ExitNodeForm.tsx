
import React from 'react';
import { Node } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SelectField from '../../shared/SelectField';
import { useExitNodeForm } from './useExitNodeForm';
import { EnhancedNumberInput } from '@/components/ui/form/enhanced';

interface ExitNodeFormProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

// Use React.memo to prevent unnecessary re-renders
const ExitNodeForm: React.FC<ExitNodeFormProps> = React.memo(({ node, updateNodeData }) => {
  const {
    orderType,
    limitPrice,
    handleOrderTypeChange,
    handleLimitPriceChange
  } = useExitNodeForm({ 
    node, 
    updateNodeData 
  });

  return (
    <div className="space-y-4">
      <SelectField
        label="Order Type"
        id="order-type"
        value={orderType}
        onChange={handleOrderTypeChange}
        options={[
          { value: 'market', label: 'Market Order' },
          { value: 'limit', label: 'Limit Order' }
        ]}
        description="Select the type of order to use for the exit"
      />
      
      {orderType === 'limit' && (
        <EnhancedNumberInput
          label="Limit Price"
          id="limit-price"
          value={typeof limitPrice === 'string' ? parseFloat(limitPrice) : limitPrice}
          onChange={(value) => handleLimitPriceChange(value)}
          min={0}
          step={0.05}
          description="Price at which the limit order will be placed"
        />
      )}
    </div>
  );
});

// Add display name
ExitNodeForm.displayName = 'ExitNodeForm';

export default ExitNodeForm;

