import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Position } from '@/components/strategy/types/position-types';
import { useReactFlow } from '@xyflow/react';

interface ActionDetailsProps {
  positions?: Position[];
  actionType?: 'entry' | 'exit' | 'alert' | 'modify';
  nodeId: string;
  startNodeSymbol?: string;
  targetPositionId?: string;
  targetNodeId?: string;
  modifications?: Record<string, any>;
}

const ActionDetails: React.FC<ActionDetailsProps> = ({ 
  positions = [], 
  actionType,
  nodeId,
  startNodeSymbol,
  targetPositionId,
  targetNodeId
}) => {
  const { getNodes } = useReactFlow();
  
  // Memoize the options trading check to prevent unnecessary recalculations
  const isOptionsTrading = useMemo(() => {
    const nodes = getNodes();
    const startNode = nodes.find(node => node.type === 'startNode');
    if (startNode?.data && typeof startNode.data === 'object') {
      const data = startNode.data as any;
      // Check tradingInstrumentConfig first (for MCX and new structure)
      if (data.tradingInstrumentConfig?.type === 'options') {
        return true;
      }
      // Fallback to tradingInstrument for backward compatibility (NSE)
      if (data.tradingInstrument?.type === 'options') {
        return true;
      }
    }
    return false;
  }, [getNodes]);

  // Memoize the positions with their option details to ensure proper reactivity
  const processedPositions = useMemo(() => {
    return positions.map(position => {
      // Check for valid option details structure (not corrupted)
      const hasValidOptionDetails = position.optionDetails && 
        typeof position.optionDetails === 'object' &&
        !(position.optionDetails as any)._type && // No corruption marker
        !(position.optionDetails as any).value && // No corruption marker  
        position.optionDetails.expiry &&
        position.optionDetails.strikeType &&
        position.optionDetails.optionType;
      
      return {
        ...position,
        hasValidOptionDetails: Boolean(hasValidOptionDetails)
      };
    });
  }, [positions]);

  const renderEntryDetails = () => {
    if (processedPositions.length === 0) {
      return <div className="text-xs text-muted-foreground">No positions defined</div>;
    }

    return (
      <div className="mt-1">
        {processedPositions.map((position, index) => {
          return (
            <TooltipProvider key={position.vpi || index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col gap-1 mb-2">
                    {/* Main position info */}
                    <div className="flex flex-wrap gap-1">
                      <Badge 
                        variant={position.positionType === 'buy' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {position.positionType === 'buy' ? 'B' : 'S'} {position.quantity || 1}
                      </Badge>
                    </div>
                    
                    {/* Option details - show only when options trading is enabled AND position has valid option details */}
                    {isOptionsTrading && position.hasValidOptionDetails && (
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                          {position.optionDetails!.expiry}
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                          {position.optionDetails!.strikeType}
                          {position.optionDetails!.strikeType === 'premium' && position.optionDetails!.strikeValue 
                            ? ` ${position.optionDetails!.strikeValue}` 
                            : ''}
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                          {position.optionDetails!.optionType}
                        </Badge>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p><strong>VPI:</strong> {position.vpi}</p>
                    <p><strong>Type:</strong> {position.positionType === 'buy' ? 'Buy' : 'Sell'} {position.quantity || 1} unit(s)</p>
                    <p><strong>Order:</strong> {position.orderType || 'market'}</p>
                    {position.limitPrice && (
                      <p><strong>Limit Price:</strong> {position.limitPrice}</p>
                    )}
                    <p><strong>Product:</strong> {position.productType || 'intraday'}</p>
                    {isOptionsTrading && position.hasValidOptionDetails && (
                      <>
                        <p><strong>Expiry:</strong> {position.optionDetails!.expiry}</p>
                        <p><strong>Strike:</strong> {position.optionDetails!.strikeType}
                          {position.optionDetails!.strikeType === 'premium' && position.optionDetails!.strikeValue 
                            ? ` (${position.optionDetails!.strikeValue})` 
                            : ''}
                        </p>
                        <p><strong>Option:</strong> {position.optionDetails!.optionType}</p>
                      </>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  };

  const renderExitDetails = () => {
    return (
      <div className="mt-1 text-xs text-muted-foreground">
        Exit positions
      </div>
    );
  };

  const renderAlertDetails = () => {
    return (
      <div className="mt-1 text-xs text-muted-foreground">
        Send notification
      </div>
    );
  };

  const renderModifyDetails = () => {
    return (
      <div className="mt-1">
        {targetPositionId ? (
          <Badge variant="secondary" className="text-xs">
            Modify position
          </Badge>
        ) : (
          <div className="text-xs text-muted-foreground">
            No position selected
          </div>
        )}
      </div>
    );
  };

  switch (actionType) {
    case 'entry':
      return renderEntryDetails();
    case 'exit':
      return renderExitDetails();
    case 'alert':
      return renderAlertDetails();
    case 'modify':
      return renderModifyDetails();
    default:
      return null;
  }
};

export default ActionDetails;
