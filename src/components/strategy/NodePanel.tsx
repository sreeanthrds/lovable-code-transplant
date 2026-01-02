
import React from 'react';
import { Node } from '@xyflow/react';
import { X, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PositionStorePanel from './toolbars/bottom-toolbar/PositionStorePanel';
import StrategyOverviewPanel from './StrategyOverviewPanel';

// Import all node editors directly (no lazy loading)
import StartNodeEditor from './editors/StartNodeEditor';
import EntryNodeEditor from './editors/EntryNodeEditor';
import ExitNodeEditor from './editors/ExitNodeEditor';
import SignalNodeEditor from './editors/SignalNodeEditor';
import EntrySignalNodeEditor from './editors/EntrySignalNodeEditor';
import ExitSignalNodeEditor from './editors/ExitSignalNodeEditor';
import ActionNodeEditor from './editors/ActionNodeEditor';
import AlertNodeEditor from './editors/AlertNodeEditor';
import EndNodeEditor from './editors/EndNodeEditor';
import ForceEndNodeEditor from './editors/ForceEndNodeEditor';
import SquareOffNodeEditor from './editors/SquareOffNodeEditor';
import ModifyNodeEditor from './editors/ModifyNodeEditor';
import ReEntryNodeEditor from './editors/ReEntryNodeEditor';
import ReEntrySignalNodeEditor from './editors/ReEntrySignalNodeEditor';
import { ConditionClipboardProvider } from './editors/condition-builder/providers/ConditionClipboardProvider';

interface NodePanelProps {
  node: Node | null;
  updateNodeData: (nodeId: string, newData: any) => void;
  onClose: () => void;
  isReadOnly?: boolean;
  onReset?: () => void;
}

const getNodeDisplayName = (node: Node): string => {
  // Map node types to their proper display names
  const nodeTypeMap: Record<string, string> = {
    'startNode': 'Strategy Controller',
    'entryNode': 'Entry',
    'exitNode': 'Exit', 
    'signalNode': 'Signal Generator',
    'entrySignalNode': 'Entry Signal',
    'exitSignalNode': 'Exit Signal',
    'actionNode': 'Action Controller',
    'alertNode': 'Alert Notification',
    'endNode': 'End Controller',
    'forceEndNode': 'Force End',
    'squareOffNode': 'Square Off',
    'modifyNode': 'Modify Position',
    'reEntryNode': 'Re-Entry Controller',
    'reEntrySignalNode': 'Re-Entry Signal'
  };

  return nodeTypeMap[node.type || ''] || node.type?.replace(/([A-Z])/g, ' $1').trim() || 'Unknown Node';
};

const NodePanel: React.FC<NodePanelProps> = ({ node, updateNodeData, onClose, isReadOnly = false, onReset }) => {
  console.log('🔍 NodePanel received node:', node);
  
  if (!node) {
    console.log('❌ NodePanel: No node provided');
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <p>No node selected</p>
        </div>
      </div>
    );
  }

  // Handle special panels - check both id and type
  if (node.id === 'position-store' || node.type === 'positionStore') {
    console.log('📋 Rendering PositionStorePanel');
    return <PositionStorePanel onClose={onClose} />;
  }
  
  // Strategy overview panel - check for virtual strategy overview node
  if (node.type === 'strategyOverview' || 
      node.data?.isStrategyOverview || 
      node.id?.includes('strategy-overview')) {
    console.log('📋 Rendering StrategyOverviewPanel for node:', node);
    return <StrategyOverviewPanel onClose={onClose} />;
  }

  const renderNodeEditor = () => {
    const commonProps = {
      node,
      updateNodeData,
      onClose
    };

    // Direct rendering - no Suspense or lazy loading
    switch (node.type) {
      case 'startNode':
        return <StartNodeEditor {...commonProps} />;
      case 'entryNode':
        return <EntryNodeEditor {...commonProps} />;
      case 'exitNode':
        return <ExitNodeEditor {...commonProps} />;
      case 'signalNode':
        return <SignalNodeEditor {...commonProps} />;
      case 'entrySignalNode':
        return <EntrySignalNodeEditor {...commonProps} />;
      case 'exitSignalNode':
        return <ExitSignalNodeEditor {...commonProps} />;
      case 'actionNode':
        return <ActionNodeEditor {...commonProps} />;
      case 'alertNode':
        return <AlertNodeEditor {...commonProps} />;
      case 'endNode':
        return <EndNodeEditor {...commonProps} />;
      case 'forceEndNode':
        return <ForceEndNodeEditor {...commonProps} />;
      case 'squareOffNode':
        return <SquareOffNodeEditor {...commonProps} />;
      case 'modifyNode':
        return <ModifyNodeEditor {...commonProps} />;
      case 'reEntrySignalNode':
        return <ReEntrySignalNodeEditor {...commonProps} />;
      case 'reEntryNode':
      case 'retryNode':
        return <ReEntryNodeEditor {...commonProps} />;
      default:
        console.log('❓ Unknown node type:', node.type, 'for node:', node);
        return (
          <div className="p-4 text-center text-muted-foreground">
            <p>Unknown node type: {node.type}</p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        );
    }
  };

  return (
    <ConditionClipboardProvider>
      <div className="h-full flex flex-col node-panel-background border-l-2 border-teal-400/40 dark:border-teal-500/30 shadow-[inset_0_0_20px_rgba(20,184,166,0.1),0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-[2px]">
        {/* Compact Professional Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-teal-400/30 dark:border-teal-500/20 bg-white/[0.01] shadow-[0_2px_12px_rgba(0,0,0,0.5)] backdrop-blur-[3px]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-gradient-to-b from-primary via-blue-500 to-violet-500 rounded-full shadow-sm" />
              <span className="text-xs text-muted-foreground">Node Configuration</span>
              {isReadOnly && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700">
                  View Only
                </Badge>
              )}
            </div>
            <h3 className="text-sm font-semibold text-primary text-left truncate ml-4">
              {getNodeDisplayName(node)}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            {isReadOnly && onReset && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onReset}
                      className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Reset to original</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 hover:scale-105"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {/* Compact Content Area with full height utilization */}
        <div className="flex-1 overflow-auto bg-transparent min-h-0">
          <div className="p-4 h-full">
            {renderNodeEditor()}
          </div>
        </div>
      </div>
    </ConditionClipboardProvider>
  );
};

export default NodePanel;
