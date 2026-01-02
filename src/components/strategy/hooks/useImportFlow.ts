
import { useCallback } from 'react';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { toast } from '@/hooks/use-toast';

export const useImportFlow = () => {
  const { setNodes, setEdges } = useStrategyStore();

  const onImportSuccess = useCallback((nodes: any[], edges: any[]) => {
    try {
      setNodes(nodes);
      setEdges(edges);
      
      toast({
        title: "Strategy imported successfully",
        description: "Your strategy has been loaded into the canvas"
      });
    } catch (error) {
      console.error('Error during import success handling:', error);
      toast({
        title: "Import error",
        description: "There was an issue loading the imported strategy",
        variant: "destructive"
      });
    }
  }, [setNodes, setEdges]);

  return {
    onImportSuccess
  };
};
