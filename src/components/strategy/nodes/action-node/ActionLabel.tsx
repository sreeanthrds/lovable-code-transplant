
import React from 'react';

interface ActionLabelProps {
  label?: string;
  description?: string;
  actionType?: 'entry' | 'exit' | 'alert' | 'modify';
}

const ActionLabel: React.FC<ActionLabelProps> = ({ label, description, actionType }) => {
  // Default values for each action type if label is not provided
  const defaultLabel = () => {
    if (!actionType) return 'Action';
    
    switch (actionType) {
      case 'entry': return 'Entry';
      case 'exit': return 'Exit';
      case 'alert': return 'Alert';
      case 'modify': return 'Modify';
      default: return 'Action';
    }
  };

  // Use provided label or fall back to default
  const nodeLabel = label || defaultLabel();
  
  return (
    <div className="mb-1">
      <div className="font-medium text-sm text-warning">{nodeLabel}</div>
      {description && <div className="text-[10px] text-info/90">{description}</div>}
    </div>
  );
};

export default ActionLabel;
