import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ReactFlow, ReactFlowProvider, Controls, Node, Edge, NodeMouseHandler } from '@xyflow/react';
import { createReadonlyNodeTypes } from '@/components/strategy/nodes/readonlyNodeTypes';
import { createEdgeTypes } from '@/components/strategy/edges/edgeTypes';
import ResponsiveFlowLayout from '@/components/strategy/layout/ResponsiveFlowLayout';
import { LiveNodeUpdatesPanel } from './LiveNodeUpdatesPanel';
import { LiveStrategy } from '@/hooks/use-live-trade-store';
import { NodeState } from './StrategyCanvasPanel';
import { Loader2, X, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLiveNodeUpdatesStore } from '@/stores/live-node-updates-store';
import '@xyflow/react/dist/style.css';
import '@/components/strategy/styles/menus.css';
import '@/components/strategy/styles/controls.css';
import './styles/live-node-animations.css';

interface LiveStrategyCanvasProps {
  selectedStrategy: LiveStrategy | null;
  nodes: Node[];
  edges: Edge[];
  nodeStates: Record<string, NodeState>;
  isLoading?: boolean;
  onNodeClick?: (node: Node) => void;
}

export function LiveStrategyCanvas({
  selectedStrategy,
  nodes,
  edges,
  nodeStates,
  isLoading = false,
  onNodeClick: externalOnNodeClick
}: LiveStrategyCanvasProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [arrangedNodes, setArrangedNodes] = useState<Node[]>([]);
  const [arrangedEdges, setArrangedEdges] = useState<Edge[]>([]);
  const [isArranging, setIsArranging] = useState(false);
  const reactFlowInstanceRef = useRef<any>(null);
  const hasArrangedRef = useRef<string | null>(null);
  
  // Historical updates store
  const { storeHistory, setStoreHistory, addUpdates, getUpdatesForNode } = useLiveNodeUpdatesStore();

  // Filter out virtual/overview nodes for display (but keep nodes connected by edges)
  const displayNodes = useMemo(() => {
    return nodes.filter(node => {
      const nodeData = node.data as Record<string, unknown> | undefined;
      if (nodeData?.isVirtual) return false;
      if (nodeData?.isStrategyOverview) return false;
      // Don't filter startNode - it may have edge connections
      return true;
    });
  }, [nodes]);

  // Filter edges to only include those where both source and target nodes exist
  const displayEdges = useMemo(() => {
    const nodeIds = new Set(displayNodes.map(n => n.id));
    return edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  }, [edges, displayNodes]);

  // Track current strategy ID for arrangement
  const currentStrategyIdRef = useRef<string | null>(null);
  
  // Reset and re-arrange when strategy changes
  useEffect(() => {
    const strategyId = selectedStrategy?.strategyId;
    
    // If strategy changed, reset and trigger new arrangement
    if (strategyId !== currentStrategyIdRef.current) {
      currentStrategyIdRef.current = strategyId || null;
      hasArrangedRef.current = null;
      setArrangedNodes([]);
      setArrangedEdges([]);
    }
  }, [selectedStrategy?.strategyId]);

  // Auto-arrange nodes ONCE per strategy using symmetric tree layout
  useEffect(() => {
    const arrangeNodes = async () => {
      const strategyId = selectedStrategy?.strategyId;
      
      // Skip if no nodes or no strategy
      if (displayNodes.length === 0 || !strategyId) {
        return;
      }

      // Skip if already arranged for this strategy
      if (hasArrangedRef.current === strategyId) {
        return;
      }

      // Mark as arranging immediately to prevent duplicate calls
      hasArrangedRef.current = strategyId;
      setIsArranging(true);
      
      // Wait for nodes to be rendered and measured
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Double-check we're still on the same strategy
      if (currentStrategyIdRef.current !== strategyId) {
        setIsArranging(false);
        return;
      }
      
      try {
        const { getLayoutedElements, layoutPresets } = await import('@/components/strategy/utils/pro-layout/elkLayoutUtils');
        
        // Use symmetric tree layout - same as burger menu auto-arrange
        const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
          displayNodes,
          displayEdges,
          layoutPresets.symmetricTree
        );
        
        // Only apply if still on same strategy
        if (currentStrategyIdRef.current === strategyId) {
          setArrangedNodes(layoutedNodes);
          setArrangedEdges(layoutedEdges);
          
          console.log('✅ Auto-arranged nodes with symmetric tree layout:', layoutedNodes.length);
          
          // Fit view and center after arrangement
          setTimeout(() => {
            if (reactFlowInstanceRef.current && currentStrategyIdRef.current === strategyId) {
              reactFlowInstanceRef.current.fitView({
                padding: 0.2,
                includeHiddenNodes: false,
                duration: 800,
                minZoom: 0.3,
                maxZoom: 1.2
              });
              
              // Center the viewport after fitting
              setTimeout(() => {
                if (reactFlowInstanceRef.current && currentStrategyIdRef.current === strategyId) {
                  const nodes = reactFlowInstanceRef.current.getNodes();
                  if (nodes.length > 0) {
                    const bounds = nodes.reduce((acc: any, node: any) => {
                      const nodeWidth = node.measured?.width || node.width || 250;
                      const nodeHeight = node.measured?.height || node.height || 150;
                      
                      return {
                        minX: Math.min(acc.minX, node.position.x),
                        minY: Math.min(acc.minY, node.position.y),
                        maxX: Math.max(acc.maxX, node.position.x + nodeWidth),
                        maxY: Math.max(acc.maxY, node.position.y + nodeHeight)
                      };
                    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
                    
                    const centerX = (bounds.minX + bounds.maxX) / 2;
                    const centerY = (bounds.minY + bounds.maxY) / 2;
                    
                    const viewport = reactFlowInstanceRef.current.getViewport();
                    const container = document.querySelector('.strategy-flow');
                    const containerWidth = container?.clientWidth || window.innerWidth;
                    const containerHeight = container?.clientHeight || window.innerHeight;
                    
                    const x = containerWidth / 2 - centerX * viewport.zoom;
                    const y = containerHeight / 2 - centerY * viewport.zoom;
                    
                    reactFlowInstanceRef.current.setViewport({ x, y, zoom: viewport.zoom }, { duration: 300 });
                  }
                }
              }, 850);
            }
          }, 300);
        }
      } catch (error) {
        console.error('❌ Auto-arrange failed:', error);
        // Fallback to original nodes only if still on same strategy
        if (currentStrategyIdRef.current === strategyId) {
          setArrangedNodes(displayNodes);
          setArrangedEdges(displayEdges);
        }
      } finally {
        if (currentStrategyIdRef.current === strategyId) {
          setIsArranging(false);
        }
      }
    };

    arrangeNodes();
  // Only depend on strategy ID change and node count to prevent unnecessary re-runs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStrategy?.strategyId, displayNodes.length]);

  // Use arranged nodes if available, otherwise fall back to display nodes
  const finalNodes = useMemo(() => {
    return arrangedNodes.length > 0 ? arrangedNodes : displayNodes;
  }, [arrangedNodes, displayNodes]);
  
  const finalEdges = useMemo(() => {
    return arrangedEdges.length > 0 ? arrangedEdges : displayEdges;
  }, [arrangedEdges, displayEdges]);

  // Apply node state styling to arranged nodes with animated borders
  const styledNodes = useMemo(() => {
    return finalNodes.map(node => {
      const state = nodeStates[node.id];
      if (!state) return node;

      let className = '';
      switch (state.status) {
        case 'active':
          className = 'live-node-active';
          break;
        case 'pending':
          className = 'live-node-pending';
          break;
        case 'completed':
          className = 'live-node-completed';
          break;
        case 'error':
          className = 'live-node-error';
          break;
      }

      return {
        ...node,
        className: `${node.className || ''} ${className}`.trim()
      };
    });
  }, [finalNodes, nodeStates]);

  // Create read-only node types (no hover controls)
  const nodeTypes = useMemo(() => createReadonlyNodeTypes(), []);

  const edgeTypes = useMemo(() => createEdgeTypes(), []);

  // Handle node click
  const handleNodeClick: NodeMouseHandler = useCallback((event, node) => {
    setSelectedNode(node);
    setIsPanelOpen(true);
    externalOnNodeClick?.(node);
  }, [externalOnNodeClick]);

  // Close panel
  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedNode(null);
  }, []);

  // Handle init
  const handleInit = useCallback((instance: any) => {
    reactFlowInstanceRef.current = instance;
    
    // Auto fit view on init with delay to ensure nodes are rendered
    setTimeout(() => {
      if (styledNodes.length > 0) {
        instance.fitView({
          padding: 0.15,
          includeHiddenNodes: false,
          minZoom: 0.2,
          maxZoom: 1.5,
          duration: 500
        });
      }
    }, 400);
  }, [styledNodes.length]);

  // Auto fit view when panel state changes
  useEffect(() => {
    if (reactFlowInstanceRef.current && styledNodes.length > 0) {
      setTimeout(() => {
        reactFlowInstanceRef.current?.fitView({
          padding: 0.15,
          minZoom: 0.2,
          maxZoom: 1.5,
          duration: 400
        });
      }, 200);
    }
  }, [isPanelOpen]);

  // Generate mock live updates for demonstration (in real app, this would come from props/websocket)
  const currentUpdates = useMemo(() => {
    if (!selectedNode) return [];
    const state = nodeStates[selectedNode.id];
    if (!state || state.status === 'inactive') return [];
    
    // Generate some mock updates based on node state
    const now = new Date();
    const updates = [];
    
    if (state.status === 'active') {
      updates.push(
        { id: `${selectedNode.id}-1-${Date.now()}`, nodeId: selectedNode.id, timestamp: now.toISOString(), type: 'tick' as const, message: 'Price tick received', value: 45250.50 },
        { id: `${selectedNode.id}-2-${Date.now()}`, nodeId: selectedNode.id, timestamp: new Date(now.getTime() - 5000).toISOString(), type: 'signal' as const, message: 'Condition evaluated: true' },
        { id: `${selectedNode.id}-3-${Date.now()}`, nodeId: selectedNode.id, timestamp: new Date(now.getTime() - 12000).toISOString(), type: 'status' as const, message: 'Node activated' }
      );
    } else if (state.status === 'pending') {
      updates.push(
        { id: `${selectedNode.id}-1-${Date.now()}`, nodeId: selectedNode.id, timestamp: now.toISOString(), type: 'status' as const, message: 'Waiting for trigger condition' },
        { id: `${selectedNode.id}-2-${Date.now()}`, nodeId: selectedNode.id, timestamp: new Date(now.getTime() - 30000).toISOString(), type: 'tick' as const, message: 'Last tick received', value: 45100.25 }
      );
    }
    
    return updates;
  }, [selectedNode, nodeStates]);

  // Store current updates if history is enabled
  useEffect(() => {
    if (storeHistory && currentUpdates.length > 0) {
      addUpdates(currentUpdates);
    }
  }, [storeHistory, currentUpdates, addUpdates]);

  // Get combined updates (historical + current) or just current based on setting
  const mockLiveUpdates = useMemo(() => {
    if (!selectedNode) return [];
    
    if (storeHistory) {
      const historicalUpdates = getUpdatesForNode(selectedNode.id);
      // Merge and dedupe by id, sort by timestamp desc
      const allUpdates = [...historicalUpdates];
      currentUpdates.forEach(update => {
        if (!allUpdates.some(u => u.id === update.id)) {
          allUpdates.push(update);
        }
      });
      return allUpdates.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
    
    return currentUpdates;
  }, [selectedNode, storeHistory, currentUpdates, getUpdatesForNode]);

  // Live updates panel - shows only live updates (no config editor)
  const nodePanelComponent = useMemo(() => {
    if (isPanelOpen && selectedNode) {
      const nodeState = nodeStates[selectedNode.id] || null;
      return (
        <div className="h-full flex flex-col bg-background border-l border-border/30">
          {/* Close button header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
            <span className="text-xs font-medium text-muted-foreground">Node Details</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={closePanel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {/* Live updates panel */}
          <div className="flex-1 overflow-hidden">
            <LiveNodeUpdatesPanel
              node={selectedNode}
              nodeState={nodeState}
              liveUpdates={mockLiveUpdates}
            />
          </div>
        </div>
      );
    }
    return null;
  }, [isPanelOpen, selectedNode, nodeStates, closePanel, mockLiveUpdates]);

  // Count active/pending nodes
  const activeCount = displayNodes.filter(n => nodeStates[n.id]?.status === 'active').length;
  const pendingCount = displayNodes.filter(n => nodeStates[n.id]?.status === 'pending').length;

  if (!selectedStrategy) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-border/30 bg-background/50">
          <h3 className="text-sm font-semibold text-foreground/80">Strategy Canvas</h3>
          <p className="text-xs text-muted-foreground">
            Node flow visualization
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p className="text-sm">Select a session to view strategy flow</p>
        </div>
      </div>
    );
  }

  if (isLoading || isArranging) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-border/30 bg-background/50">
          <h3 className="text-sm font-semibold text-foreground/80">Strategy Canvas</h3>
          <p className="text-xs text-muted-foreground">
            {selectedStrategy.name}
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2 text-sm">
            {isArranging ? 'Arranging nodes...' : 'Loading strategy nodes...'}
          </span>
        </div>
      </div>
    );
  }

  if (displayNodes.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-border/30 bg-background/50">
          <h3 className="text-sm font-semibold text-foreground/80">Strategy Canvas</h3>
          <p className="text-xs text-muted-foreground">
            {selectedStrategy.name}
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p className="text-sm">No nodes available for this strategy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 bg-background/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground/80">Strategy Canvas</h3>
          <p className="text-xs text-muted-foreground">
            Click on nodes to view details • {displayNodes.length} nodes
          </p>
        </div>
        
        {/* Legend, History Toggle & Counts */}
        <div className="flex items-center gap-3 text-xs">
          {/* History toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-muted-foreground" />
                  <Switch
                    id="store-history"
                    checked={storeHistory}
                    onCheckedChange={setStoreHistory}
                    className="h-4 w-7 data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="store-history" className="text-[10px] text-muted-foreground cursor-pointer">
                    History
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {storeHistory ? 'Historical updates stored for this session' : 'Enable to store update history'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="w-px h-4 bg-border/50" />
          
          {activeCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">Active ({activeCount})</span>
            </div>
          )}
          {pendingCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">Pending ({pendingCount})</span>
            </div>
          )}
          {/* Read-only indicator */}
          <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded-full text-[10px] font-medium border border-orange-200 dark:border-orange-700">
            Live View
          </div>
        </div>
      </div>

      {/* Canvas with responsive panel */}
      <div className="flex-1 overflow-hidden">
        <ReactFlowProvider>
          <ResponsiveFlowLayout
            isPanelOpen={isPanelOpen}
            selectedNode={selectedNode}
            onClosePanel={closePanel}
            nodePanelComponent={nodePanelComponent}
          >
            <div className="h-full w-full">
              <ReactFlow
                nodes={styledNodes}
                edges={finalEdges}
                onNodesChange={() => {}} // Read-only
                onEdgesChange={() => {}} // Read-only
                onConnect={() => {}} // Read-only
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onInit={handleInit}
                fitView
                minZoom={0.01}
                maxZoom={10}
                snapToGrid
                snapGrid={[15, 15]}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                proOptions={{ hideAttribution: true }}
                panOnDrag={[0, 1, 2]}
                panOnScroll={true}
                zoomOnScroll={true}
                zoomOnPinch={true}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                className="strategy-flow"
                style={{ width: '100%', height: '100%' }}
                defaultEdgeOptions={{
                  markerEnd: undefined,
                  markerStart: undefined,
                  style: { markerEnd: 'none', markerStart: 'none' }
                }}
              >
                <Controls 
                  showInteractive={false} 
                  showZoom={true}
                  showFitView={true}
                  position="bottom-right"
                  className="!shadow-lg !rounded-xl !border !border-border/30"
                />
              </ReactFlow>
            </div>
          </ResponsiveFlowLayout>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
