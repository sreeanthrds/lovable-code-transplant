
import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeDetailsPanel } from './shared';
import { useActionNodeForm } from './action-node/useActionNodeForm';
import { Position } from './action-node/types';
import PositionsList from './action-node/components/PositionsList';
import PositionDialog from './action-node/components/PositionDialog';
import InstrumentPanel from './action-node/components/InstrumentPanel';
import ActionTypeSelector from './action-node/ActionTypeSelector';
import AlertMessage from './action-node/AlertMessage';
import { ExitOrderForm } from './action-node/exit-node';
import PostExecutionTab from './action-node/entry-node/PostExecutionTab';
import { toast } from "@/hooks/use-toast";

interface ActionNodeEditorProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const ActionNodeEditor = ({ node, updateNodeData }: ActionNodeEditorProps) => {
  // State for controlling the dialog
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);
  
  const { 
    nodeData,
    hasOptionTrading,
    startNodeSymbol,
    selectedPosition,
    setSelectedPosition,
    handleLabelChange,
    handleActionTypeChange,
    handlePositionChange,
    handleAddPosition,
    handleDeletePosition,
    validateVpiUniqueness,
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

  // Get the appropriate info message based on the action type
  const getActionInfoTooltip = () => {
    switch (nodeData?.actionType) {
      case 'entry':
        return "Entry nodes open new positions when the strategy detects a signal. Configure quantity and order details based on your trading preferences.";
      case 'exit':
        return "Exit nodes close existing positions. Use these after entry nodes to define when to exit the market based on signals.";
      case 'alert':
        return "Alert nodes notify you of trading opportunities without executing trades. Useful for manual trading or when testing a strategy.";
      default:
        return "Action nodes execute trades or generate notifications when connected to signal nodes in your strategy.";
    }
  };

  const handlePositionSelect = (position: Position) => {
    setSelectedPosition(position);
    setIsPositionDialogOpen(true);
  };

  const handlePositionUpdate = (updates: Partial<Position>) => {
    if (!selectedPosition) return;
    
    // We only check if the user is manually changing the VPI
    // System-generated VPIs are handled in useActionNodeForm
    if (updates.vpi && updates.vpi !== selectedPosition?.vpi && !validateVpiUniqueness(updates.vpi, selectedPosition.vpi)) {
      toast({
        title: "Duplicate VPI",
        description: "This Virtual Position ID is already in use. Please choose a unique identifier.",
        variant: "destructive"
      });
      return;
    }

    handlePositionChange(selectedPosition.vpi, updates);
  };

  const onAddPosition = () => {
    const newPosition = handleAddPosition();
    if (newPosition) {
      setSelectedPosition(newPosition);
      setIsPositionDialogOpen(true);
    } else {
      console.error("Failed to create new position");
    }
  };

  const onDeletePosition = (vpi: string) => {
    handleDeletePosition(vpi);
    // If we deleted the selected position, close the dialog
    if (selectedPosition?.vpi === vpi) {
      setIsPositionDialogOpen(false);
      setSelectedPosition(null);
    }
  };

  const closePositionDialog = () => {
    setIsPositionDialogOpen(false);
  };

  // Render different content based on action type
  const renderActionContent = () => {
    if (nodeData?.actionType === 'alert') {
      return <AlertMessage />;
    }

    // Render specialized exit node form
    if (nodeData?.actionType === 'exit') {
      return <ExitOrderForm node={node} updateNodeData={updateNodeData} />;
    }

    // For entry nodes, continue with the positions list
    return (
      <>
        <InstrumentPanel startNodeSymbol={startNodeSymbol} />
        
        <PositionsList 
          positions={nodeData?.positions || []}
          selectedPosition={selectedPosition}
          onSelectPosition={handlePositionSelect}
          onAddPosition={onAddPosition}
          onDeletePosition={onDeletePosition}
        />
      </>
    );
  };

  return (
    <>
      <NodeDetailsPanel
        nodeId={node.id}
        nodeLabel={nodeData?.label || ''}
        onLabelChange={handleLabelChange}
        infoTooltip={getActionInfoTooltip()}
        additionalContent={
          <div className="bg-white/[0.03] dark:bg-white/[0.02] rounded-lg border-2 border-emerald-400/40 dark:border-emerald-500/30 shadow-[inset_0_0_15px_rgba(16,185,129,0.08),0_4px_20px_rgba(0,0,0,0.5),0_8px_32px_rgba(16,185,129,0.15)] backdrop-blur-[10px]">
            <Tabs defaultValue="action" className="w-full">
              <div className="border-b-2 border-emerald-400/30 dark:border-emerald-500/20 px-6 pt-6">
                <TabsList className="grid grid-cols-2 w-full bg-white/[0.04] dark:bg-white/[0.03] border-2 border-emerald-400/25 dark:border-emerald-500/20 shadow-[0_2px_8px_rgba(0,0,0,0.4)] backdrop-blur-[8px]">
                  <TabsTrigger value="action" className="text-sm font-medium data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                    Action Configuration
                  </TabsTrigger>
                  <TabsTrigger value="post-execution" className="text-sm font-medium data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                    Post-Execution
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="action" className="p-6 space-y-6 mt-0">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-sm" />
                      Action Type
                    </h4>
                    <div className="bg-white/[0.04] dark:bg-white/[0.03] p-4 rounded-lg border-2 border-emerald-400/25 dark:border-emerald-500/20 shadow-[inset_0_0_10px_rgba(16,185,129,0.06),0_2px_12px_rgba(0,0,0,0.4)] backdrop-blur-[8px]">
                      <ActionTypeSelector 
                        actionType={nodeData?.actionType}
                        onActionTypeChange={handleActionTypeChange}
                      />
                    </div>
                  </div>
                  
                  <div className="border-t-2 border-emerald-400/25 dark:border-emerald-500/20 pt-6">
                    {renderActionContent()}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="post-execution" className="p-6 mt-0 bg-white/[0.02] dark:bg-white/[0.01] shadow-[inset_0_0_15px_rgba(147,51,234,0.08)]">
                <PostExecutionTab node={node} updateNodeData={updateNodeData} />
              </TabsContent>
            </Tabs>
          </div>
        }
      />
      
      {/* Position Dialog */}
      <PositionDialog
        position={selectedPosition}
        isOpen={isPositionDialogOpen}
        onClose={closePositionDialog}
        hasOptionTrading={hasOptionTrading}
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
    </>
  );
};

export default ActionNodeEditor;
