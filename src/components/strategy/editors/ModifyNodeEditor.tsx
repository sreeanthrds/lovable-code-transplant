
import React from 'react';
import { Node } from '@xyflow/react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useModifyPositions, usePositionSelection } from '@/hooks/useModifyPositions';
import { usePositionModification } from '@/hooks/usePositionModification';
import PositionSelector from './modify-node/PositionSelector';
import { NodeDetailsPanel } from './shared';
import { toast } from '@/hooks/use-toast';
import { EnhancedNumberInput } from '@/components/ui/form/enhanced';
import { SelectField } from './shared';

interface ModifyNodeEditorProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const ModifyNodeEditor: React.FC<ModifyNodeEditorProps> = ({ node, updateNodeData }) => {
  // Use our custom hooks
  const {
    positions,
    selectedPosition,
    selectedPositionId,
    setSelectedPositionId,
    setSelectedPosition
  } = useModifyPositions(node);

  const {
    handlePositionSelect,
    handleLabelChange
  } = usePositionSelection(
    node, 
    updateNodeData,
    positions,
    setSelectedPositionId,
    setSelectedPosition
  );

  const {
    handlePositionChange
  } = usePositionModification(node, updateNodeData);

  // Only allow quantity modification for simplicity
  const handleQuantityChange = (value: number | undefined) => {
    if (!selectedPosition) return;
    handlePositionChange({ quantity: value });
  };

  // Handle order cancellation
  const handleCancelOrder = () => {
    if (!selectedPosition) return;
    
    // Mark the position as cancelled in modifications
    handlePositionChange({ 
      status: 'cancelled',
      _lastUpdated: Date.now()
    });
    
    toast({
      title: "Order Cancelled",
      description: `Cancelled order for position ${selectedPosition.vpi || ''}`,
    });
  };

  // Handle roll-out operation
  const handleRollOut = (expiry: string) => {
    if (!selectedPosition || !selectedPosition.optionDetails) return;
    
    handlePositionChange({
      optionDetails: {
        ...selectedPosition.optionDetails,
        expiry: expiry
      },
      isRolledOut: true,
      _lastUpdated: Date.now()
    });
    
    toast({
      title: "Position Rolled Out",
      description: `Position ${selectedPosition.vpi || ''} rolled out to ${expiry}`,
    });
  };

  // Safe access to node.data.label with default value to fix type issue
  const nodeLabel = typeof node.data?.label === 'string' ? node.data.label : 'Modify Position';

  return (
    <div className="space-y-4">
      {/* Use NodeDetailsPanel for consistent node label editing */}
      <NodeDetailsPanel
        nodeId={node.id}
        nodeLabel={nodeLabel}
        onLabelChange={handleLabelChange}
        infoTooltip="Modify Nodes can change parameters of existing positions"
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Position Selection</CardTitle>
          <CardDescription>
            Select a position to modify from an Entry Node
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PositionSelector
            positions={positions}
            selectedPositionId={selectedPositionId || ''}
            onSelect={handlePositionSelect}
          />
        </CardContent>
      </Card>

      {/* Display position modification options when a position is selected */}
      {selectedPosition && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Modify Position {selectedPosition.vpi || ''}</CardTitle>
            <CardDescription>
              {selectedPosition.positionType || 'buy'} {selectedPosition.orderType || 'market'} order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Position Information */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="font-medium">Product:</div>
              <div>{selectedPosition.productType || 'intraday'}</div>
              
              <div className="font-medium">Order Type:</div>
              <div>{selectedPosition.orderType || 'market'}</div>
              
              {selectedPosition.orderType === 'limit' && (
                <>
                  <div className="font-medium">Limit Price:</div>
                  <div>{selectedPosition.limitPrice}</div>
                </>
              )}
              
              {selectedPosition.optionDetails && (
                <>
                  <div className="font-medium">Option Type:</div>
                  <div>{selectedPosition.optionDetails.optionType || 'CE'}</div>
                  
                  <div className="font-medium">Expiry:</div>
                  <div>{selectedPosition.optionDetails.expiry || ''}</div>
                  
                  <div className="font-medium">Strike:</div>
                  <div>{selectedPosition.optionDetails.strikeType || ''}</div>
                </>
              )}
            </div>
            
            {/* Quantity Modification */}
            <div className="py-2 border-t">
              <EnhancedNumberInput
                label="Modify Quantity"
                id="quantity"
                min={1}
                value={selectedPosition.quantity}
                onChange={handleQuantityChange}
                placeholder="Quantity"
              />
            </div>
            
            {/* Cancel Order */}
            <div className="pt-2 border-t">
              <Button 
                variant="destructive"
                className="w-full"
                onClick={handleCancelOrder}
              >
                Cancel Order
              </Button>
            </div>
            
            {/* Roll Out Options (only for option positions) */}
            {selectedPosition.optionDetails && (
              <div className="pt-2 border-t">
                <h3 className="text-sm font-medium mb-2">Roll Out Option</h3>
                <SelectField
                  label="New Expiry"
                  id="new-expiry"
                  value=""
                  onChange={(value) => handleRollOut(value)}
                  options={[
                    { value: "select-expiry", label: 'Select expiry...' },
                    { value: 'W1', label: 'Next Week' },
                    { value: 'W2', label: 'Week After Next' },
                    { value: 'M1', label: 'Next Month' },
                    { value: 'M2', label: 'Month After Next' }
                  ]}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModifyNodeEditor;
