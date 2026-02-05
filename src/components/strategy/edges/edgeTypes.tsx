
import React from 'react';
import { EdgeTypes } from '@xyflow/react';
import ButtonEdge from './ButtonEdge';
import DashEdge from './DashEdge';
import FixedEdge from './FixedEdge';

// Create properly memoized edge components
const MemoizedButtonEdge = React.memo(ButtonEdge);
MemoizedButtonEdge.displayName = 'MemoizedButtonEdge';

const MemoizedDashEdge = React.memo(DashEdge);
MemoizedDashEdge.displayName = 'MemoizedDashEdge';

const MemoizedFixedEdge = React.memo(FixedEdge);
MemoizedFixedEdge.displayName = 'MemoizedFixedEdge';

// Create stable wrapper components that properly pass props
const ButtonEdgeWrapper = React.memo((props: any) => {
  const { data, id, onDelete, ...rest } = props;
  return <MemoizedButtonEdge {...rest} id={id} onDelete={onDelete} />;
});
ButtonEdgeWrapper.displayName = 'ButtonEdgeWrapper';

const DashEdgeWrapper = React.memo((props: any) => {
  return <MemoizedDashEdge {...props} />;
});
DashEdgeWrapper.displayName = 'DashEdgeWrapper';

const FixedEdgeWrapper = React.memo((props: any) => {
  return <MemoizedFixedEdge {...props} />;
});
FixedEdgeWrapper.displayName = 'FixedEdgeWrapper';

// Create a function to generate edgeTypes without delete functionality
const createEdgeTypes = (): EdgeTypes => {
  return {
    default: (props) => <ButtonEdgeWrapper {...props} />,
    button: (props) => <ButtonEdgeWrapper {...props} />,
    bezier: (props) => <ButtonEdgeWrapper {...props} />,
    smoothstep: (props) => <ButtonEdgeWrapper {...props} />,
    dashEdge: (props) => <DashEdgeWrapper {...props} />,
    fixedEdge: (props) => <FixedEdgeWrapper {...props} />
  };
};

export { createEdgeTypes };
