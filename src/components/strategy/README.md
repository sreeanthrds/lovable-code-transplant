# Strategy Builder Architecture

## Overview

The Strategy Builder is a visual node-based editor that allows users to create trading strategies by connecting different types of nodes. It leverages React Flow (@xyflow/react) to provide an interactive and intuitive interface for strategy building.

## Key Concepts

- **Nodes**: Represent different components of a trading strategy (Start, Signal, Action, End, ForceEnd)
- **Edges**: Connections between nodes that define the flow of the strategy
- **Flow**: The complete strategy graph with nodes and edges
- **Panel**: Side panel for editing node properties

## Directory Structure

```
/strategy
├── canvas/             # React Flow canvas handling
├── edges/              # Edge components and types
├── editors/            # Node property editors
│   ├── action-node/    # Action node editors
│   ├── end-node/       # End node editors
│   ├── force-end-node/ # Force end node editors
│   ├── signal-node/    # Signal node editors
│   ├── start-node/     # Start node editors
│   ├── condition-builder/ # Condition building components
│   ├── indicators/     # Indicator management
│   ├── form-components/# Reusable form components
│   ├── shared/         # Shared editor components
├── hooks/              # Custom React hooks
│   ├── flow-handlers/  # Flow event handling hooks
├── layout/              # Layout components
├── nodes/              # Node components and types
│   ├── action-node/    # Action node components
├── styles/             # CSS styles
├── toolbars/           # Toolbar components
├── utils/              # Utility functions
│   ├── conditionTypes.ts       # Condition type definitions
│   ├── dependency-tracking/    # Track dependencies between nodes
│   ├── edges/                  # Edge utilities
│   ├── flowUtils.ts            # Flow utilities
│   ├── handlers/               # Event handlers
│   ├── import-export/          # Import/export functionality
│   ├── indicatorConfig.ts      # Technical indicator configurations
│   ├── nodes/                  # Node utilities
│   ├── storage/                # Storage utilities
```

## Component Hierarchy

```
StrategyFlow
└── ReactFlowProvider
    └── StrategyFlowContent
        ├── FlowLayout
        │   ├── NodePanel (if open)
        │   └── ReactFlowCanvas
        │       ├── CanvasControls
        │       ├── TopToolbar
        │       └── BottomToolbar
```

## Node Types

1. **Start Node**: Entry point of the strategy. Configures the instrument, timeframe, and technical indicators.
2. **Signal Node**: Detects market conditions using conditional logic.
3. **Action Node**: Executes trading actions (entry, exit, alerts).
4. **End Node**: Normal termination of a strategy branch.
5. **Force End Node**: Forces strategy termination and closes positions.

## State Management

The strategy builder uses a combination of:

1. **React Flow State**: Manages the visual representation of nodes and edges.
2. **Custom Zustand Store**: Manages strategy data and provides undo/redo functionality.
3. **Local Component State**: For individual node editors.

## Hook Architecture

The codebase uses a pattern of small, focused hooks that compose together:

1. **State Hooks**: Manage specific pieces of state (`useFlowState`, `useNodeStateManagement`, etc.)
2. **Handler Hooks**: Manage event handlers (`useFlowHandlers`, `useNodeHandlers`, etc.)
3. **Feature Hooks**: Implement specific features (`useInitializeNodeData`, `useExitConditionType`, etc.)

## Key Files

- `StrategyFlow.tsx`: Root component that provides the ReactFlow context
- `StrategyFlowContent.tsx`: Main container component managing state and handlers
- `useFlowState.ts`: Core hook managing the application state
- `NodePanel.tsx`: Side panel for editing node properties
- `nodeTypes.tsx`: Defines all the node components for ReactFlow

## Important Patterns

### Hook Composition

Complex hooks are broken down into smaller, focused hooks that are composed together:

```typescript
// Example: useExitNodeForm uses multiple smaller hooks
const { 
  exitType, 
  updateExitType 
} = useExitConditionType({ exitNodeData, updateExitNodeData });

const {
  handleOrderTypeChange,
  handleLimitPriceChange
} = useOrderSettings({ exitNodeData, updateExitNodeData });
```

### Node Initialization

Nodes are initialized with default data when they're first created:

```typescript
// useExitNodeInitialization.ts
useEffect(() => {
  if (!initializedRef.current && !nodeData.exitNodeData) {
    initializedRef.current = true;
    updateNodeData(node.id, {
      ...nodeData,
      exitNodeData: defaultExitNodeData
    });
  }
}, [node.id, initializedRef, updateNodeData]);
```

### Event Handler Delegation

Node event handlers are created in hooks and passed down to components:

```typescript
// Example: Creating node handlers
const {
  onNodeClick,
  handleAddNode,
  updateNodeData,
  handleDeleteNode
} = useNodeHandlers({
  nodes,
  edges,
  reactFlowInstance,
  // ... other dependencies
});
```

## Trailing Variables

Trailing variables are dynamic values that track position prices in real-time. They are created automatically when trailing stop functionality is enabled on entry node positions.

### Types of Trailing Variables

1. **Position Price Trailing**: Tracks the actual position price movement
2. **Underlying Price Trailing** (Options only): Tracks the underlying instrument's price movement

### Variable Naming Convention

- Position variables: `Trailing_{VPT/VPI}_Position`
- Underlying variables: `Trailing_{VPT/VPI}_Underlying` (options only)

### Configuration

- **Price Move**: The amount the price must move in your favor before the trail begins
- **Trail Price**: The distance the trailing stop follows behind the favorable price movement
- **Units**: Either "points" (absolute price difference) or "percentage" (relative price difference)

### Usage in Conditions

Trailing variables can be referenced in signal node conditions and other expression builders:
- Available in the "Trailing Variable" expression type
- Only valid while the associated position is open
- Returns null if the position is closed

## Adding New Features

When adding new features, consider:

1. Create focused hooks and components with single responsibilities
2. Follow existing patterns for state management and event handling
3. Keep node editors and components small and focused
4. Use type definitions consistently

## Best Practices

1. Use memo for React Flow components to prevent unnecessary renders
2. Use the built-in NodeControls and NodeConnectControls for node operations
3. Node data should be updated through the updateNodeData function
4. Use proper typing for all node data operations

## Common Workflows

### Adding a New Node Type

1. Create a new node component in `/nodes/`
2. Add node-specific editor in `/editors/`
3. Register the node type in `nodeTypes.tsx`
4. Update node creation in `nodeOperations.ts`

### Modifying Node Data

All node data updates should go through the `updateNodeData` function:

```typescript
updateNodeData(node.id, {
  ...node.data,
  propertyToChange: newValue
});
```

This ensures React Flow and the Zustand store stay in sync.
