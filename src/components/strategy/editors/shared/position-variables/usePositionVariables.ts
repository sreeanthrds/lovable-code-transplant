
import { useState } from 'react';
import { NodeVariable, createDefaultExpression } from '../../../utils/conditions';

interface UsePositionVariablesProps {
  nodeId: string;
  positions: any[];
  variables: NodeVariable[];
  onVariablesChange: (variables: NodeVariable[]) => void;
}

export const usePositionVariables = ({
  nodeId,
  positions,
  variables,
  onVariablesChange
}: UsePositionVariablesProps) => {
  const [editingVariable, setEditingVariable] = useState<string | null>(null);

  const getInstrumentDetailsForPosition = (position: any) => {
    const details = {
      instrumentType: position.optionDetails ? 'options' as const : 
                     position.productType === 'carryForward' ? 'stocks' as const : 'futures' as const,
      positionId: position.vpi,
      vpi: position.vpi,
      vpt: position.vpt || '',
      positionType: position.positionType,
      orderType: position.orderType,
      quantity: position.quantity,
      multiplier: position.multiplier,
      productType: position.productType,
      // Available position data fields for variables
      availableFields: [
        'entryPrice',
        'currentPrice', 
        'quantity',
        'unrealizedPnL',
        'realizedPnL',
        'totalPnL',
        'duration',
        'dayPnL',
        'averagePrice',
        'marketValue',
        'buyValue',
        'sellValue',
        'netQuantity',
        'buyQuantity',
        'sellQuantity',
        'lastTradePrice',
        'closePrice',
        'openPrice',
        'highPrice',
        'lowPrice',
        'changePercent',
        'changeAmount'
      ]
    };

    // Add options-specific details if present
    if (position.optionDetails) {
      return {
        ...details,
        expiry: position.optionDetails.expiry,
        strikeType: position.optionDetails.strikeType,
        strikeValue: position.optionDetails.strikeValue,
        optionType: position.optionDetails.optionType,
        availableFields: [
          ...details.availableFields,
          'intrinsicValue',
          'timeValue',
          'delta',
          'gamma',
          'theta',
          'vega',
          'impliedVolatility',
          'openInterest',
          'volume'
        ]
      };
    }

    return details;
  };

  const addVariable = () => {
    const newVariable: NodeVariable = {
      id: `var-${Date.now()}`,
      name: `variable${variables.length + 1}`,
      expression: createDefaultExpression('constant'),
      nodeId,
      positionContext: positions.length > 0 ? {
        availablePositions: positions.map(pos => ({
          id: pos.vpi,
          vpi: pos.vpi,
          instrumentDetails: getInstrumentDetailsForPosition(pos)
        }))
      } : undefined
    };
    
    onVariablesChange([...variables, newVariable]);
    setEditingVariable(newVariable.id);
  };

  const updateVariable = (variableId: string, updates: Partial<NodeVariable>) => {
    const updatedVariables = variables.map(variable =>
      variable.id === variableId ? { ...variable, ...updates } : variable
    );
    onVariablesChange(updatedVariables);
  };

  const removeVariable = (variableId: string) => {
    const filteredVariables = variables.filter(variable => variable.id !== variableId);
    onVariablesChange(filteredVariables);
    if (editingVariable === variableId) {
      setEditingVariable(null);
    }
  };

  const handlePositionBinding = (variableId: string, vpi: string) => {
    const position = positions.find(p => p.vpi === vpi);
    if (position) {
      updateVariable(variableId, {
        positionBinding: {
          vpi: position.vpi,
          instrumentDetails: getInstrumentDetailsForPosition(position)
        }
      });
    } else {
      // Clear binding
      updateVariable(variableId, {
        positionBinding: undefined
      });
    }
  };

  return {
    editingVariable,
    setEditingVariable,
    addVariable,
    updateVariable,
    removeVariable,
    handlePositionBinding,
    getInstrumentDetailsForPosition
  };
};
