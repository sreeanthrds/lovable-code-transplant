import React, { useMemo } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrphanNodeValidatorProps {
  nodes: Node[];
  edges: Edge[];
}

const OrphanNodeValidator: React.FC<OrphanNodeValidatorProps> = ({ nodes, edges }) => {
  const { setNodes } = useReactFlow();
  
  const orphanedNodes = useMemo(() => {
    return nodes.filter(node => {
      // Start nodes are allowed to have no parent
      if (node.type === 'startNode') {
        return false;
      }
      
      // Virtual nodes (like Strategy Overview) are allowed to have no parent
      if (node.data?.isVirtual) {
        return false;
      }
      
      // Check if node has any incoming edges (parent)
      const hasParent = edges.some(edge => edge.target === node.id);
      return !hasParent;
    });
  }, [nodes, edges]);

  // Apply error styling to orphaned nodes
  React.useEffect(() => {
    const orphanedNodeIds = new Set(orphanedNodes.map(n => n.id));
    const multipleStartNodeIds = new Set(
      nodes.filter(node => node.type === 'startNode').slice(1).map(n => n.id)
    );
    
    setNodes((currentNodes) => 
      currentNodes.map(node => ({
        ...node,
        className: orphanedNodeIds.has(node.id) || multipleStartNodeIds.has(node.id) 
          ? 'error-node' 
          : node.className?.replace('error-node', '').trim() || undefined
      }))
    );
  }, [orphanedNodes, nodes, setNodes]);

  const multipleStartNodes = useMemo(() => {
    const startNodes = nodes.filter(node => node.type === 'startNode');
    return startNodes.length > 1 ? startNodes : [];
  }, [nodes]);

  if (orphanedNodes.length === 0 && multipleStartNodes.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-16 right-4 z-50 w-80 space-y-2">
      {orphanedNodes.length > 0 && (
        <Alert variant="destructive" className="bg-red-50/90 dark:bg-red-950/90 backdrop-blur-xl border-red-200 dark:border-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">Orphaned Nodes Found</div>
            <div className="text-sm text-red-700 dark:text-red-300">
              {orphanedNodes.length} node(s) without parent connections:
              <ul className="mt-1 list-disc list-inside">
                {orphanedNodes.map(node => (
                  <li key={node.id} className="truncate">
                    {String(node.data?.label || node.type || 'Unnamed node')}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {multipleStartNodes.length > 0 && (
        <Alert variant="destructive" className="bg-red-50/90 dark:bg-red-950/90 backdrop-blur-xl border-red-200 dark:border-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">Multiple Start Nodes</div>
            <div className="text-sm text-red-700 dark:text-red-300">
              Only one start node is allowed per strategy. Found {multipleStartNodes.length} start nodes.
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default OrphanNodeValidator;