import React from 'react';
import { NodeTypes } from '@xyflow/react';
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

// Define memoized base components for read-only mode
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

// Node wrapper props types for read-only mode
interface ReadonlyNodeWrapperProps {
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
  [key: string]: any;
}

// Read-only wrappers - NO NodeControls or NodeConnectControls
const ReadonlyStartNodeWrapper = React.memo(({ data, id, ...rest }: ReadonlyNodeWrapperProps) => {
  return (
    <div className={`${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedStartNode data={data} id={id} {...rest} />
    </div>
  );
});
ReadonlyStartNodeWrapper.displayName = 'ReadonlyStartNodeWrapper';

const ReadonlySignalNodeWrapper = React.memo(({ data, id, ...rest }: ReadonlyNodeWrapperProps) => {
  return (
    <div className={`${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedSignalNode data={data} id={id} {...rest} />
    </div>
  );
});
ReadonlySignalNodeWrapper.displayName = 'ReadonlySignalNodeWrapper';

const ReadonlyEntrySignalNodeWrapper = React.memo(({ data, id, ...rest }: ReadonlyNodeWrapperProps) => {
  return (
    <div className={`${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedEntrySignalNode data={data} id={id} {...rest} />
    </div>
  );
});
ReadonlyEntrySignalNodeWrapper.displayName = 'ReadonlyEntrySignalNodeWrapper';

const ReadonlyExitSignalNodeWrapper = React.memo(({ data, id, ...rest }: ReadonlyNodeWrapperProps) => {
  return (
    <div className={`${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedExitSignalNode data={data} id={id} {...rest} />
    </div>
  );
});
ReadonlyExitSignalNodeWrapper.displayName = 'ReadonlyExitSignalNodeWrapper';

const ReadonlyActionNodeWrapper = React.memo(({ data, id, ...rest }: ReadonlyNodeWrapperProps) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    positions: Array.isArray(data.positions) ? data.positions : []
  }), [data]);
  
  return (
    <div className={`${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedActionNode data={enhancedData} id={id} {...rest} />
    </div>
  );
});
ReadonlyActionNodeWrapper.displayName = 'ReadonlyActionNodeWrapper';

const ReadonlyEntryNodeWrapper = React.memo(({ data, id, ...rest }: ReadonlyNodeWrapperProps) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    positions: Array.isArray(data.positions) ? data.positions : [],
    actionType: 'entry'
  }), [data]);
  
  return (
    <div className={`${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedEntryNode data={enhancedData} id={id} {...rest} />
    </div>
  );
});
ReadonlyEntryNodeWrapper.displayName = 'ReadonlyEntryNodeWrapper';

const ReadonlyExitNodeWrapper = React.memo(({ data, id, ...rest }: ReadonlyNodeWrapperProps) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    positions: Array.isArray(data.positions) ? data.positions : [],
    actionType: 'exit'
  }), [data]);
  
  return (
    <div className={`${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedExitNode data={enhancedData} id={id} {...rest} />
    </div>
  );
});
ReadonlyExitNodeWrapper.displayName = 'ReadonlyExitNodeWrapper';

const ReadonlyModifyNodeWrapper = React.memo(({ data, id, ...rest }: ReadonlyNodeWrapperProps) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    actionType: 'modify'
  }), [data]);
  
  return (
    <div className={`${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedModifyNode data={enhancedData} id={id} {...rest} />
    </div>
  );
});
ReadonlyModifyNodeWrapper.displayName = 'ReadonlyModifyNodeWrapper';

const ReadonlyAlertNodeWrapper = React.memo(({ data, id, ...rest }: ReadonlyNodeWrapperProps) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    positions: Array.isArray(data.positions) ? data.positions : [],
    actionType: 'alert'
  }), [data]);
  
  return (
    <div className={`${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedAlertNode data={enhancedData} id={id} {...rest} />
    </div>
  );
});
ReadonlyAlertNodeWrapper.displayName = 'ReadonlyAlertNodeWrapper';

const ReadonlyEndNodeWrapper = React.memo(({ data, id, ...rest }: ReadonlyNodeWrapperProps) => {
  return (
    <div className={`${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedEndNode data={data} id={id} {...rest} />
    </div>
  );
});
ReadonlyEndNodeWrapper.displayName = 'ReadonlyEndNodeWrapper';

