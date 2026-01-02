
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Position } from '@/components/strategy/types/position-types';

interface PositionDetailsProps {
  position: Position;
  onEditClick?: (position: Position) => void;
}

const PositionDetails: React.FC<PositionDetailsProps> = ({ position, onEditClick }) => {
  if (!position) return null;

  const handleEditClick = () => {
    if (onEditClick) {
      onEditClick(position);
    }
  };

  return (
    <div className="mt-4 border rounded-md p-3">
      <h3 className="font-medium mb-2">Position Details</h3>
      
      <div className="space-y-1 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">ID:</span>
          <span className="text-sm">{position.vpi}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Type:</span>
          <Badge variant={position.positionType === 'buy' ? 'default' : 'destructive'}>
            {position.positionType.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Order:</span>
          <span className="text-sm">{position.orderType}</span>
        </div>
        {position.orderType === 'limit' && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Limit Price:</span>
            <span className="text-sm">{position.limitPrice}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Quantity:</span>
          <span className="text-sm">{position.quantity}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Product:</span>
          <span className="text-sm">{position.productType}</span>
        </div>
        {position.optionDetails && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Expiry:</span>
              <span className="text-sm">{position.optionDetails.expiry}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Strike:</span>
              <span className="text-sm">{position.optionDetails.strikeType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Option:</span>
              <span className="text-sm">{position.optionDetails.optionType}</span>
            </div>
          </>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Source:</span>
          <span className="text-sm">{position.sourceNodeId}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t">
        <Button 
          size="sm" 
          className="w-full flex items-center gap-2"
          onClick={handleEditClick}
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </div>
    </div>
  );
};

export default PositionDetails;
