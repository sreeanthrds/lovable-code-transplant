import React, { useMemo } from 'react';
import { ReactFlowProvider, ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { createReadonlyNodeTypes } from '@/components/strategy/nodes/readonlyNodeTypes';
import { rsiReversalNodes, rsiReversalEdges, rsiReversalStrategyInfo } from './preview/RSIReversalStrategyData';
import { TrendingUp, BarChart3, Clock, Layers } from 'lucide-react';

const RealStrategyPreview = () => {
  // Use readonly node types - no editing capabilities
  const nodeTypes = useMemo(() => createReadonlyNodeTypes(), []);

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Layers className="w-4 h-4" />
            Real Strategy Example
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Trading Ideas Become Executable Programs
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Explore a real RSI Reversal strategy built with our visual programming canvas. 
            Pan, zoom, and interact with the actual nodes - no coding required.
          </p>
        </div>

        {/* Strategy Info Bar */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
            <TrendingUp className="w-4 h-4 text-cyan-500" />
            <span className="text-sm font-medium">{rsiReversalStrategyInfo.name}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">{rsiReversalStrategyInfo.instrument} • {rsiReversalStrategyInfo.exchange}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">{rsiReversalStrategyInfo.nodeCount} Nodes • {rsiReversalStrategyInfo.edgeCount} Connections</span>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-emerald-500/5 to-purple-500/10 rounded-2xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
          
          <div className="relative bg-card/95 backdrop-blur-xl overflow-hidden rounded-2xl shadow-2xl border border-border/50">
            {/* Canvas Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-muted/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="text-sm font-medium text-foreground">Strategy Canvas</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Use mouse to pan • Scroll to zoom • Read-only preview
              </div>
            </div>
            
            {/* ReactFlow Canvas */}
            <div className="h-[550px] w-full bg-gradient-to-br from-background/50 to-muted/30">
              <ReactFlowProvider>
                <ReactFlow
                  nodes={rsiReversalNodes}
                  edges={rsiReversalEdges}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{
                    padding: 0.2,
                    minZoom: 0.3,
                    maxZoom: 1
                  }}
                  minZoom={0.1}
                  maxZoom={1.5}
                  defaultViewport={{ x: 0, y: 0, zoom: 0.4 }}
                  proOptions={{ hideAttribution: true }}
                  className="bg-transparent"
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  panOnDrag={true}
                  zoomOnScroll={true}
                  zoomOnPinch={true}
                  preventScrolling={false}
                >
                  <Background 
                    color="hsl(var(--muted-foreground))" 
                    gap={24} 
                    size={1} 
                    style={{ opacity: 0.15 }}
                  />
                  <Controls 
                    showInteractive={false} 
                    position="bottom-right"
                    className="bg-card/90 border border-border rounded-lg shadow-lg"
                  />
                  <MiniMap 
                    nodeStrokeWidth={3}
                    position="bottom-left"
                    className="bg-card/90 border border-border rounded-lg shadow-lg"
                    maskColor="hsl(var(--muted) / 0.7)"
                    pannable
                    zoomable
                  />
                </ReactFlow>
              </ReactFlowProvider>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 px-6 py-4 border-t border-border/50 bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-cyan-400 to-cyan-600"></div>
                <span className="text-xs text-muted-foreground">Entry Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-red-400 to-red-600"></div>
                <span className="text-xs text-muted-foreground">Exit Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-purple-400 to-purple-600"></div>
                <span className="text-xs text-muted-foreground">Signal Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-amber-400 to-amber-600"></div>
                <span className="text-xs text-muted-foreground">Re-Entry Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-lime-400 to-lime-600"></div>
                <span className="text-xs text-muted-foreground">Square Off</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm">
            This is a fully functional strategy built without writing a single line of code.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RealStrategyPreview;
