
import React from 'react';
import { Expression } from '../../../utils/conditions';
import ExpressionWrapperDialog from './ExpressionWrapperDialog';

interface ExpressionPartsDialogProps {
  leftExpression: Expression;
  rightExpression: Expression;
  updateLeft: (expr: Expression) => void;
  updateRight: (expr: Expression) => void;
  required?: boolean;
  showLabels?: boolean;
  currentNodeId?: string;
}

const ExpressionPartsDialog: React.FC<ExpressionPartsDialogProps> = ({
  leftExpression,
  rightExpression,
  updateLeft,
  updateRight,
  required = false,
  showLabels = true,
  currentNodeId
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ExpressionWrapperDialog
        label={showLabels ? "Left Expression" : ""}
        expression={leftExpression}
        updateExpression={updateLeft}
        required={required}
        currentNodeId={currentNodeId}
      />
      
      <ExpressionWrapperDialog
        label={showLabels ? "Right Expression" : ""}
        expression={rightExpression}
        updateExpression={updateRight}
        required={required}
        currentNodeId={currentNodeId}
      />
    </div>
  );
};

export default ExpressionPartsDialog;
