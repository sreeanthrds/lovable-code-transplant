
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import BaseNodeTemplate from './BaseNodeTemplate';
import ActionDetails from '../action-node/ActionDetails';
import ActionLabel from '../action-node/ActionLabel';
import ActionIcon from '../action-node/ActionIcon';
import RetryIcon from '../action-node/RetryIcon';
import { Position as PositionType } from '@/components/strategy/types/position-types';

interface ActionNodeTemplateProps {
  id: string;
  data: {
    label?: string;
    actionType?: 'entry' | 'exit' | 'alert' | 'modify';
    positions?: PositionType[];
    icon?: React.ReactNode;
    description?: string;
    updateNodeData?: (id: string, data: any) => void;
    startNodeSymbol?: string;
    targetPositionId?: string; 
    targetNodeId?: string;    
    modifications?: Record<string, any>;
    // Add re-entry related props
    reEntry?: {
      enabled: boolean;
      groupNumber: number;
      maxReEntries: number;
    };
    // Internal action type for special handling
    _actionTypeInternal?: string;
    // Add exit node data for checking post-execution settings
    exitNodeData?: any;
    retryConfig?: {
      groupNumber: number;
      maxReEntries: number;
    };
    [key: string]: any;
  };
  selected: boolean;
  isConnectable: boolean;
  type: string;
  zIndex?: number;
  dragging?: boolean;
}

const ActionNodeTemplate = ({
  id,
  data,
  selected,
  isConnectable,
  type,
  zIndex = 0,
  dragging,
}: ActionNodeTemplateProps) => {
  // Check if this is specifically a retry node by looking at the internal action type
  const isRetryNode = data?._actionTypeInternal === 'retry';
  
  // Check if the node has re-entry settings through post-execution configs
  const hasPostExecutionReEntry = (() => {
    if (!data?.exitNodeData?.postExecutionConfig) return false;
    
    const postExec = data.exitNodeData.postExecutionConfig;
    
    // Check if any of the post-execution features have re-entry enabled
    return (
      (postExec.stopLoss?.reEntry?.enabled) ||
      (postExec.trailingStop?.reEntry?.enabled) ||
      (postExec.takeProfit?.reEntry?.enabled)
    );
  })();
  
  // Only show retry icon on retry nodes or if post-execution re-entry is enabled
  const showRetryIcon = isRetryNode || hasPostExecutionReEntry;
  
  // Get retry-specific properties
  let retryGroupNumber = 1;
  let retryMaxEntries = 1;
  
  if (isRetryNode) {
    // For dedicated retry nodes
    retryGroupNumber = data?.retryConfig?.groupNumber || 1;
    retryMaxEntries = data?.retryConfig?.maxReEntries || 1;
  } else if (hasPostExecutionReEntry) {
    // For post-execution re-entry, find the first enabled re-entry config
    const postExec = data.exitNodeData.postExecutionConfig;
    
    if (postExec.stopLoss?.reEntry?.enabled) {
      retryGroupNumber = postExec.stopLoss.reEntry.groupNumber || 1;
      retryMaxEntries = postExec.stopLoss.reEntry.maxReEntries || 1;
    } else if (postExec.trailingStop?.reEntry?.enabled) {
      retryGroupNumber = postExec.trailingStop.reEntry.groupNumber || 1;
      retryMaxEntries = postExec.trailingStop.reEntry.maxReEntries || 1;
    } else if (postExec.takeProfit?.reEntry?.enabled) {
      retryGroupNumber = postExec.takeProfit.reEntry.groupNumber || 1;
      retryMaxEntries = postExec.takeProfit.reEntry.maxReEntries || 1;
    }
  }

  // Determine border color based on action type
  const getNodeColor = () => {
    if (type === 'squareOffNode') return 'rgb(204, 251, 52)'; // lime-yellow
    if (data?.actionType === 'entry') return 'rgb(6, 182, 212)'; // cyan-500
    if (data?.actionType === 'exit') return 'rgb(240, 128, 128)'; // light coral
    if (data?.actionType === 'alert') return 'rgb(59, 130, 246)'; // blue-500
    if (data?.actionType === 'modify') return 'rgb(168, 85, 247)'; // purple-500
    if (data?.actionType === 'retry') return 'rgb(139, 92, 246)'; // violet-500
    return 'rgb(148, 163, 184)'; // slate-400 default
  };

  const nodeColor = getNodeColor();
  const borderStyle = { border: `2px solid ${nodeColor}` };
  
  // Calculate opacity based on z-index (higher z-index = more transparent)
  const calculateOpacity = () => {
    const baseOpacity = 1;
    const opacityReduction = Math.min(zIndex * 0.05, 0.7);
    return Math.max(baseOpacity - opacityReduction, 0.3);
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ visibility: isConnectable ? 'visible' : 'hidden' }}
      />
      
      <div 
        className="px-3 py-2 rounded-lg max-w-xs relative group transition-all duration-200"
        style={{ opacity: calculateOpacity(), ...borderStyle }}
      >
        {/* Show the RetryIcon for retry nodes or nodes with post-execution re-entry */}
        {showRetryIcon && (
          <RetryIcon 
            enabled={true} 
            groupNumber={retryGroupNumber} 
            maxReEntries={retryMaxEntries} 
          />
        )}
        
        <div className="flex flex-col">
          <ActionLabel 
            label={data?.label} 
            description={data?.description} 
            actionType={data?.actionType} 
          />
          
          <ActionIcon 
            icon={data?.icon} 
            actionType={data?.actionType} 
          />
          
          <ActionDetails 
            positions={data?.positions} 
            actionType={data?.actionType}
            nodeId={id}
            startNodeSymbol={data?.startNodeSymbol}
            targetPositionId={data?.targetPositionId}
            targetNodeId={data?.targetNodeId}
            modifications={data?.modifications}
          />
          
          <div className="text-[9px] text-muted-foreground mt-1 text-right">
            ID: {id}
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ visibility: isConnectable ? 'visible' : 'hidden' }}
      />
    </>
  );
};

export default memo(ActionNodeTemplate);