const ReadonlyForceEndNodeWrapper = React.memo(({ data, id, ...rest }: ReadonlyNodeWrapperProps) => {
  return (
    <div className={`${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedForceEndNode data={data} id={id} {...rest} />
    </div>
  );
});
ReadonlyForceEndNodeWrapper.displayName = 'ReadonlyForceEndNodeWrapper';

const ReadonlySquareOffNodeWrapper = React.memo(({ data, id, ...rest }: ReadonlyNodeWrapperProps) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    actionType: 'exit'
  }), [data]);
  
  return (
    <div className={`${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedSquareOffNode data={enhancedData} id={id} {...rest} />
    </div>
  );
});
ReadonlySquareOffNodeWrapper.displayName = 'ReadonlySquareOffNodeWrapper';

const ReadonlyRetryNodeWrapper = React.memo(({ data, id, ...rest }: ReadonlyNodeWrapperProps) => {
  const enhancedData = React.useMemo(() => ({
    ...data,
    actionType: 'retry'
  }), [data]);
  
  return (
    <div className={`${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedRetryNode data={enhancedData} id={id} {...rest} />
    </div>
  );
});
ReadonlyRetryNodeWrapper.displayName = 'ReadonlyRetryNodeWrapper';

const ReadonlyReEntrySignalNodeWrapper = React.memo(({ data, id, ...rest }: ReadonlyNodeWrapperProps) => {
  return (
    <div className={`${rest.dragging ? 'dragging' : ''} ${rest.selected ? 'selected' : ''}`} data-id={id}>
      <MemoizedReEntrySignalNode data={data} id={id} {...rest} />
    </div>
  );
});
ReadonlyReEntrySignalNodeWrapper.displayName = 'ReadonlyReEntrySignalNodeWrapper';

// Strategy Overview virtual node (hidden from canvas)
const StrategyOverviewNode = () => {
  return null;
};
StrategyOverviewNode.displayName = 'StrategyOverviewNode';

// Create read-only node types - no hover controls, no editing
export const createReadonlyNodeTypes = (): NodeTypes => {
  return {
    startNode: (props) => <ReadonlyStartNodeWrapper {...props} draggable={false} />,
    signalNode: (props) => <ReadonlySignalNodeWrapper {...props} draggable={false} />,
    entrySignalNode: (props) => <ReadonlyEntrySignalNodeWrapper {...props} draggable={false} />,
    exitSignalNode: (props) => <ReadonlyExitSignalNodeWrapper {...props} draggable={false} />,
    actionNode: (props) => <ReadonlyActionNodeWrapper {...props} draggable={false} />,
    entryNode: (props) => <ReadonlyEntryNodeWrapper {...props} draggable={false} />,
    exitNode: (props) => <ReadonlyExitNodeWrapper {...props} draggable={false} />,
    modifyNode: (props) => <ReadonlyModifyNodeWrapper {...props} draggable={false} />,
    alertNode: (props) => <ReadonlyAlertNodeWrapper {...props} draggable={false} />,
    retryNode: (props) => <ReadonlyRetryNodeWrapper {...props} draggable={false} />,
    reEntrySignalNode: (props) => <ReadonlyReEntrySignalNodeWrapper {...props} draggable={false} />,
    endNode: (props) => <ReadonlyEndNodeWrapper {...props} draggable={false} />,
    forceEndNode: (props) => <ReadonlyForceEndNodeWrapper {...props} draggable={false} />,
    squareOffNode: (props) => <ReadonlySquareOffNodeWrapper {...props} draggable={false} />,
    strategyOverview: () => <StrategyOverviewNode />
  };
};
