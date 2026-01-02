
import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';

interface UseForceEndNodeFormProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

interface ForceEndNodeFormData {
  label: string;
  closeAll: boolean;
  message: string;
}

interface ForceEndNodeData {
  label?: string;
  closeAll?: boolean;
  message?: string;
}

export const useForceEndNodeForm = ({ node, updateNodeData }: UseForceEndNodeFormProps) => {
  // Safely cast node.data with default fallback
  const nodeData = (node.data || {}) as ForceEndNodeData;
  
  const [formData, setFormData] = useState<ForceEndNodeFormData>({
    label: nodeData.label || 'Force End',
    closeAll: nodeData.closeAll !== false, // Default to true
    message: nodeData.message || '',
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

  const handleCloseAllChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, closeAll: checked }));
    updateNodeData(node.id, { ...nodeData, closeAll: checked });
  };

  // Update local state if node data changes externally
  useEffect(() => {
    const safeNodeData = (node.data || {}) as ForceEndNodeData;
    setFormData({
      label: safeNodeData.label || 'Force End',
      closeAll: safeNodeData.closeAll !== false,
      message: safeNodeData.message || '',
    });
  }, [node.data]);

  return {
    formData,
    handleLabelChange,
    handleMessageChange,
    handleCloseAllChange,
  };
};
