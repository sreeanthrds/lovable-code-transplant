
import { useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { Position } from '../types';

interface UseVpiTagManagementProps {
  validateVpiUniqueness: (vpi: string, currentPositionVpi: string) => boolean;
  handlePositionChange: (positionVpi: string, updates: Partial<Position>) => void;
}

export const useVpiTagManagement = ({
  validateVpiUniqueness,
  handlePositionChange
}: UseVpiTagManagementProps) => {
  // Handler for updating VPI with validation
  const handleVpiChange = useCallback((positionVpi: string, vpi: string) => {
    if (!validateVpiUniqueness(vpi, positionVpi)) {
      toast({
        title: "Duplicate VPI",
        description: "This Virtual Position ID is already in use. Please choose a unique identifier.",
        variant: "destructive"
      });
      return false;
    }
    
    handlePositionChange(positionVpi, { vpi });
    return true;
  }, [validateVpiUniqueness, handlePositionChange]);

  // Handler for updating VPT (Virtual Position Tag)
  const handleVptChange = useCallback((positionVpi: string, vpt: string) => {
    handlePositionChange(positionVpi, { vpt });
    return true;
  }, [handlePositionChange]);

  return {
    handleVpiChange,
    handleVptChange
  };
};
