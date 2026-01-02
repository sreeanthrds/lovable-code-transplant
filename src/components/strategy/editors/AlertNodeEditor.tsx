
import React from 'react';
import { Node } from '@xyflow/react';
import { NodeDetailsPanel } from './shared';
import AlertMessage from './action-node/AlertMessage';

interface AlertNodeEditorProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const AlertNodeEditor = ({ node, updateNodeData }: AlertNodeEditorProps) => {
  // Force actionType to be 'alert'
  if (node.data.actionType !== 'alert') {
    updateNodeData(node.id, { 
      ...node.data, 
      actionType: 'alert',
      _lastUpdated: Date.now()
    });
  }
  
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(node.id, { 
      ...node.data, 
      label: e.target.value,
      _lastUpdated: Date.now()
    });
  };

  // Get the appropriate info message
  const getActionInfoTooltip = () => {
    return "Alert nodes notify you of trading opportunities without executing trades. Useful for manual trading or when testing a strategy.";
  };

  // Ensure we always pass a string to nodeLabel by using the || '' pattern
  const nodeLabel = typeof node.data?.label === 'string' ? node.data.label : '';

  return (
    <NodeDetailsPanel
      nodeId={node.id}
      nodeLabel={nodeLabel}
      onLabelChange={handleLabelChange}
      infoTooltip={getActionInfoTooltip()}
      additionalContent={
        <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/30 p-6 shadow-sm">
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full shadow-sm animate-pulse" />
              Alert Configuration
            </h4>
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 p-2 rounded border border-amber-200/50 dark:border-amber-700/30">
              Configure alert message and notification settings
            </p>
          </div>
          <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg border border-amber-200/30 dark:border-amber-700/30">
            <AlertMessage />
          </div>
        </div>
      }
    />
  );
};

export default AlertNodeEditor;
