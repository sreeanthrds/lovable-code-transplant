
import React from 'react';
import { Node } from '@xyflow/react';
import { NodeDetailsPanel } from './shared';
import { useForceEndNodeForm } from './force-end-node/useForceEndNodeForm';
import ForceEndNodeSettings from './force-end-node/ForceEndNodeSettings';

interface ForceEndNodeEditorProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const ForceEndNodeEditor = ({ node, updateNodeData }: ForceEndNodeEditorProps) => {
  const { 
    formData, 
    handleLabelChange,
    handleMessageChange,
    handleCloseAllChange
  } = useForceEndNodeForm({ node, updateNodeData });

  const forceEndNodeInfo = "This node forces an immediate end to strategy execution. All open positions will be closed, and no further nodes will be processed.";

  return (
    <NodeDetailsPanel
      nodeId={node.id}
      nodeLabel={formData.label}
      onLabelChange={handleLabelChange}
      infoTooltip={forceEndNodeInfo}
      additionalContent={
        <div className="bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-950/20 dark:to-rose-950/20 rounded-lg border border-red-200/50 dark:border-red-800/30 p-6 shadow-sm">
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm animate-pulse" />
              Force End Configuration
            </h4>
            <div className="bg-red-100/50 dark:bg-red-900/20 p-3 rounded border border-red-200/50 dark:border-red-700/30">
              <p className="text-xs text-red-700 dark:text-red-400 font-medium mb-1">⚠️ Critical Action</p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Configure immediate strategy termination settings
              </p>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg border border-red-200/30 dark:border-red-700/30">
            <ForceEndNodeSettings
              closeAll={formData.closeAll}
              message={formData.message}
              onCloseAllChange={handleCloseAllChange}
              onMessageChange={handleMessageChange}
            />
          </div>
        </div>
      }
    />
  );
};

export default ForceEndNodeEditor;
