import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { SquareOffNodeData, EndConditions } from './types';

interface UseSquareOffNodeFormProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

interface SquareOffNodeFormData {
  label: string;
  message: string;
  endConditions: EndConditions;
}

export const useSquareOffNodeForm = ({ node, updateNodeData }: UseSquareOffNodeFormProps) => {
  // Safely cast node.data with default fallback
  const nodeData = (node.data || {}) as SquareOffNodeData;
  
  const [formData, setFormData] = useState<SquareOffNodeFormData>({
    label: nodeData.label || 'Square off',
    message: nodeData.message || 'Strategy forcibly stopped - all positions closed',
    endConditions: nodeData.endConditions || {
      timeBasedExit: { enabled: false },
      performanceBasedExit: { enabled: false },
      positionClosure: { orderType: 'market', forceClose: true },
      alertNotification: { enabled: false }
    }
  });

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFormData(prev => ({ ...prev, label: newValue }));
    updateNodeData(node.id, { ...nodeData, label: newValue });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFormData(prev => ({ ...prev, message: newValue }));
    updateNodeData(node.id, { ...nodeData, message: newValue });
  };

  const handleEndConditionsChange = (endConditions: EndConditions) => {
    setFormData(prev => ({ ...prev, endConditions }));
    updateNodeData(node.id, { ...nodeData, endConditions });
  };

  // Update local state if node data changes externally
  useEffect(() => {
    const safeNodeData = (node.data || {}) as SquareOffNodeData;
    setFormData({
      label: safeNodeData.label || 'Square off',
      message: safeNodeData.message || 'Strategy forcibly stopped - all positions closed',
      endConditions: safeNodeData.endConditions || {
        timeBasedExit: { enabled: false },
        performanceBasedExit: { enabled: false },
        positionClosure: { orderType: 'market', forceClose: true },
        alertNotification: { enabled: false }
      }
    });
  }, [node.data]);

  return {
    formData,
    handleLabelChange,
    handleMessageChange,
    handleEndConditionsChange,
  };
};