
import React from 'react';
import { 
  Play, 
  AlertTriangle, 
  ArrowRightLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Ban, 
  Pencil,
  RefreshCcw,
  Square
} from 'lucide-react';

// Add retry icon to nodeIcons map
export const getNodeIcon = (type: string): React.ReactNode => {
  switch (type) {
    case 'start':
      return <Play className="h-4 w-4 text-primary" />;
    case 'signal':
      return <AlertTriangle className="h-4 w-4 text-primary" />;
    case 'action':
      return <ArrowRightLeft className="h-4 w-4 text-primary" />;
    case 'entry':
      return <ArrowUpRight className="h-4 w-4 text-primary" />;
    case 'exit':
      return <ArrowDownRight className="h-4 w-4 text-primary" />;
    case 'alert':
      return <AlertTriangle className="h-4 w-4 text-primary" />;
    case 'modify':
      return <Pencil className="h-4 w-4 text-primary" />;
    case 'end':
      return <Ban className="h-4 w-4 text-primary" />;
    case 'forceEnd':
      return <Ban className="h-4 w-4 text-primary" />;
    case 'squareOff':
      return <Square className="h-4 w-4 text-primary" />;
    case 'retry':
      return <RefreshCcw className="h-4 w-4 text-primary" />;
    default:
      return <ArrowRightLeft className="h-4 w-4 text-primary" />;
  }
};
