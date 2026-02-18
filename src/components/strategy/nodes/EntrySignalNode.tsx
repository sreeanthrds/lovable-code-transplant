
import React, { memo, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Activity, TrendingUp } from 'lucide-react';
import { GroupCondition, groupConditionToString } from '../utils/conditions';
import { useStrategyStore } from '@/hooks/use-strategy-store';

interface EntrySignalNodeData {
  label?: string;
  conditions?: GroupCondition[];
}

interface EntrySignalNodeProps {
  data: EntrySignalNodeData;
  id: string;
  zIndex?: number;
}

const EntrySignalNode = ({ data, id, zIndex = 0 }: EntrySignalNodeProps) => {
  const strategyStore = useStrategyStore();
  const conditions = Array.isArray(data.conditions) ? data.conditions : [];
  
  // Calculate opacity based on z-index (higher z-index = more transparent)
  const calculateOpacity = () => {
    const baseOpacity = 1;
    const opacityReduction = Math.min(zIndex * 0.05, 0.7);
    return Math.max(baseOpacity - opacityReduction, 0.3);
  };
  
  // Determine if we have any conditions to display
  const hasEntryConditions = conditions.length > 0 && 
    conditions[0] && 
    conditions[0].conditions && 
    conditions[0].conditions.length > 0;
  
  // Format complex conditions for display
  const entryConditionDisplay = useMemo(() => {
    if (!hasEntryConditions) return null;
    
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
      console.error("Error formatting entry conditions:", error);
      console.error("Conditions data:", conditions);
      return "Error formatting conditions";
    }
  }, [hasEntryConditions, conditions, strategyStore.nodes]);
  
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
  
  const entryConditionCount = hasEntryConditions ? countConditions(conditions[0]) : 0;
  
  return (
    <div className="px-3 py-2 rounded-lg group transition-shadow duration-300" style={{ opacity: calculateOpacity(), border: '2px solid rgb(34, 197, 94)' }}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'rgb(34, 197, 94)' }}
      />
      
      <div className="flex items-center mb-1.5">
        <TrendingUp className="h-4 w-4 mr-1.5" style={{ color: 'rgb(34, 197, 94)' }} />
        <div className="font-medium text-xs" style={{ color: 'rgb(34, 197, 94)' }}>{data.label || "Condition"}</div>
      </div>
      
      {hasEntryConditions && entryConditionDisplay ? (
        <div className="text-[11px] p-2 rounded-md mb-1.5 max-w-[180px] break-words" style={{ border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <div className="font-medium leading-relaxed" style={{ color: 'rgb(96, 165, 250)' }}>
            {entryConditionDisplay}
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-warning/80 mb-1.5">
          No entry conditions set
        </div>
      )}
      
      <div className="flex flex-col gap-1 text-[9px]">
        {hasEntryConditions && (
          <div style={{ color: 'rgb(34, 197, 94)' }}>
            {entryConditionCount} entry condition{entryConditionCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      {/* Display node ID */}
      <div className="text-[9px] mt-1 text-right" style={{ color: 'rgba(34, 197, 94, 0.8)' }}>
        ID: {id}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'rgb(34, 197, 94)' }}
      />
    </div>
  );
};

export default memo(EntrySignalNode);
