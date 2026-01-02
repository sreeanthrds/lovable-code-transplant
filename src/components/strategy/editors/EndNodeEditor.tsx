
import React from 'react';
import { Node } from '@xyflow/react';
import { NodeDetailsPanel } from './shared';
import { useEndNodeForm } from './end-node/useEndNodeForm';

interface EndNodeEditorProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const EndNodeEditor = ({ node, updateNodeData }: EndNodeEditorProps) => {
  const { formData, handleLabelChange } = useEndNodeForm({ node, updateNodeData });
  
  const endNodeInfo = "The End Node represents the final state of your strategy. Any path that reaches this node will terminate. Use multiple End nodes to represent different outcomes or exit conditions.";

  return (
    <NodeDetailsPanel
      nodeId={node.id}
      nodeLabel={formData.label}
      onLabelChange={handleLabelChange}
      infoTooltip={endNodeInfo}
      additionalContent={
        <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200/50 dark:border-green-800/30 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-500/20 flex items-center justify-center border border-green-300/30 dark:border-green-700/30 shadow-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">Strategy Completion</h4>
              <p className="text-xs text-green-600 dark:text-green-400 bg-green-100/50 dark:bg-green-900/20 p-2 rounded border border-green-200/50 dark:border-green-700/30">
                Strategy execution will terminate successfully at this node
              </p>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default EndNodeEditor;
