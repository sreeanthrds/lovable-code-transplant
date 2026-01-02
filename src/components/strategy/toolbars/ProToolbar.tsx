import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Scissors, 
  Clipboard, 
  RotateCcw, 
  RotateCw, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Grid3X3,
  Layers,
  Zap,
  Menu
} from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useProMultiSelection } from '../utils/pro-features/multiSelection';
import { useProKeyboardShortcuts, cloneNodes, NodeClipboard } from '../utils/pro-features/keyboardShortcuts';
import { getLayoutedElements, layoutPresets } from '../utils/pro-layout/elkLayoutUtils';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { PasteHandler } from '../utils/pro-features/pasteHandler';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ProToolbar: React.FC = () => {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const { addHistoryItem, undo, redo } = useStrategyStore();
  const clipboard = NodeClipboard.getInstance();
  const [isLayouting, setIsLayouting] = useState(false);
  const [isPasteDialogOpen, setIsPasteDialogOpen] = useState(false);
  
  const {
    getSelectedNodes,
    selectAll,
    deselectAll,
  } = useProMultiSelection();

  const handleClone = useCallback(async (selectedNodes = getSelectedNodes()) => {
    if (selectedNodes.length === 0) return;
    
    console.log('🔄 Starting clone operation for', selectedNodes.length, 'nodes');
    const { newNodes, newEdges } = cloneNodes(getNodes(), getEdges(), selectedNodes);
    
    console.log('📦 Clone completed, triggering auto-arrange immediately');
    
    try {
      const { getLayoutedElements, layoutPresets } = await import('../utils/pro-layout/elkLayoutUtils');
      const { nodes: arrangedNodes, edges: arrangedEdges } = await getLayoutedElements(
        newNodes, 
        newEdges, 
        layoutPresets.symmetricTree
      );
      
      console.log('✅ Auto-arrange completed, updating state');
      setNodes(arrangedNodes);
      setEdges(arrangedEdges);
      addHistoryItem(arrangedNodes, arrangedEdges);
      
    } catch (error) {
      console.error('❌ Auto-arrange failed, using default positions:', error);
      setNodes(newNodes);
      setEdges(newEdges);
      addHistoryItem(newNodes, newEdges);
    }
  }, [getNodes, getEdges, setNodes, setEdges, addHistoryItem, getSelectedNodes]);

  const handleDeleteSelected = useCallback(() => {
    const selectedNodes = getSelectedNodes();
    if (selectedNodes.length === 0) return;

    const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
    const newNodes = getNodes().filter(node => !selectedNodeIds.has(node.id));
    const newEdges = getEdges().filter(edge => 
      !selectedNodeIds.has(edge.source) && !selectedNodeIds.has(edge.target)
    );
    
    setNodes(newNodes);
    setEdges(newEdges);
    addHistoryItem(newNodes, newEdges);
  }, [getNodes, getEdges, setNodes, setEdges, addHistoryItem, getSelectedNodes]);

  const handleCopy = useCallback((selectedNodes = getSelectedNodes()) => {
    if (selectedNodes.length === 0) return;
    clipboard.copy(getNodes(), getEdges(), selectedNodes);
  }, [getNodes, getEdges, getSelectedNodes]);

  const handlePaste = useCallback(() => {
    if (!clipboard.hasData()) return;
    
    // Open dialog to select parent
    setIsPasteDialogOpen(true);
  }, []);

  const handlePasteConfirm = useCallback(async (parentNodeId: string | null, newNodes: any[], newEdges: any[]) => {
    console.log('🍝 Paste confirm called - preparing to paste and auto-arrange');
    
    // Deselect all current nodes
    const updatedCurrentNodes = getNodes().map(node => ({ ...node, selected: false }));
    const allNodes = [...updatedCurrentNodes, ...newNodes];
    const allEdges = [...getEdges(), ...newEdges];
    
    console.log('📊 Paste stats - Total nodes after paste:', allNodes.length, 'Total edges:', allEdges.length);
    
    // Update ReactFlow state
    setNodes(allNodes);
    setEdges(allEdges);
    
    // Update strategy store to ensure persistence
    const strategyStore = useStrategyStore.getState();
    strategyStore.setNodes(allNodes);
    strategyStore.setEdges(allEdges);
    strategyStore.addHistoryItem(allNodes, allEdges);
    
    // Auto-arrange after paste with delay to ensure state is updated
    setTimeout(async () => {
      console.log('🔄 Starting auto-arrange after paste operation');
      try {
        const { getLayoutedElements, layoutPresets } = await import('../utils/pro-layout/elkLayoutUtils');
        console.log('📦 ELK layout utilities imported for paste auto-arrange');
        
        const { nodes: arrangedNodes, edges: arrangedEdges } = await getLayoutedElements(
          allNodes, 
          allEdges, 
          layoutPresets.symmetricTree
        );
        
        console.log('✅ Auto-layout applied after paste, updating nodes:', arrangedNodes.length);
        
        // Update with arranged nodes
        setNodes(arrangedNodes);
        setEdges(arrangedEdges);
        
        // Update strategy store to ensure persistence
        const strategyStore = useStrategyStore.getState();
        strategyStore.setNodes(arrangedNodes);
        strategyStore.setEdges(arrangedEdges);
        strategyStore.addHistoryItem(arrangedNodes, arrangedEdges);
        
        console.log('🎯 Auto-arrange after paste completed successfully');
      } catch (error) {
        console.error('❌ Auto-arrange after paste failed:', error);
      }
    }, 500);
  }, [getNodes, getEdges, setNodes, setEdges, addHistoryItem]);

  const handleUndo = useCallback(async () => {
    const state = useStrategyStore.getState();
    if (state.historyIndex > 0) {
      undo();
      // Update React Flow with the undone state
      const newState = useStrategyStore.getState();
      setNodes(newState.nodes);
      setEdges(newState.edges);
      
    }
  }, [undo, setNodes, setEdges, addHistoryItem]);

  const handleRedo = useCallback(async () => {
    const state = useStrategyStore.getState();
    if (state.historyIndex < state.history.length - 1) {
      redo();
      // Update React Flow with the redone state
      const newState = useStrategyStore.getState();
      setNodes(newState.nodes);
      setEdges(newState.edges);
      
    }
  }, [redo, setNodes, setEdges, addHistoryItem]);

  // Set up Pro keyboard shortcuts
  useProKeyboardShortcuts({
    onClone: handleClone,
    onDeleteSelected: handleDeleteSelected,
    onSelectAll: selectAll,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onCopy: handleCopy,
    onPaste: handlePaste,
  });

  const handleProLayout = useCallback(async (layoutType: keyof typeof layoutPresets) => {
    setIsLayouting(true);
    try {
      const { nodes, edges } = await getLayoutedElements(
        getNodes(),
        getEdges(),
        layoutPresets[layoutType]
      );
      
      setNodes(nodes);
      setEdges(edges);
      addHistoryItem(nodes, edges);
    } catch (error) {
      console.error('Pro layout failed:', error);
    } finally {
      setIsLayouting(false);
    }
  }, [getNodes, getEdges, setNodes, setEdges, addHistoryItem]);

  const selectedNodes = getSelectedNodes();
  const hasSelection = selectedNodes.length > 0;

  return (
    <>
      <PasteHandler
        isOpen={isPasteDialogOpen}
        onClose={() => setIsPasteDialogOpen(false)}
        onConfirm={handlePasteConfirm}
        clipboardNodes={clipboard.hasData() ? (clipboard as any).clipboardData?.nodes || [] : []}
        clipboardEdges={clipboard.hasData() ? (clipboard as any).clipboardData?.edges || [] : []}
        availableNodes={getNodes()}
        availableEdges={getEdges()}
      />
    </>
  )
};

export default ProToolbar;