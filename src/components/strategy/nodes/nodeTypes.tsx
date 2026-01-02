import React from 'react';
import { NodeTypes, Position } from '@xyflow/react';
import StartNode from './StartNode';
import SignalNode from './SignalNode';
import EntrySignalNode from './EntrySignalNode';
import ExitSignalNode from './ExitSignalNode';
import ActionNode from './ActionNode';
import EntryNode from './EntryNode';
import ExitNode from './ExitNode';
import AlertNode from './AlertNode';
import ModifyNode from './ModifyNode';
import EndNode from './EndNode';
import ForceEndNode from './ForceEndNode';
import SquareOffNode from './SquareOffNode';
import RetryNode from './RetryNode';
import ReEntrySignalNode from './ReEntrySignalNode';
import NodeControls from '../NodeControls';
import NodeConnectControls from '../NodeConnectControls';

// Define memoized base components
const MemoizedStartNode = React.memo(StartNode);
const MemoizedSignalNode = React.memo(SignalNode);
const MemoizedEntrySignalNode = React.memo(EntrySignalNode);
const MemoizedExitSignalNode = React.memo(ExitSignalNode);
const MemoizedActionNode = React.memo(ActionNode);
const MemoizedEntryNode = React.memo(EntryNode);
const MemoizedExitNode = React.memo(ExitNode);
const MemoizedAlertNode = React.memo(AlertNode);
const MemoizedModifyNode = React.memo(ModifyNode);
const MemoizedEndNode = React.memo(EndNode);
const MemoizedForceEndNode = React.memo(ForceEndNode);
const MemoizedSquareOffNode = React.memo(SquareOffNode);
const MemoizedRetryNode = React.memo(RetryNode);
const MemoizedReEntrySignalNode = React.memo(ReEntrySignalNode);
const MemoizedNodeControls = React.memo(NodeControls);
const MemoizedNodeConnectControls = React.memo(NodeConnectControls);

// Node wrapper props types
interface NodeWrapperProps {
  id: string;
  data: any;
  type: string;
  selected: boolean;
  dragging: boolean;
  zIndex: number;
  selectable: boolean;
  deletable: boolean;
  draggable: boolean;
  isConnectable: boolean;
  positionAbsoluteX: number;
  positionAbsoluteY: number;
  onDelete?: (id: string) => void;
  onAddNode?: (type: string, parentNodeId: string) => void;
  [key: string]: any;
}

