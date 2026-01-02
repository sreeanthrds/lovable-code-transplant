
import React, { memo, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { TrendingDown } from 'lucide-react';
import { GroupCondition, groupConditionToString } from '../utils/conditionTypes';
import { useStrategyStore } from '@/hooks/use-strategy-store';

interface ExitSignalNodeData {
  label?: string;
  conditions?: GroupCondition[];
}

interface ExitSignalNodeProps {
  data: ExitSignalNodeData;
  id: string;
  zIndex?: number;
}

const ExitSignalNode = ({ data, id, zIndex = 0 }: ExitSignalNodeProps) => {
  const strategyStore = useStrategyStore();
  const conditions = Array.isArray(data.conditions) ? data.conditions : [];
  
  // Calculate opacity based on z-index (higher z-index = more transparent)
  const calculateOpacity = () => {
    const baseOpacity = 1;
    const opacityReduction = Math.min(zIndex * 0.05, 0.7);
    return Math.max(baseOpacity - opacityReduction, 0.3);
  };
  
  // Determine if we have any conditions to display
  const hasExitConditions = conditions.length > 0 && 
    conditions[0].conditions && 
    conditions[0].conditions.length > 0;
  
  // Format complex conditions for display
  const exitConditionDisplay = useMemo(() => {
    if (!hasExitConditions) return null;
    
    try {
      // Find the start node to get indicator parameters
      const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
      
      // Pass start node data to the condition formatter
      return groupConditionToString(conditions[0], startNode?.data);
    } catch (error) {
      console.error("Error formatting exit conditions:", error);
      return "Invalid condition structure";
    }
  }, [hasExitConditions, conditions, strategyStore.nodes]);
  
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
  
  const exitConditionCount = hasExitConditions ? countConditions(conditions[0]) : 0;
  
  return (
    <div className="px-3 py-2 rounded-lg group transition-shadow duration-300" style={{ opacity: calculateOpacity(), border: '2px solid rgb(255, 193, 7)', borderWidth: '2px', borderStyle: 'solid' }}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'rgb(255, 193, 7)' }}
      />
      
      <div className="flex items-center mb-1.5">
        <TrendingDown className="h-4 w-4 mr-1.5" style={{ color: 'rgb(255, 193, 7)' }} />
        <div className="font-medium text-xs" style={{ color: 'rgb(255, 193, 7)' }}>{data.label || "Exit Condition"}</div>
      </div>
      
      {hasExitConditions && exitConditionDisplay ? (
        <div className="text-[11px] p-2 rounded-md mb-1.5 max-w-[180px] break-words" style={{ border: '1px solid rgba(255, 193, 7, 0.3)' }}>
          <div className="font-medium leading-relaxed" style={{ color: 'rgb(255, 165, 0)' }}>
            {exitConditionDisplay}
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-warning/80 mb-1.5">
          No exit conditions set
        </div>
      )}
      
      <div className="flex flex-col gap-1 text-[9px]">
        {hasExitConditions && (
          <div style={{ color: 'rgb(255, 193, 7)' }}>
            {exitConditionCount} exit condition{exitConditionCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      {/* Display node ID */}
      <div className="text-[9px] mt-1 text-right" style={{ color: 'rgba(255, 193, 7, 0.8)' }}>
        ID: {id}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'rgb(255, 193, 7)' }}
      />
    </div>
  );
};

export default memo(ExitSignalNode);
