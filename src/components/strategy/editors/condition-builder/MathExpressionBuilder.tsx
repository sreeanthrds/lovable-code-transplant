 import React from 'react';
 import { 
   Expression, 
   MathExpression,
  MathExpressionItem,
  ComplexExpression
 } from '../../utils/conditions';
 import { createConstantExpression } from '../../utils/conditions/factories';
 import { Button } from '@/components/ui/button';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Plus, X } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import SingleExpressionEditor from './SingleExpressionEditor';
 
 interface MathExpressionBuilderProps {
   expression: Expression;
   updateExpression: (expr: Expression) => void;
   required?: boolean;
   currentNodeId?: string;
   currentVariableId?: string;
   restrictToConstant?: boolean;
 }
 
 const MATH_OPERATORS = [
   { value: '+', label: '+' },
   { value: '-', label: '-' },
   { value: '*', label: '×' },
   { value: '/', label: '÷' },
   { value: '%', label: '%' },
   { value: '+%', label: '+%' },
   { value: '-%', label: '-%' },
 ];
 
 // Helper to convert any expression to math expression format
 const toMathExpression = (expr: Expression): MathExpression => {
   if (expr.type === 'math_expression') {
     return expr as MathExpression;
   }
  
  // Convert legacy nested expression format to math expression
  if (expr.type === 'expression') {
    const complexExpr = expr as ComplexExpression;
    if (complexExpr.left && complexExpr.right && complexExpr.operation) {
      return {
        type: 'math_expression',
        items: [
          { expression: complexExpr.left },
          { operator: complexExpr.operation, expression: complexExpr.right }
        ]
      };
    }
  }
  
   // Wrap single expression in math expression format
   return {
     type: 'math_expression',
     items: [{ expression: expr }]
   };
 };
 
 // Helper to convert math expression back to simple expression if only one item
 const fromMathExpression = (mathExpr: MathExpression): Expression => {
   if (mathExpr.items.length === 1) {
     // Return the single expression directly (not wrapped)
     return mathExpr.items[0].expression;
   }
   // Return as math expression
   return mathExpr;
 };
 
 const MathExpressionBuilder: React.FC<MathExpressionBuilderProps> = ({
   expression,
   updateExpression,
   required = false,
   currentNodeId,
   currentVariableId,
   restrictToConstant = false
 }) => {
   // Convert to internal math expression format
   const mathExpr = toMathExpression(expression);
   const items = mathExpr.items || [{ expression: createConstantExpression('number', 0) }];
 
   // Update and emit (converting back if single item)
   const emitUpdate = (newItems: MathExpressionItem[]) => {
     const newMathExpr: MathExpression = { ...mathExpr, items: newItems };
     updateExpression(fromMathExpression(newMathExpr));
   };
 
   // Update a specific expression item
   const updateItem = (index: number, newExpression: Expression) => {
     const newItems = [...items];
     newItems[index] = { ...newItems[index], expression: newExpression };
     emitUpdate(newItems);
   };
 
   // Update the operator for a specific item
   const updateOperator = (index: number, operator: string) => {
     const newItems = [...items];
     newItems[index] = { 
       ...newItems[index], 
       operator: operator as '+' | '-' | '*' | '/' | '%' | '+%' | '-%' 
     };
     emitUpdate(newItems);
   };
 
   // Add a new expression item
   const addItem = () => {
     const newItems: MathExpressionItem[] = [
       ...items,
       {
         operator: '+',
         expression: createConstantExpression('number', 0)
       }
     ];
     emitUpdate(newItems);
   };
 
   // Remove an expression item
   const removeItem = (index: number) => {
     if (items.length <= 1) return; // Keep at least one item
     
     const newItems = [...items];
     newItems.splice(index, 1);
     
     // If we removed the first item, clear the operator from the new first item
     if (index === 0 && newItems.length > 0) {
       newItems[0] = { ...newItems[0], operator: undefined };
     }
     
     emitUpdate(newItems);
   };
 
   // Check if percentage operations are used (for restricting to constant)
   const isPercentageOperation = (index: number) => {
     return items[index]?.operator === '+%' || items[index]?.operator === '-%';
   };
 
   return (
     <div className="space-y-3">
       {/* Expression items */}
       <div className="space-y-3">
         {items.map((item, index) => (
           <div key={index} className={cn(
             "flex items-start gap-2",
             index > 0 && "pt-2"
           )}>
             {/* Operator dropdown (for all items except first) */}
             {index > 0 && (
               <Select
                 value={item.operator || '+'}
                 onValueChange={(value) => updateOperator(index, value)}
               >
                 <SelectTrigger className="w-16 h-10 shrink-0 mt-6">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {MATH_OPERATORS.map((op) => (
                     <SelectItem key={op.value} value={op.value}>
                       {op.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             )}
             
             {/* Single Expression Editor */}
             <div className="flex-1">
               <SingleExpressionEditor
                 expression={item.expression}
                 updateExpression={(expr) => updateItem(index, expr)}
                 currentNodeId={currentNodeId}
                 currentVariableId={currentVariableId}
                 restrictToConstant={restrictToConstant || isPercentageOperation(index)}
               />
             </div>
             
             {/* Delete button (only if more than one item) */}
             {items.length > 1 && (
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => removeItem(index)}
                 className="h-10 w-10 shrink-0 mt-6 text-muted-foreground hover:text-destructive"
               >
                 <X className="h-4 w-4" />
               </Button>
             )}
           </div>
         ))}
       </div>
       
       {/* Add expression button */}
       <Button
         variant="outline"
         size="sm"
         onClick={addItem}
         className="w-full gap-2 border-dashed"
       >
         <Plus className="h-4 w-4" />
         Add Math Expression
       </Button>
     </div>
   );
 };
 
 export default MathExpressionBuilder;