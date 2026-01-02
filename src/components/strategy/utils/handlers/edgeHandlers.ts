
import { Edge, Node } from '@xyflow/react';
import { toast } from "@/hooks/use-toast";
import { handleError } from "../errorHandling";

/**
 * Creates a handler function for deleting edges
 */
export const createDeleteEdgeHandler = (
  edges: Edge[],
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void,
  strategyStore: any,
  nodes: Node[]
) => {
  return (edgeId: string) => {
    try {
      // Find the edge to be deleted for logging purposes
      const edgeToDelete = edges.find(edge => edge.id === edgeId);
      console.log(`Deleting edge ${edgeId}`, edgeToDelete);
      
      // Filter out the edge with the given id
      const newEdges = edges.filter(edge => edge.id !== edgeId);
      
      // Update local state
      setEdges(newEdges);
      
      // Update store
      if (strategyStore) {
        strategyStore.setEdges(newEdges);
        strategyStore.addHistoryItem(nodes, newEdges);
      }
      
      // Notify user
      toast({
        title: "Edge deleted",
        description: "Connection has been removed"
      });
    } catch (error) {
      handleError(error, "Edge deletion");
    }
  };
};

/**
 * Creates a handler function for adding edges
 */
export const createAddEdgeHandler = (
  edges: Edge[],
  setEdges: (edges: Edge[]) => void,
  strategyStore: any,
  nodes: Node[]
) => {
  return (newEdge: Edge) => {
    try {
      // Add the new edge to the existing edges
      const updatedEdges = [...edges, newEdge];
      
      // Update local state
      setEdges(updatedEdges);
      
      // Update store
      if (strategyStore) {
        strategyStore.setEdges(updatedEdges);
        strategyStore.addHistoryItem(nodes, updatedEdges);
      }
      
      // Notify user
      toast({
        title: "Edge added",
        description: "New connection created"
      });
    } catch (error) {
      handleError(error, "Edge addition");
    }
  };
};
