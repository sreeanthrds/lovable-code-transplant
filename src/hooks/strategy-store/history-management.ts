
import { Node, Edge } from '@xyflow/react';
import { SetState } from './types';

/**
 * Creates the addHistoryItem function for the strategy store
 */
export function createAddHistoryItemFunction(set: SetState) {
  return (nodes: Node[], edges: Edge[]) => set((state) => {
    // Skip if the history is empty and we're adding empty content
    if (state.history.length === 0 && nodes.length === 0 && edges.length === 0) {
      return state;
    }
    
    // Skip if this item is identical to the current history item
    if (state.historyIndex >= 0 && state.history.length > 0) {
      const currentItem = state.history[state.historyIndex];
      
      // Compare node and edge counts first
      if (currentItem.nodes.length === nodes.length && 
          currentItem.edges.length === edges.length) {
        
        // Do a simpler comparison to avoid excessive computation
        const currentNodeIds = currentItem.nodes.map(n => n.id).sort().join('|');
        const newNodeIds = nodes.map(n => n.id).sort().join('|');
        
        const currentEdgeIds = currentItem.edges.map(e => e.id).sort().join('|');
        const newEdgeIds = edges.map(e => e.id).sort().join('|');
        
        if (currentNodeIds === newNodeIds && currentEdgeIds === newEdgeIds) {
          return state; // Skip adding identical history item
        }
      }
    }
    
    // Create new history by truncating at current index
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    
    // Create deep copies to avoid reference issues and add timestamp
    newHistory.push({ 
      nodes: JSON.parse(JSON.stringify(nodes)), 
      edges: JSON.parse(JSON.stringify(edges)),
      timestamp: Date.now()
    });
    
    // Limit history size to prevent memory issues (keep 30 items max)
    const limitedHistory = newHistory.length > 30 
      ? newHistory.slice(newHistory.length - 30) 
      : newHistory;
    
    return {
      history: limitedHistory,
      historyIndex: limitedHistory.length - 1,
    };
  });
}

/**
 * Creates the undo function for the strategy store
 */
export function createUndoFunction(set: SetState) {
  return () => set((state) => {
    if (state.historyIndex > 0) {
      const prevState = state.history[state.historyIndex - 1];
      return {
        nodes: prevState.nodes,
        edges: prevState.edges,
        historyIndex: state.historyIndex - 1,
      };
    }
    return state;
  });
}

/**
 * Creates the redo function for the strategy store
 */
export function createRedoFunction(set: SetState) {
  return () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const nextState = state.history[state.historyIndex + 1];
      return {
        nodes: nextState.nodes,
        edges: nextState.edges,
        historyIndex: state.historyIndex + 1,
      };
    }
    return state;
  });
}

/**
 * Creates the resetHistory function for the strategy store
 */
export function createResetHistoryFunction(set: SetState) {
  return () => set({
    history: [],
    historyIndex: -1,
  });
}
