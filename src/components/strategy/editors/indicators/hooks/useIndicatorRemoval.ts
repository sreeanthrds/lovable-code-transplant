
import { useReactFlow } from '@xyflow/react';
import { toast } from "@/hooks/use-toast";
import { UseIndicatorManagementProps } from './types';
import { updateNodesAfterIndicatorRemoval } from './useIndicatorCleanup';
import { handleError } from '../../../utils/errorHandling';

export const useIndicatorRemoval = ({ 
  selectedIndicators, 
  onChange 
}: UseIndicatorManagementProps) => {
  const { getNodes, setNodes } = useReactFlow();
  
  const handleRemoveIndicator = (indicatorName: string) => {
    try {
      // Create a new object without the deleted indicator
      const { [indicatorName]: removed, ...rest } = selectedIndicators;
      
      // Update indicator parameters in start node
      onChange(rest);
      
      // Update any nodes that are using this indicator
      const allNodes = getNodes();
      updateNodesAfterIndicatorRemoval(allNodes, indicatorName, setNodes);
      
      toast({
        title: "Indicator removed",
        description: `Removed ${indicatorName.split('_')[0]} indicator`
      });
    } catch (error) {
      handleError(error, 'handleRemoveIndicator');
      toast({
        title: "Error removing indicator",
        description: "Failed to remove indicator",
        variant: "destructive"
      });
    }
  };

  return {
    handleRemoveIndicator
  };
};
