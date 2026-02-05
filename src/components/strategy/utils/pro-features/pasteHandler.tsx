import React, { useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { generateIncrementalNodeId, generateIncrementalEdgeId, regenerateAllUniqueIds } from '../nodes/nodeFactory';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PasteHandlerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (parentNodeId: string | null, newNodes: Node[], newEdges: Edge[]) => void;
  clipboardNodes: Node[];
  clipboardEdges: Edge[];
  availableNodes: Node[];
  availableEdges: Edge[];
}

export const PasteHandler: React.FC<PasteHandlerProps> = ({
  isOpen,
  onClose,
  onConfirm,
  clipboardNodes,
  clipboardEdges,
  availableNodes,
  availableEdges,
}) => {
  const [selectedParentId, setSelectedParentId] = useState<string>('');

  const handleConfirm = () => {
    if (!selectedParentId) {
      return;
    }

    const nodeIdMap = new Map<string, string>();
    const PASTE_OFFSET = 200;

    // Get parent node position for relative positioning
    const parentNode = availableNodes.find(n => n.id === selectedParentId);
    const baseX = parentNode ? parentNode.position.x + PASTE_OFFSET : 0;
    const baseY = parentNode ? parentNode.position.y + PASTE_OFFSET : 0;

    // Create new nodes with updated IDs (positions will be handled by auto arrange)
    const newNodes = clipboardNodes.map((node, index) => {
      // Use consistent incremental ID generation
      const newId = generateIncrementalNodeId(availableNodes, node.type || 'default');
      nodeIdMap.set(node.id, newId);
      
      // Regenerate ALL unique IDs in the node data (positions, conditions, indicators, VPIs)
      const updatedData = regenerateAllUniqueIds(node.data, newId);
      
      return {
        ...node,
        id: newId,
        data: updatedData,
        // Keep original relative positions temporarily - auto arrange will fix them
        position: {
          x: node.position.x,
          y: node.position.y,
        },
        selected: true, // Select the new nodes
      };
    });

    // Clone internal edges between pasted nodes
    const clipboardNodeIds = new Set(clipboardNodes.map(n => n.id));
    const internalEdges = clipboardEdges.filter(edge => 
      clipboardNodeIds.has(edge.source) && clipboardNodeIds.has(edge.target)
    );

    const newEdges: Edge[] = [];
    
    // Create internal edges with proper incremental IDs
    internalEdges.forEach((edge) => {
      const newSourceId = nodeIdMap.get(edge.source);
      const newTargetId = nodeIdMap.get(edge.target);
      
      const newEdgeId = generateIncrementalEdgeId([...availableEdges, ...newEdges]);
      
      const newEdge: Edge = {
        ...edge,
        id: newEdgeId,
        source: newSourceId || edge.source,
        target: newTargetId || edge.target,
      };
      newEdges.push(newEdge);
    });

    // Connect nodes to parent - find root nodes (nodes without incoming internal edges)
    // Only look at edges within the copied selection to identify true entry points
    const rootNodeIds = clipboardNodes
      .filter(node => !internalEdges.some(edge => edge.target === node.id))
      .map(node => node.id);
    
    const rootNodes = newNodes.filter(node => {
      const originalId = Array.from(nodeIdMap.entries()).find(([, newId]) => newId === node.id)?.[0];
      return originalId && rootNodeIds.includes(originalId);
     });

    // Connect all root nodes to the parent
    rootNodes.forEach((rootNode) => {
      const connectionEdge: Edge = {
        id: generateIncrementalEdgeId([...availableEdges, ...newEdges]),
        source: selectedParentId,
        target: rootNode.id,
        type: 'default',
      };
      newEdges.push(connectionEdge);
    });

    onConfirm(selectedParentId, newNodes, newEdges);
    onClose();
    setSelectedParentId('');
  };

  const handleCancel = () => {
    onClose();
    setSelectedParentId('');
  };

  // Filter nodes that can be parents (have output handles)
  const validParentNodes = availableNodes.filter(node => 
    node.type !== 'endNode' && node.type !== 'forceEndNode'
  );


  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md z-[9999]">
        <DialogHeader>
          <DialogTitle>Select Parent Node</DialogTitle>
          <DialogDescription>
            Choose a parent node to connect the pasted nodes to. This ensures no nodes are orphaned.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Parent Node</label>
            <Select value={selectedParentId} onValueChange={(value) => {
              setSelectedParentId(value);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a parent node..." />
              </SelectTrigger>
              <SelectContent 
                className="bg-background border border-border shadow-lg z-50 max-h-60 overflow-y-auto"
                position="popper"
                side="bottom"
                align="start"
                sideOffset={4}
                alignOffset={0}
                avoidCollisions={true}
                sticky="always"
              >
                {validParentNodes.map(node => (
                  <SelectItem key={node.id} value={node.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{String(node.data?.label || node.type || 'Unnamed node')}</span>
                      <span className="text-muted-foreground text-xs ml-2">({node.id})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Pasting {clipboardNodes.length} node(s) with {clipboardEdges.length} internal connection(s).
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedParentId}
            >
              Paste & Connect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
