
import React from 'react';
import { Position } from '../types/position-types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Fixed set of colors for consistent group coloring (duplicated from RetryIcon.tsx)
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

interface PositionCardProps {
  position: Position;
}

const PositionCard: React.FC<PositionCardProps> = ({ position }) => {
  const { vpi, positionType, orderType, limitPrice, quantity, productType, optionDetails, reEntry } = position;
  
  // Get text color for direction
  const directionColor = positionType === 'buy' ? 'text-green-500' : 'text-red-500';
  
  // Get the badge color for re-entry group if applicable
  const getReEntryGroupColor = () => {
    if (!reEntry?.enabled) return '';
    
    const colorIndex = 0; // Simplified - no groups anymore
    const groupColorClass = GROUP_COLORS[colorIndex].split(' ')[0];
    return groupColorClass.replace('bg-', '');
  };
  
  const reEntryGroupColor = getReEntryGroupColor();

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center">
          {positionType === 'buy' ? (
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1.5" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1.5" />
          )}
          <span className="font-medium text-sm">{vpi}</span>
        </div>
        
        {/* Add re-entry badge if applicable */}
        {reEntry?.enabled && (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Badge className={`${reEntryGroupColor} flex items-center gap-1`} variant="outline">
                  <RefreshCcw className="h-3 w-3" />
                  <span>{reEntry.currentReEntryCount || 0}/{reEntry.maxEntries}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="text-xs">
                  <p>Re-Entry Position</p>
                  <p className="text-muted-foreground">Max: {reEntry.maxEntries} entr{reEntry.maxEntries !== 1 ? 'ies' : 'y'}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      
      <CardContent className="py-2">
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className={directionColor + " font-medium"}>{positionType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order:</span>
            <span>{orderType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quantity:</span>
            <span>{quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Product:</span>
            <span>{productType}</span>
          </div>
          {limitPrice && orderType === 'limit' && (
            <div className="flex justify-between col-span-2">
              <span className="text-muted-foreground">Limit Price:</span>
              <span>{limitPrice}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      {optionDetails && (
        <CardFooter className="pt-0 pb-3">
          <div className="w-full rounded-md bg-muted/50 p-1.5 text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-muted-foreground">Option:</span>
              <Badge variant="outline" className="h-5 px-1.5">
                {optionDetails.optionType}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expiry:</span>
                <span>{optionDetails.expiry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Strike:</span>
                <span>{optionDetails.strikeType || optionDetails.strikeValue}</span>
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default PositionCard;
