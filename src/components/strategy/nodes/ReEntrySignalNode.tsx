import React, { memo, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { RotateCcw, TrendingUp } from 'lucide-react';
import { GroupCondition, groupConditionToString } from '../utils/conditions';
import { useStrategyStore } from '@/hooks/use-strategy-store';

interface ReEntrySignalNodeData {
  label?: string;
  conditions?: GroupCondition[];
  retryConfig?: {
    groupNumber?: number;
    maxEntries?: number;
  };
}

interface ReEntrySignalNodeProps {
  data: ReEntrySignalNodeData;
  id: string;
  zIndex?: number;
}

const ReEntrySignalNode = ({ data, id, zIndex = 0 }: ReEntrySignalNodeProps) => {
  const strategyStore = useStrategyStore();
  const conditions = Array.isArray(data.conditions) ? data.conditions : [];
  
  // Calculate opacity based on z-index (higher z-index = more transparent)
  const calculateOpacity = () => {
    const baseOpacity = 1;
    const opacityReduction = Math.min(zIndex * 0.05, 0.7);
    return Math.max(baseOpacity - opacityReduction, 0.3);
  };
  
  // Get retry configuration with defaults
  const retryConfig = {
    groupNumber: data.retryConfig?.groupNumber || 1,
    maxEntries: data.retryConfig?.maxEntries || 1
  };
  
  // Determine if we have any conditions to display
  const hasReEntryConditions = conditions.length > 0 && 
    conditions[0] && 
    conditions[0].conditions && 
    conditions[0].conditions.length > 0;
  
  // Format complex conditions for display
  const reEntryConditionDisplay = useMemo(() => {
    if (!hasReEntryConditions) return null;
    
    try {
      // Find the start node to get indicator parameters
      const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
      
      // Validate condition structure before formatting
      const rootCondition = conditions[0];
      if (!rootCondition || !rootCondition.conditions || rootCondition.conditions.length === 0) {
        return "No conditions defined";
      }
      
      // Pass start node data to the condition formatter
      const result = groupConditionToString(rootCondition, startNode?.data);
      return result;
    } catch (error) {
      console.error("Error formatting re-entry conditions:", error);
      console.error("Conditions data:", conditions);
      return "Error formatting conditions";
    }
  }, [hasReEntryConditions, conditions, strategyStore.nodes]);
  
  // Count total condition expressions for display
  const countConditions = (group: GroupCondition): number => {
    if (!group || !group.conditions) return 0;
    return group.conditions.reduce((total, cond) => {
      if ('groupLogic' in cond) {
        return total + countConditions(cond as GroupCondition);
      } else {
        return total + 1;
      }
    }, 0);
  };
  
  const reEntryConditionCount = hasReEntryConditions ? countConditions(conditions[0]) : 0;
  
  return (
    <div className="relative px-3 py-2 rounded-lg transition-shadow duration-300" style={{ opacity: calculateOpacity(), border: '2px solid rgb(139, 92, 246)' }}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'rgb(139, 92, 246)' }}
      />
      
      <div className="flex items-center mb-1.5">
        <RotateCcw className="h-4 w-4 mr-1.5" style={{ color: 'rgb(139, 92, 246)' }} />
        <div className="font-medium text-xs" style={{ color: 'rgb(139, 92, 246)' }}>{data.label || "Re-Entry Condition"}</div>
      </div>
      
      {hasReEntryConditions && reEntryConditionDisplay ? (
        <div className="text-[11px] p-2 rounded-md mb-1.5 max-w-[180px] break-words" style={{ border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <div className="font-medium leading-relaxed" style={{ color: 'rgb(244, 114, 182)' }}>
            {reEntryConditionDisplay}
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-warning/80 mb-1.5">
          No re-entry conditions set
        </div>
      )}
      
      <div className="flex flex-col gap-1 text-[9px]">
        <div style={{ color: 'rgb(139, 92, 246)' }}>
          Group {retryConfig.groupNumber} • Max {retryConfig.maxEntries} entr{retryConfig.maxEntries !== 1 ? 'ies' : 'y'}
        </div>
        {hasReEntryConditions && (
          <div style={{ color: 'rgb(139, 92, 246)' }}>
            {reEntryConditionCount} condition{reEntryConditionCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      {/* Display node ID */}
      <div className="text-[9px] mt-1 text-right" style={{ color: 'rgba(139, 92, 246, 0.8)' }}>
        ID: {id}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'rgb(139, 92, 246)' }}
      />
    </div>
  );
};

export default memo(ReEntrySignalNode);