// Create stable wrapper components
const StartNodeWrapper = React.memo(({ data, id, onAddNode, ...rest }: NodeWrapperProps) => {
  return (
    <div className={`group ${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedStartNode data={data} id={id} {...rest} />
      <MemoizedNodeConnectControls showOn="start" onAddNode={onAddNode} parentNodeId={id} />
    </div>
  );
});
StartNodeWrapper.displayName = 'StartNodeWrapper';

const SignalNodeWrapper = React.memo(({ data, id, onDelete, onAddNode, ...rest }: NodeWrapperProps) => {
  return (
    <div className={`group ${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedSignalNode data={data} id={id} {...rest} />
      <MemoizedNodeControls node={{ id, type: 'signalNode', data }} onDelete={onDelete} />
      <MemoizedNodeConnectControls showOn="signal" onAddNode={onAddNode} parentNodeId={id} />
    </div>
  );
});
SignalNodeWrapper.displayName = 'SignalNodeWrapper';

const EntrySignalNodeWrapper = React.memo(({ data, id, onDelete, onAddNode, ...rest }: NodeWrapperProps) => {
  return (
    <div className={`group ${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedEntrySignalNode data={data} id={id} {...rest} />
      <MemoizedNodeControls node={{ id, type: 'entrySignalNode', data }} onDelete={onDelete} />
      <MemoizedNodeConnectControls showOn="signal" onAddNode={onAddNode} parentNodeId={id} />
    </div>
  );
});
EntrySignalNodeWrapper.displayName = 'EntrySignalNodeWrapper';

const ExitSignalNodeWrapper = React.memo(({ data, id, onDelete, onAddNode, ...rest }: NodeWrapperProps) => {
  return (
    <div className={`group ${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedExitSignalNode data={data} id={id} {...rest} />
      <MemoizedNodeControls node={{ id, type: 'exitSignalNode', data }} onDelete={onDelete} />
      <MemoizedNodeConnectControls showOn="signal" onAddNode={onAddNode} parentNodeId={id} />
    </div>
  );
});
ExitSignalNodeWrapper.displayName = 'ExitSignalNodeWrapper';

const ActionNodeWrapper = React.memo(({ data, id, onDelete, onAddNode, updateNodeData, ...rest }: NodeWrapperProps & { updateNodeData?: (id: string, data: any) => void }) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    updateNodeData,
    positions: Array.isArray(data.positions) ? data.positions : []
  }), [data, updateNodeData]);
  
  return (
    <div className={`group ${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedActionNode data={enhancedData} id={id} {...rest} />
      <MemoizedNodeControls node={{ id, type: 'actionNode', data }} onDelete={onDelete} />
      <MemoizedNodeConnectControls showOn="action" onAddNode={onAddNode} parentNodeId={id} />
    </div>
  );
});
ActionNodeWrapper.displayName = 'ActionNodeWrapper';

const EntryNodeWrapper = React.memo(({ data, id, onDelete, onAddNode, updateNodeData, ...rest }: NodeWrapperProps & { updateNodeData?: (id: string, data: any) => void }) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    updateNodeData,
    positions: Array.isArray(data.positions) ? data.positions : [],
    actionType: 'entry'
  }), [data, updateNodeData]);
  
  return (
    <div className={`group ${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedEntryNode data={enhancedData} id={id} {...rest} />
      <MemoizedNodeControls node={{ id, type: 'entryNode', data }} onDelete={onDelete} />
      <MemoizedNodeConnectControls showOn="action" onAddNode={onAddNode} parentNodeId={id} />
    </div>
  );
});
EntryNodeWrapper.displayName = 'EntryNodeWrapper';

const ExitNodeWrapper = React.memo(({ data, id, onDelete, onAddNode, updateNodeData, ...rest }: NodeWrapperProps & { updateNodeData?: (id: string, data: any) => void }) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    updateNodeData,
    positions: Array.isArray(data.positions) ? data.positions : [],
    actionType: 'exit'
  }), [data, updateNodeData]);
  
  return (
    <div className={`group ${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedExitNode data={enhancedData} id={id} {...rest} />
      <MemoizedNodeControls node={{ id, type: 'exitNode', data }} onDelete={onDelete} />
      <MemoizedNodeConnectControls showOn="action" onAddNode={onAddNode} parentNodeId={id} />
    </div>
  );
});
ExitNodeWrapper.displayName = 'ExitNodeWrapper';

const ModifyNodeWrapper = React.memo(({ data, id, onDelete, onAddNode, updateNodeData, ...rest }: NodeWrapperProps & { updateNodeData?: (id: string, data: any) => void }) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    updateNodeData,
    actionType: 'modify'
  }), [data, updateNodeData]);
  
  return (
    <div className={`group ${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedModifyNode data={enhancedData} id={id} {...rest} />
      <MemoizedNodeControls node={{ id, type: 'modifyNode', data }} onDelete={onDelete} />
      <MemoizedNodeConnectControls showOn="action" onAddNode={onAddNode} parentNodeId={id} />
    </div>
  );
});
ModifyNodeWrapper.displayName = 'ModifyNodeWrapper';

const AlertNodeWrapper = React.memo(({ data, id, onDelete, onAddNode, updateNodeData, ...rest }: NodeWrapperProps & { updateNodeData?: (id: string, data: any) => void }) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    updateNodeData,
    positions: Array.isArray(data.positions) ? data.positions : [],
    actionType: 'alert'
  }), [data, updateNodeData]);
  
  return (
    <div className={`group ${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedAlertNode data={enhancedData} id={id} {...rest} />
      <MemoizedNodeControls node={{ id, type: 'alertNode', data }} onDelete={onDelete} />
      <MemoizedNodeConnectControls showOn="action" onAddNode={onAddNode} parentNodeId={id} />
    </div>
  );
});
AlertNodeWrapper.displayName = 'AlertNodeWrapper';

const EndNodeWrapper = React.memo(({ data, id, onDelete, ...rest }: NodeWrapperProps) => {
  return (
    <div className={`group ${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedEndNode data={data} id={id} {...rest} />
      <MemoizedNodeControls node={{ id, type: 'endNode', data }} onDelete={onDelete} />
    </div>
  );
});
EndNodeWrapper.displayName = 'EndNodeWrapper';

