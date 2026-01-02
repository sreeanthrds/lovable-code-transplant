
import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RetryIconProps {
  enabled?: boolean; // Keep for backward compatibility but we'll ignore it
  groupNumber: number;
  maxReEntries: number;
}

// Fixed set of colors for consistent group coloring
const GROUP_COLORS = [
  'bg-purple-500 text-white',     // Group 1
  'bg-blue-500 text-white',       // Group 2
  'bg-green-500 text-white',      // Group 3
  'bg-amber-500 text-white',      // Group 4
  'bg-red-500 text-white',        // Group 5
  'bg-pink-500 text-white',       // Group 6
  'bg-indigo-500 text-white',     // Group 7
  'bg-cyan-500 text-white',       // Group 8
  'bg-emerald-500 text-white',    // Group 9
  'bg-orange-500 text-white',     // Group 10
];

const RetryIcon: React.FC<RetryIconProps> = ({ groupNumber = 1, maxReEntries = 1 }) => {
  // Get color based on group number (ensure it's within the array bounds)
  const colorIndex = ((groupNumber - 1) % GROUP_COLORS.length);
  const groupColor = GROUP_COLORS[colorIndex];
  
  // Extract the background color class for the badge counter
  const bgColorClass = groupColor.split(' ')[0];
  const badgeColorClass = bgColorClass.replace('bg-', 'text-').replace('-500', '-600');
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className={`absolute -left-3 -top-3 ${groupColor} rounded-full p-1.5 border-2 border-background shadow-sm`}>
            <div className="relative">
              <RefreshCcw size={14} />
              <span className={`absolute -top-2 -right-2 bg-white ${badgeColorClass} rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold`}>
                {maxReEntries}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-xs">
            <p>Position Re-Entry</p>
            <p className="text-muted-foreground">Group: {groupNumber} • Max: {maxReEntries}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RetryIcon;
