
import React, { memo } from 'react';
import { Separator } from '@/components/ui/separator';
import InputField from './InputField';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NodeDetailsPanelProps {
  nodeId: string;
  nodeLabel: string;
  onLabelChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  additionalContent?: React.ReactNode;
  infoTooltip?: string;
}

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({
  nodeId,
  nodeLabel,
  onLabelChange,
  additionalContent,
  infoTooltip,
}) => {
  return (
    <div className="space-y-4">
      {/* ID and Label Fields - Same Row with Labels Above */}
      <div className="flex gap-4">
        {/* ID Field */}
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground block mb-1">ID</label>
          <input
            type="text"
            value={nodeId}
            readOnly
            className="w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-md text-gray-400"
          />
        </div>
        
        {/* Label Field */}
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground block mb-1">Label</label>
          <input
            type="text"
            value={nodeLabel || ''}
            onChange={onLabelChange}
            placeholder="Enter descriptive node label"
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        
        {/* Info Tooltip */}
        {infoTooltip && (
          <div className="flex items-end pb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 cursor-help transition-all duration-200">
                    <Info className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-3 text-sm" side="bottom">
                  <p className="leading-relaxed">{infoTooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      
      {/* Additional Content Section */}
      {additionalContent && (
        <div className="space-y-3">
          {additionalContent}
        </div>
      )}
    </div>
  );
};

export default memo(NodeDetailsPanel);
