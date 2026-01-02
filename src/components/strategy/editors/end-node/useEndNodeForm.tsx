
import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';

interface UseEndNodeFormProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

interface EndNodeFormData {
  label: string;
}

interface EndNodeData {
  label?: string;
}

export const useEndNodeForm = ({ node, updateNodeData }: UseEndNodeFormProps) => {
  // Safely cast node.data with default fallback
  const nodeData = (node.data || {}) as EndNodeData;
  
  const [formData, setFormData] = useState<EndNodeFormData>({
    label: nodeData.label || 'End',
  });

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFormData(prev => ({ ...prev, label: newValue }));
    updateNodeData(node.id, { ...nodeData, label: newValue });
  };

  // Update local state if node data changes externally
  useEffect(() => {
    const safeNodeData = (node.data || {}) as EndNodeData;
    setFormData({
      label: safeNodeData.label || 'End',
    });
  }, [node.data]);

  return {
    formData,
    handleLabelChange,
  };
};
