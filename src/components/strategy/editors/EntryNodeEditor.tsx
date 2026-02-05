
import React, { useEffect, useState } from 'react';
import { Node } from '@xyflow/react';
import { NodeDetailsPanel } from './shared';
import { useActionNodeForm } from './action-node/useActionNodeForm';
import InstrumentDisplay from './action-node/InstrumentDisplay';
import { toast } from "@/hooks/use-toast";
import PositionEditor from './action-node/components/PositionEditor';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';
import PositionDialog from './action-node/components/PositionDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PositionVariableManager from './shared/PositionVariableManager';
import { NodeVariable } from '../utils/conditions';
import PostExecutionTab from './action-node/entry-node/PostExecutionTab';

interface EntryNodeEditorProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const EntryNodeEditor = ({ node, updateNodeData }: EntryNodeEditorProps) => {
  // Force actionType to be 'entry'
  if (node.data.actionType !== 'entry') {
    updateNodeData(node.id, { 
      ...node.data, 
      actionType: 'entry',
      _lastUpdated: Date.now()
    });
  }
  
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("position");
  
  const { 
    nodeData,
    hasOptionTrading,
    startNodeSymbol,
    startNodeExchange,
    handleLabelChange,
    handlePositionChange,
    handleAddPosition,
    validateVpiUniqueness,
    createDefaultPosition,
    // Position-specific handlers
    handlePositionTypeChange,
    handleOrderTypeChange,
    handleLimitPriceChange,
    handleQuantityChange,
    handleMultiplierChange,
    handleProductTypeChange,
    handleExpiryChange,
    handleStrikeTypeChange,
    handleStrikeValueChange,
    handleOptionTypeChange
  } = useActionNodeForm({ node, updateNodeData });


  // Ensure we always have a position for entry nodes
  useEffect(() => {
    // If there are no positions, create one
    if ((!nodeData.positions || nodeData.positions.length === 0) && handleAddPosition) {
      handleAddPosition();
    }
  }, [nodeData.positions, handleAddPosition]);

  // Get the current position (there should be only one for entry nodes)
  const position = nodeData.positions && nodeData.positions.length > 0 
    ? nodeData.positions[0] 
    : null;

  const handlePositionUpdate = (updates: Partial<any>) => {
    if (!position) return;
    
    // We only check if the user is manually changing the VPI
    if (updates.vpi && updates.vpi !== position?.vpi && !validateVpiUniqueness(updates.vpi, position.vpi)) {
      toast({
        title: "Duplicate VPI",
        description: "This Virtual Position ID is already in use.",
        variant: "destructive"
      });
      return;
    }

    handlePositionChange(position.vpi, updates);
  };
  
  const handleEditPosition = () => {
    if (position) {
      setIsPositionDialogOpen(true);
    }
  };
  
  const handleClosePositionDialog = () => {
    setIsPositionDialogOpen(false);
  };

  return (
    <div className="space-y-2">
      <NodeDetailsPanel
        nodeId={node.id}
        nodeLabel={nodeData?.label || ''}
        onLabelChange={handleLabelChange}
        infoTooltip="Entry nodes open new positions when the strategy detects a signal."
      />
      
      <Separator className="my-1" />
      
      <InstrumentDisplay startNodeSymbol={startNodeSymbol} />
      
      <Tabs defaultValue="position" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-2">
          <TabsTrigger value="position">Position</TabsTrigger>
          <TabsTrigger value="post-execution">Post-Execution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="position" className="mt-0">
          <div className="bg-accent/5 rounded-md p-2">
            {position ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium">Position Details</span>
                  <span className="text-xs bg-primary/10 px-2 py-0.5 rounded" title={position.vpi}>
                    VPI: {position.vpi}
                  </span>
                </div>
                <PositionEditor
                  position={position}
                  hasOptionTrading={hasOptionTrading}
                  isEntryNode={true}
                  exchange={startNodeExchange}
                  symbol={startNodeSymbol}
                  onPositionChange={handlePositionUpdate}
                  onPositionTypeChange={handlePositionTypeChange}
                  onOrderTypeChange={handleOrderTypeChange}
                  onLimitPriceChange={handleLimitPriceChange}
                  onQuantityChange={handleQuantityChange}
                  onMultiplierChange={handleMultiplierChange}
                  onProductTypeChange={handleProductTypeChange}
                  onExpiryChange={handleExpiryChange}
                  onStrikeTypeChange={handleStrikeTypeChange}
                  onStrikeValueChange={handleStrikeValueChange}
                  onOptionTypeChange={handleOptionTypeChange}
                />
              </div>
            ) : (
              <div className="text-center p-1">
                <p className="text-xs text-muted-foreground">Loading position...</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="post-execution" className="mt-0">
          <PostExecutionTab node={node} updateNodeData={updateNodeData} />
        </TabsContent>
      </Tabs>
      
      {/* Position Dialog for editing */}
      <PositionDialog
        position={position}
        isOpen={isPositionDialogOpen}
        onClose={handleClosePositionDialog}
        hasOptionTrading={hasOptionTrading}
        isEntryNode={true}
        exchange={startNodeExchange}
        symbol={startNodeSymbol}
        onPositionChange={handlePositionUpdate}
        onPositionTypeChange={handlePositionTypeChange}
        onOrderTypeChange={handleOrderTypeChange}
        onLimitPriceChange={handleLimitPriceChange}
        onQuantityChange={handleQuantityChange}
        onMultiplierChange={handleMultiplierChange}
        onProductTypeChange={handleProductTypeChange}
        onExpiryChange={handleExpiryChange}
        onStrikeTypeChange={handleStrikeTypeChange}
        onStrikeValueChange={handleStrikeValueChange}
        onOptionTypeChange={handleOptionTypeChange}
      />
    </div>
  );
};

export default EntryNodeEditor;
