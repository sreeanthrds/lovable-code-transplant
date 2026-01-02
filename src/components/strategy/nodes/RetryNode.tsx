
import React, { useMemo, memo } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { RotateCcw, TrendingUp } from 'lucide-react';
import { GroupCondition, groupConditionToString } from '../utils/conditionTypes';
import { useStrategyStore } from '@/hooks/use-strategy-store';

const RetryNode: React.FC<NodeProps> = ({ id, data, selected, isConnectable, zIndex = 0 }) => {
  const strategyStore = useStrategyStore();
  
  // Calculate opacity based on z-index (higher z-index = more transparent)
  const calculateOpacity = () => {
    const baseOpacity = 1;
    const opacityReduction = Math.min(zIndex * 0.05, 0.7);
    return Math.max(baseOpacity - opacityReduction, 0.3);
  };

  const nodeData = useMemo(() => {
    const rawData = data as Record<string, unknown>;
    
    // Get retry configuration with type handling
    const retryConfig = typeof rawData.retryConfig === 'object' && rawData.retryConfig 
      ? rawData.retryConfig as { groupNumber: number, maxEntries: number }
      : { groupNumber: 1, maxEntries: 1 };
    
    // Get conditions
    const conditions = Array.isArray(rawData.conditions) ? rawData.conditions : [];
    
    return {
      label: (rawData.label as string) || 'Re-entry',
      retryConfig: {
        groupNumber: retryConfig.groupNumber || 1,
        maxEntries: retryConfig.maxEntries || 1
      },
      conditions
    };
  }, [data]);

  // Determine if we have any conditions to display
  const hasConditions = nodeData.conditions.length > 0 && 
    nodeData.conditions[0].conditions && 
    nodeData.conditions[0].conditions.length > 0;
  
  // Format complex conditions for display
  const conditionDisplay = useMemo(() => {
    if (!hasConditions) return null;
    
    try {
      // Find the start node to get indicator parameters
      const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
      
      // Pass start node data to the condition formatter
      return groupConditionToString(nodeData.conditions[0], startNode?.data);
    } catch (error) {
      console.error("Error formatting retry conditions:", error);
      return "Invalid condition structure";
    }
  }, [hasConditions, nodeData.conditions, strategyStore.nodes]);
  
  // Count total condition expressions for display
  const countConditions = (group: GroupCondition): number => {
    return group.conditions.reduce((total, cond) => {
      if ('groupLogic' in cond) {
        return total + countConditions(cond as GroupCondition);
      } else {
        return total + 1;
      }
    }, 0);
  };
  
  const conditionCount = hasConditions ? countConditions(nodeData.conditions[0]) : 0;

  return (
    <div className="relative px-3 py-2 rounded-md border border-purple-500 dark:border-purple-400 transition-shadow duration-300" style={{ opacity: calculateOpacity() }}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#9b59b6' }}
      />
      
      <div className="flex items-center mb-1.5">
        <RotateCcw className="h-4 w-4 text-warning mr-1.5" />
        <div className="font-medium text-xs text-warning">{nodeData.label}</div>
      </div>
      
      {hasConditions && conditionDisplay ? (
        <div className="text-[11px] p-2 rounded-md mb-1.5 max-w-[180px] break-words border border-purple-500/30">
          <div className="font-medium leading-relaxed text-purple-300">
            {conditionDisplay}
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-warning/80 mb-1.5">
          No re-entry conditions set
        </div>
      )}
      
      <div className="flex flex-col gap-1 text-[9px]">
        <div className="text-info">
          Group {nodeData.retryConfig.groupNumber} • Max {nodeData.retryConfig.maxEntries} entr{nodeData.retryConfig.maxEntries !== 1 ? 'ies' : 'y'}
        </div>
        {hasConditions && (
          <div className="text-warning">
            {conditionCount} condition{conditionCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      {/* Display node ID */}
      <div className="text-[9px] text-success/80 mt-1 text-right">
        ID: {id}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#9b59b6' }}
      />
    </div>
  );
};

export default memo(RetryNode);
