import React from 'react';
import { ArrowDownUp, Bell, Pencil, X } from 'lucide-react';

interface ActionIconProps {
  icon?: React.ReactNode;
  actionType?: 'entry' | 'exit' | 'alert' | 'modify';
}

const ActionIcon: React.FC<ActionIconProps> = ({ icon, actionType }) => {
  // If a custom icon is provided, use it
  if (icon) {
    return <div className="mb-1 flex items-center node-icon">{icon}</div>;
  }
  
  // Otherwise, use default icon based on action type
  if (!actionType) return null;
  
  let defaultIcon;
  
  switch (actionType) {
    case 'entry':
      defaultIcon = <ArrowDownUp className="h-4 w-4 mr-1.5 node-icon" />;
      break;
    case 'exit':
      defaultIcon = <X className="h-4 w-4 mr-1.5 node-icon" />;
      break;
    case 'alert':
      defaultIcon = <Bell className="h-4 w-4 text-blue-500 mr-1.5 node-icon" />;
      break;
    case 'modify':
      defaultIcon = <Pencil className="h-4 w-4 text-amber-500 mr-1.5 node-icon" />;
      break;
    default:
      return null;
  }
  
  return <div className="mb-1 flex items-center">{defaultIcon}</div>;
};

export default ActionIcon;
