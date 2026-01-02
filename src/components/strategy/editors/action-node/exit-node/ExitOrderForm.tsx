import React from 'react';
import { Node } from '@xyflow/react';
import { NodeDetailsPanel } from '../../shared';
import { useActionNodeForm } from '../useActionNodeForm';
import { useExitOrderForm } from '../exit-node/useExitOrderForm';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { QuantityType, ExitNodeData } from './types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FormItem } from '@/components/ui/form';
import { EnhancedNumberInput } from '@/components/ui/form/enhanced';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Info, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Position } from '@/components/strategy/types/position-types';
import { cn } from '@/lib/utils';

interface ExitOrderFormProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

export const ExitOrderForm: React.FC<ExitOrderFormProps> = ({ node, updateNodeData }) => {
  const { nodeData } = useActionNodeForm({ node, updateNodeData });
  
  // Get all positions from all nodes for position selector
  const nodes = useStrategyStore(state => state.nodes);
  const allPositions = nodes.flatMap(n => {
    const positions = n.data?.positions;
    if (Array.isArray(positions)) {
      return positions as Position[];
    }
    return [];
  });
  
  // Get tags that are actually assigned to positions
  const getAssignedTags = () => {
    const tagMap = new Map<string, Position[]>();
    // Note: VPT feature has been removed for this version
    return tagMap;
  };
  
  // Get handlers from hook
  const {
    orderType,
    limitPrice,
    targetPositionVpi,
    quantity,
    partialQuantityPercentage,
    specificQuantity,
    handleOrderTypeChange,
    handleTargetPositionChange,
    handleQuantityTypeChange,
    handlePartialQuantityChange,
    handleSpecificQuantityChange,
    handleLimitPriceChange
  } = useExitOrderForm({ node, updateNodeData });
  
  // Handle tag-based position selection with proper type checking
  const handlePositionTagChange = (tag: string) => {
    const currentExitNodeData = node.data?.exitNodeData;
    const safeExitNodeData: ExitNodeData = currentExitNodeData && typeof currentExitNodeData === 'object' 
      ? currentExitNodeData as ExitNodeData 
      : { orderConfig: { orderType: 'market' } };
    
    const updatedOrderConfig = {
      ...safeExitNodeData.orderConfig,
      exitByTag: true,
      targetTag: tag
    };
    
    updateNodeData(node.id, {
      ...node.data,
      exitNodeData: {
        ...safeExitNodeData,
        orderConfig: updatedOrderConfig
      }
    });
  };
  
  const assignedTags = getAssignedTags();
  const currentExitNodeData = node.data?.exitNodeData;
  const safeCurrentExitNodeData: ExitNodeData = currentExitNodeData && typeof currentExitNodeData === 'object'
    ? currentExitNodeData as ExitNodeData
    : { orderConfig: { orderType: 'market' } };
  
  const isExitByTag = safeCurrentExitNodeData.orderConfig?.exitByTag || false;
  const targetTag = safeCurrentExitNodeData.orderConfig?.targetTag;
  
  // Determine current selection method
  const getCurrentSelectionMethod = () => {
    if (isExitByTag) return 'by_tag';
    if (targetPositionVpi) return 'by_position';
    return 'by_position'; // default
  };
  
  const handleSelectionMethodChange = (method: string) => {
    const updatedOrderConfig = {
      ...safeCurrentExitNodeData.orderConfig,
      exitByTag: method === 'by_tag',
      targetTag: method === 'by_tag' ? targetTag : undefined
    };
    
    updateNodeData(node.id, {
      ...node.data,
      exitNodeData: {
        ...safeCurrentExitNodeData,
        orderConfig: updatedOrderConfig
      }
    });
    
    if (method === 'by_position' && !targetPositionVpi && allPositions.length > 0) {
      handleTargetPositionChange(allPositions[0].vpi);
    }
  };

  // Check if position is selected
  const isPositionSelected = targetPositionVpi && targetPositionVpi !== '';
  const hasPositions = allPositions.length > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-4 bg-accent/5 rounded-md p-3">
        <FormItem className={cn(
          "space-y-1.5",
          hasPositions && !isPositionSelected && "border border-destructive rounded-lg p-3 bg-destructive/5"
        )}>
          <div className="flex items-center justify-between">
            <Label className={cn(
              "text-sm font-medium flex items-center gap-2",
              hasPositions && !isPositionSelected && "text-destructive"
            )}>
              {hasPositions && !isPositionSelected && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs text-destructive font-medium">Position selection is required for this exit node to function!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              Select Position
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">Select the position to exit. This is required for the exit node to function.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {allPositions.length > 0 ? (
            <Select
              value={targetPositionVpi || ''}
              onValueChange={handleTargetPositionChange}
            >
              <SelectTrigger className={cn(
                "w-full",
                !isPositionSelected && "border-destructive focus:ring-destructive/30"
              )}>
                <SelectValue placeholder={!isPositionSelected ? "⚠️ Select position (Required)" : "Select position"} />
              </SelectTrigger>
              <SelectContent>
                {allPositions.map((position: Position) => (
                  <SelectItem key={position.vpi} value={position.vpi}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{position.vpi}</span>
                      <span className="text-muted-foreground text-xs ml-2">({position.sourceNodeId || 'Node ID'})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
              No positions available. Add positions to entry nodes first.
            </div>
          )}
        </FormItem>
        
        <FormItem className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Exit Quantity</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">Choose how much of the position to exit.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <RadioGroup
            value={quantity}
            onValueChange={handleQuantityTypeChange}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="cursor-pointer text-xs">Exit All</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percentage" id="percentage" />
              <Label htmlFor="percentage" className="cursor-pointer text-xs">Exit Percentage</Label>
              
              {quantity === 'percentage' && (
                <div className="ml-2 flex-grow">
                  <EnhancedNumberInput
                    label=""
                    hideLabel
                    value={partialQuantityPercentage}
                    onChange={handlePartialQuantityChange}
                    min={1}
                    max={100}
                    step={1}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="specific" id="specific" />
              <Label htmlFor="specific" className="cursor-pointer text-xs">Specific Quantity</Label>
              
              {quantity === 'specific' && (
                <div className="ml-2 flex-grow">
                  <EnhancedNumberInput
                    label=""
                    hideLabel
                    value={specificQuantity}
                    onChange={handleSpecificQuantityChange}
                    min={0.01}
                    step={0.01}
                  />
                </div>
              )}
            </div>
          </RadioGroup>
        </FormItem>
        
        <FormItem className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Order Type</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">Choose the order type for exiting the position.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <RadioGroup
            value={orderType}
            onValueChange={handleOrderTypeChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="market" id="market" />
              <Label htmlFor="market" className="cursor-pointer text-xs">Market Order</Label>
            </div>
            
            <div className="flex items-center space-x-2 opacity-50">
              <RadioGroupItem value="limit" id="limit" disabled />
              <Label htmlFor="limit" className="cursor-not-allowed text-xs text-muted-foreground">Limit Order (Coming Soon)</Label>
            </div>
          </RadioGroup>
          
          {orderType === 'limit' && (
            <div className="mt-2">
              <EnhancedNumberInput
                label="Limit Price"
                value={limitPrice}
                onChange={handleLimitPriceChange}
                min={0.01}
                step={0.01}
                tooltip="Target price for limit order"
              />
            </div>
          )}
        </FormItem>
      </div>
    </div>
  );
};

// Export as default as well to fix the import issue
export default ExitOrderForm;
