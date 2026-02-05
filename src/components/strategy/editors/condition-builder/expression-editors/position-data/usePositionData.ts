
import { useState, useMemo } from 'react';
import { Expression, PositionDataExpression } from '../../../../utils/conditionTypes';
import { useStrategyStore } from '@/hooks/use-strategy-store';

export function usePositionData(expression: Expression, updateExpression: (expr: Expression) => void) {
  if (expression.type !== 'position_data') {
    throw new Error('Expression is not of type position_data');
  }

  const positionExpr = expression as PositionDataExpression;
  const nodes = useStrategyStore(state => state.nodes);
  
  // State for position selection
  const [usePositionFilter, setUsePositionFilter] = useState<boolean>(
    positionExpr.vpi && positionExpr.vpi !== '_any'
  );
  
  // Extract position identifiers from all nodes
  const positionIdentifiers = useMemo(() => {
    const positions: Array<{ id: string; label: string }> = [];
    
    nodes.forEach(node => {
      if (node.data?.positions && Array.isArray(node.data.positions)) {
        node.data.positions.forEach((position: any) => {
          if (position.vpi) {
            positions.push({
              id: position.vpi,
              label: position.vpi
            });
          }
        });
      }
    });
    
    return {
      positionOptions: positions
    };
  }, [nodes]);
  
  // Handle position filter change
  const handlePositionFilterChange = (checked: boolean) => {
    setUsePositionFilter(checked);
    
    // Reset position selection when changing filter type
    if (!checked) {
      updateExpression({
        ...positionExpr,
        vpi: '_any'
      });
    }
  };
  
  // Update the position VPI
  const updatePositionVpi = (value: string) => {
    updateExpression({
      ...positionExpr,
      vpi: value
    });
  };
  
  // Update the field
  const updateField = (value: string) => {
    updateExpression({
      ...positionExpr,
      field: value
    });
  };

  return {
    positionExpr,
    positionIdentifiers,
    usePositionFilter,
    handlePositionFilterChange,
    updatePositionVpi,
    updateField
  };
}
