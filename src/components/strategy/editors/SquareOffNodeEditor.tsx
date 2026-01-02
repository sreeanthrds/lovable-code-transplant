import React from 'react';
import { Node } from '@xyflow/react';
import { NodeDetailsPanel } from './shared';
import { useSquareOffNodeForm } from './square-off-node/useSquareOffNodeForm';
import SquareOffNodeSettings from './square-off-node/SquareOffNodeSettings';
import EndConditionsSettings from './square-off-node/components/EndConditionsSettings';
import { Separator } from '@/components/ui/separator';

interface SquareOffNodeEditorProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const SquareOffNodeEditor: React.FC<SquareOffNodeEditorProps> = ({
  node,
  updateNodeData,
}) => {
  const {
    formData,
    handleLabelChange,
    handleMessageChange,
    handleEndConditionsChange,
  } = useSquareOffNodeForm({ node, updateNodeData });

  return (
    <NodeDetailsPanel
      nodeId={node.id}
      nodeLabel={formData.label}
      onLabelChange={handleLabelChange}
      infoTooltip="Square Off node immediately closes all open positions and forcibly stops the entire strategy execution. This is an emergency stop mechanism."
      additionalContent={
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/30 shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-4">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <h4 className="text-sm font-semibold">Emergency Stop Configuration</h4>
              </div>
              
              <div className="bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-amber-600 dark:text-amber-400 text-sm font-medium">⚠️ Critical Action</div>
                </div>
                <p className="text-amber-700 dark:text-amber-300 text-sm mt-2">
                  This node will immediately close ALL open positions and terminate the strategy. Use with caution.
                </p>
              </div>
              
              <SquareOffNodeSettings
                message={formData.message}
                onMessageChange={handleMessageChange}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Strategy Force End Conditions</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure the conditions that will trigger this square-off node to execute and forcibly close all positions.
            </p>
            <EndConditionsSettings 
              endConditions={formData.endConditions}
              onChange={handleEndConditionsChange}
            />
          </div>
        </div>
      }
    />
  );
};

export default SquareOffNodeEditor;