const ForceEndNodeWrapper = React.memo(({ data, id, onDelete, ...rest }: NodeWrapperProps) => {
  return (
    <div className={`group ${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedForceEndNode data={data} id={id} {...rest} />
      <MemoizedNodeControls node={{ id, type: 'forceEndNode', data }} onDelete={onDelete} />
    </div>
  );
});
ForceEndNodeWrapper.displayName = 'ForceEndNodeWrapper';

const SquareOffNodeWrapper = React.memo(({ data, id, onDelete, onAddNode, updateNodeData, ...rest }: NodeWrapperProps & { updateNodeData?: (id: string, data: any) => void }) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    updateNodeData,
    actionType: 'exit' // Treat as exit action type for compatibility
  }), [data, updateNodeData]);
  
  return (
    <div className={`group ${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedSquareOffNode data={enhancedData} id={id} {...rest} />
      <MemoizedNodeControls node={{ id, type: 'squareOffNode', data }} onDelete={onDelete} />
      {/* No NodeConnectControls for square-off node as it's the final node */}
    </div>
  );
});
SquareOffNodeWrapper.displayName = 'SquareOffNodeWrapper';

const RetryNodeWrapper = React.memo(({ data, id, onDelete, onAddNode, updateNodeData, ...rest }: NodeWrapperProps & { updateNodeData?: (id: string, data: any) => void }) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    updateNodeData,
    actionType: 'retry'
  }), [data, updateNodeData]);
  
  return (
    <div className={`relative group ${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedRetryNode data={enhancedData} id={id} {...rest} />
      <MemoizedNodeControls node={{ id, type: 'retryNode', data }} onDelete={onDelete} />
      {/* Hover add node controls disabled for retry nodes */}
    </div>
  );
});
RetryNodeWrapper.displayName = 'RetryNodeWrapper';

const ReEntrySignalNodeWrapper = React.memo(({ data, id, onDelete, onAddNode, updateNodeData, ...rest }: NodeWrapperProps & { updateNodeData?: (id: string, data: any) => void }) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    updateNodeData
  }), [data, updateNodeData]);
  
  return (
    <div className={`relative group ${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedReEntrySignalNode data={enhancedData} id={id} {...rest} />
      <MemoizedNodeControls node={{ id, type: 'reEntrySignalNode', data }} onDelete={onDelete} />
      <MemoizedNodeConnectControls showOn="signal" onAddNode={onAddNode} parentNodeId={id} />
    </div>
  );
});
ReEntrySignalNodeWrapper.displayName = 'ReEntrySignalNodeWrapper';

// Strategy Overview virtual node (hidden from canvas)
const StrategyOverviewNode = () => {
  return null; // This node should never be visible on the canvas
};
StrategyOverviewNode.displayName = 'StrategyOverviewNode';

// Create a function to generate nodeTypes with stable renderer functions
const createNodeTypes = (
  onDeleteNode: (id: string) => void, 
  onAddNode: (type: string, parentNodeId: string) => void,
  updateNodeData?: (id: string, data: any) => void
): NodeTypes => {
  return {
    startNode: (props) => <StartNodeWrapper {...props} draggable={true} onAddNode={onAddNode} />,
    signalNode: (props) => <SignalNodeWrapper {...props} draggable={true} onDelete={onDeleteNode} onAddNode={onAddNode} />,
    entrySignalNode: (props) => <EntrySignalNodeWrapper {...props} draggable={true} onDelete={onDeleteNode} onAddNode={onAddNode} />,
    exitSignalNode: (props) => <ExitSignalNodeWrapper {...props} draggable={true} onDelete={onDeleteNode} onAddNode={onAddNode} />,
    actionNode: (props) => <ActionNodeWrapper {...props} draggable={true} onDelete={onDeleteNode} onAddNode={onAddNode} updateNodeData={updateNodeData} />,
    entryNode: (props) => <EntryNodeWrapper {...props} draggable={true} onDelete={onDeleteNode} onAddNode={onAddNode} updateNodeData={updateNodeData} />,
    exitNode: (props) => <ExitNodeWrapper {...props} draggable={true} onDelete={onDeleteNode} onAddNode={onAddNode} updateNodeData={updateNodeData} />,
    modifyNode: (props) => <ModifyNodeWrapper {...props} draggable={true} onDelete={onDeleteNode} onAddNode={onAddNode} updateNodeData={updateNodeData} />,
    alertNode: (props) => <AlertNodeWrapper {...props} draggable={true} onDelete={onDeleteNode} onAddNode={onAddNode} updateNodeData={updateNodeData} />,
    retryNode: (props) => <RetryNodeWrapper {...props} draggable={true} onDelete={onDeleteNode} onAddNode={onAddNode} updateNodeData={updateNodeData} />,
    reEntrySignalNode: (props) => <ReEntrySignalNodeWrapper {...props} draggable={true} onDelete={onDeleteNode} onAddNode={onAddNode} updateNodeData={updateNodeData} />,
    endNode: (props) => <EndNodeWrapper {...props} draggable={true} onDelete={onDeleteNode} />,
    forceEndNode: (props) => <ForceEndNodeWrapper {...props} draggable={true} onDelete={onDeleteNode} />,
    squareOffNode: (props) => <SquareOffNodeWrapper {...props} draggable={true} onDelete={onDeleteNode} onAddNode={onAddNode} updateNodeData={updateNodeData} />,
    strategyOverview: () => <StrategyOverviewNode />
  };
};

export { createNodeTypes };
