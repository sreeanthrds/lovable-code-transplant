
import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';
import { StrategyStore } from './types';
import { 
  createSetNodesFunction,
  createSetEdgesFunction
} from './state-setters';
import {
  createAddHistoryItemFunction,
  createUndoFunction,
  createRedoFunction,
  createResetHistoryFunction
} from './history-management';
import { initialNodes } from '../../components/strategy/utils/flowUtils';
import { autoArrangeNodes } from '../../components/strategy/utils/nodes/autoArrange';

// Create the virtual strategy overview node
const createStrategyOverviewNode = (): Node => ({
  id: 'strategy-overview-virtual',
  type: 'strategyOverview',
  position: { x: 0, y: 0 },
  data: { 
    label: 'Strategy Overview',
    isStrategyOverview: true,
    isVirtual: true // Mark as virtual so we can filter it out
  },
  hidden: true, // Hide from the canvas
  draggable: false,
  selectable: false,
  deletable: false
});

/**
 * Strategy store for managing nodes, edges, and history
 */
export const useStrategyStore = create<StrategyStore>((set, get) => ({
  nodes: [],
  edges: [],
  history: [],
  historyIndex: -1,
  selectedNode: null,
  isPanelOpen: false,
  
  // State setters with optimization
  setNodes: createSetNodesFunction(set, get),
  setEdges: createSetEdgesFunction(set, get),
  
  // Panel management
  setSelectedNode: (node: Node | null) => {
    set({ selectedNode: node });
  },
  setIsPanelOpen: (open: boolean) => {
    set({ isPanelOpen: open });
  },
  
  // History management
  addHistoryItem: createAddHistoryItemFunction(set),
  undo: createUndoFunction(set),
  redo: createRedoFunction(set),
  resetHistory: createResetHistoryFunction(set),
  
  // Get nodes for export (filters out virtual nodes)
  getExportableNodes: () => {
    const { nodes } = get();
    return nodes.filter(node => !node.data?.isVirtual && !node.data?.isStrategyOverview);
  },
  
  // Clean up duplicate strategy overview nodes and ensure only one exists
  cleanupOverviewNodes: () => {
    const { nodes } = get();
    const overviewNodes = nodes.filter(node => node.data?.isStrategyOverview);
    
    if (overviewNodes.length > 1) {
      // Keep only the first overview node and remove duplicates
      const firstOverviewNode = overviewNodes[0];
      const cleanedNodes = nodes.filter(node => 
        !node.data?.isStrategyOverview || node.id === firstOverviewNode.id
      );
      set({ nodes: cleanedNodes });
      console.log(`Cleaned up ${overviewNodes.length - 1} duplicate strategy overview nodes`);
    }
  },
  
  // Get strategy overview node (create if doesn't exist, ensure only one exists)
  getStrategyOverviewNode: () => {
    const { nodes, cleanupOverviewNodes } = get();
    
    // First cleanup any duplicates
    cleanupOverviewNodes();
    
    let overviewNode = nodes.find(node => node.data?.isStrategyOverview);
    
    if (!overviewNode) {
      overviewNode = createStrategyOverviewNode();
      // Add to nodes but don't trigger history
      const updatedNodes = [...nodes, overviewNode];
      set({ nodes: updatedNodes });
    }
    
    return overviewNode;
  },

  // Helper to get existing overview node or create new one (ensures single instance)
  getOrCreateOverviewNode: () => {
    const { nodes, cleanupOverviewNodes } = get();
    
    // First cleanup any duplicates
    cleanupOverviewNodes();
    
    return nodes.find(node => node.data?.isStrategyOverview) || createStrategyOverviewNode();
  },
  
  // Reset nodes to initial state in a controlled sequence
  resetNodes: () => {
    // First clear everything including panel state
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      isPanelOpen: false
    });
    
    // Reset history
    get().resetHistory();
    
    // Add initial nodes after a slight delay
    setTimeout(() => {
      const nodesWithOverview = [...initialNodes, createStrategyOverviewNode()];
      set({
        nodes: nodesWithOverview
      });
      
      // Add initial state to history after nodes are set (only exportable nodes)
      setTimeout(() => {
        get().addHistoryItem(initialNodes, []);
      }, 100);
    }, 100);
  },
  
  // Pro Auto-arrange with ELK.js layouts (hierarchical by default)
  handleAutoArrange: async () => {
    console.log('Pro auto-arrange called from store');
    const { getExportableNodes, edges, setNodes, addHistoryItem, getStrategyOverviewNode } = get();
    const exportableNodes = getExportableNodes();
    console.log('Current exportable nodes count:', exportableNodes.length);
    console.log('Current edges count:', edges.length);
    
    try {
      // Use hierarchical layout as default
      const { getLayoutedElements, layoutPresets } = await import('../../components/strategy/utils/pro-layout/elkLayoutUtils');
      const { nodes: arrangedNodes } = await getLayoutedElements(exportableNodes, edges, layoutPresets.hierarchical);
      console.log('Pro arranged nodes count:', arrangedNodes.length);
      
      // Get the single strategy overview node (this will cleanup duplicates and ensure it exists)
      const overviewNode = getStrategyOverviewNode();
      const nodesWithOverview = [...arrangedNodes, overviewNode];
      set({ nodes: nodesWithOverview });
      addHistoryItem(arrangedNodes, edges);
      console.log('Pro auto-arrange completed');
    } catch (error) {
      console.error('Pro auto-arrange failed, falling back to basic:', error);
      // Fallback to basic auto-arrange
      const arrangedNodes = autoArrangeNodes(exportableNodes, edges);
      const overviewNode = getStrategyOverviewNode();
      const nodesWithOverview = [...arrangedNodes, overviewNode];
      set({ nodes: nodesWithOverview });
      addHistoryItem(arrangedNodes, edges);
    }
  },

  // Auto-arrange on node creation
  autoArrangeOnChange: async () => {
    const { getExportableNodes, edges, addHistoryItem, getStrategyOverviewNode } = get();
    const exportableNodes = getExportableNodes();
    
    // Only auto-arrange if we have more than just the start node
    if (exportableNodes.length > 1) {
      try {
        const { getLayoutedElements, layoutPresets } = await import('../../components/strategy/utils/pro-layout/elkLayoutUtils');
        const { nodes: arrangedNodes } = await getLayoutedElements(exportableNodes, edges, layoutPresets.hierarchical);
        const overviewNode = getStrategyOverviewNode();
        const nodesWithOverview = [...arrangedNodes, overviewNode];
        set({ nodes: nodesWithOverview });
        addHistoryItem(arrangedNodes, edges);
      } catch (error) {
        console.error('Auto-arrange on change failed:', error);
      }
    }
  }
}));
