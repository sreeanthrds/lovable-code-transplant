
import React from 'react';
import { Expression, NodeVariableExpression } from '../../../utils/conditions';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useNodeData } from './hooks/useNodeData';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import FieldTooltip from '../../shared/FieldTooltip';

interface NodeVariableExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
  currentNodeId?: string;
  currentVariableId?: string;
}

const NodeVariableExpressionEditor: React.FC<NodeVariableExpressionEditorProps> = ({
  expression,
  updateExpression,
  required = false,
  currentNodeId,
  currentVariableId
}) => {
  const { getNodeVariables } = useNodeData();
  
  if (expression.type !== 'node_variable') {
    return null;
  }

  const nodeVarExpr = expression as NodeVariableExpression;
  
  const updateNodeVariable = (value: string) => {
    // Parse the combined value "nodeId.variableName"
    const [nodeId, variableName] = value.split('.');
    updateExpression({
      ...nodeVarExpr,
      nodeId: nodeId || '',
      variableName: variableName || ''
    });
  };
  
  // Get all nodes from the strategy store, excluding the current node
  const allNodes = useStrategyStore(state => state.nodes);
  
  console.log('NodeVariableExpressionEditor: All nodes:', allNodes);
  console.log('NodeVariableExpressionEditor: Current node ID:', currentNodeId);
  console.log('NodeVariableExpressionEditor: Current variable ID:', currentVariableId);
  
  // Build combined options: all variables from all nodes (except current variable)
  const allVariableOptions = allNodes.reduce((options, node) => {
    console.log(`NodeVariableExpressionEditor: Processing node ${node.id}:`, node.data);
    
    // Only include nodes that have user-defined variables
    if (!node.data?.variables || !Array.isArray(node.data.variables) || node.data.variables.length === 0) {
      console.log(`NodeVariableExpressionEditor: Node ${node.id} has no variables, skipping`);
      return options;
    }
    
    const nodeVariables = getNodeVariables(node.id);
    console.log(`NodeVariableExpressionEditor: Node ${node.id} variables from getNodeVariables:`, nodeVariables);
    
    nodeVariables.forEach(variable => {
      // Skip current variable to prevent circular reference (only if we're editing within the same node)
      if (node.id === currentNodeId && variable.id === currentVariableId) {
        console.log(`NodeVariableExpressionEditor: Skipping current variable ${variable.name} to prevent circular reference`);
        return;
      }
      
      const nodeName = String(node.data?.label || node.id);
      const option = {
        value: `${node.id}.${variable.name}`,
        label: `${nodeName} (${node.id}).${variable.label || variable.name}`,
        nodeId: node.id,
        variableName: variable.name
      };
      console.log(`NodeVariableExpressionEditor: Adding variable option:`, option);
      options.push(option);
    });
    
    return options;
  }, [] as Array<{value: string, label: string, nodeId: string, variableName: string}>);
  
  console.log('NodeVariableExpressionEditor: Final variable options:', allVariableOptions);
  
  // Current combined value
  const currentValue = nodeVarExpr.nodeId && nodeVarExpr.variableName 
    ? `${nodeVarExpr.nodeId}.${nodeVarExpr.variableName}`
    : '';
    
  console.log('NodeVariableExpressionEditor: Current value:', currentValue);
  
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-1 mb-1">
          <Label className="text-xs">Node Variable</Label>
          <FieldTooltip content="Select a variable from any node to use in your expression" />
        </div>
        <Select 
          value={currentValue} 
          onValueChange={updateNodeVariable}
        >
          <SelectTrigger className={cn(
            "h-8",
            required && !currentValue && "border-red-300 focus:ring-red-200"
          )}>
            <SelectValue placeholder={allVariableOptions.length > 0 ? "Select node variable" : "No variables available"} />
          </SelectTrigger>
          <SelectContent>
            {allVariableOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default NodeVariableExpressionEditor;
