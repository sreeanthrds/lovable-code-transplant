
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, ArrowRightLeft, Bell, DoorOpen, LogIn, LogOut, Play, Power, Zap } from 'lucide-react';

interface ActionNodeContentProps {
  data: {
    label: string;
    actionType: 'entry' | 'exit' | 'alert' | 'modify';
    positions?: any[];
    targetPositionId?: string;
    targetNodeId?: string;
    modifications?: Record<string, any>;
  };
  id: string;
  startNodeSymbol?: string;
  isSymbolMissing?: boolean;
  updateNodeData?: (id: string, data: any) => void;
}

const ActionNodeContent: React.FC<ActionNodeContentProps> = ({ data, id, startNodeSymbol, isSymbolMissing }) => {
  const { label, actionType, positions = [], targetPositionId, targetNodeId } = data;
  
  const getIcon = () => {
    switch (actionType) {
      case 'entry':
        return <LogIn className="h-4 w-4 text-green-500" />;
      case 'exit':
        return <LogOut className="h-4 w-4 text-red-500" />;
      case 'alert':
        return <Bell className="h-4 w-4 text-amber-500" />;
      case 'modify':
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const renderContent = () => {
    switch (actionType) {
      case 'entry':
        return (
          <div className="mt-1">
            {positions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {positions.map((position, index) => (
                  <TooltipProvider key={position.vpi || index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant={position.positionType === 'buy' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {position.positionType === 'buy' ? 'B' : 'S'} {position.lots || 1}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{position.vpi || `Position ${index + 1}`}</p>
                        <p>{position.positionType === 'buy' ? 'Buy' : 'Sell'} {position.lots || 1} lot(s)</p>
                        <p>{position.orderType} order</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No positions defined</div>
            )}
          </div>
        );
        
      case 'exit':
        return (
          <div className="mt-1 text-xs text-muted-foreground">
            Exit positions
          </div>
        );
        
      case 'alert':
        return (
          <div className="mt-1 text-xs text-muted-foreground">
            Send notification
          </div>
        );
        
      case 'modify':
        return (
          <div className="mt-1">
            {targetPositionId ? (
              <Badge variant="secondary" className="text-xs">
                Modify position
              </Badge>
            ) : (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>No position selected</span>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-w-[120px]">
      <div className="flex items-center gap-1.5">
        {getIcon()}
        <div className="font-medium text-sm">{label}</div>
      </div>
      {renderContent()}
    </div>
  );
};

export default ActionNodeContent;
