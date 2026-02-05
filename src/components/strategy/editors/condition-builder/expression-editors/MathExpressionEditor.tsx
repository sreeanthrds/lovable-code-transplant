 import React from 'react';
 import { 
   Expression, 
   MathExpression,
   MathExpressionItem
 } from '../../../utils/conditions';
 import { createConstantExpression } from '../../../utils/conditions/factories';
 import ExpressionEditorDialogTrigger from '../ExpressionEditorDialogTrigger';
 import { Button } from '@/components/ui/button';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Plus, X } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface MathExpressionEditorProps {
   expression: Expression;
   updateExpression: (expr: Expression) => void;
   required?: boolean;
   currentNodeId?: string;
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
 
 const MathExpressionEditor: React.FC<MathExpressionEditorProps> = ({
   expression,
   updateExpression,
   required = false,
   currentNodeId
 }) => {
   if (expression.type !== 'math_expression') {
     return null;
   }
 
   const mathExpr = expression as MathExpression;
   const items = mathExpr.items || [{ expression: createConstantExpression('number', 0) }];
 
   // Update a specific expression item
   const updateItem = (index: number, newExpression: Expression) => {
     const newItems = [...items];
     newItems[index] = { ...newItems[index], expression: newExpression };
     updateExpression({ ...mathExpr, items: newItems });
   };
 
   // Update the operator for a specific item
   const updateOperator = (index: number, operator: string) => {
     const newItems = [...items];
     newItems[index] = { 
       ...newItems[index], 
       operator: operator as '+' | '-' | '*' | '/' | '%' | '+%' | '-%' 
     };
     updateExpression({ ...mathExpr, items: newItems });
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
     updateExpression({ ...mathExpr, items: newItems });
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
     
     updateExpression({ ...mathExpr, items: newItems });
   };
 
   // Check if percentage operations are used (for restricting RHS to constant)
   const isPercentageOperation = (index: number) => {
     return items[index]?.operator === '+%' || items[index]?.operator === '-%';
   };
 
   return (
     <div className={cn(
       "space-y-3 border border-border rounded-md p-4 mt-2 overflow-visible w-full",
      required && items.length === 0 && "border-destructive/50"
     )}>
       {/* Expression items */}
       <div className="space-y-2">
         {items.map((item, index) => (
           <div key={index} className="flex items-center gap-2">
             {/* Operator dropdown (for all items except first) */}
             {index > 0 && (
               <Select
                 value={item.operator || '+'}
                 onValueChange={(value) => updateOperator(index, value)}
               >
                 <SelectTrigger className="w-16 h-10 shrink-0">
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
             
             {/* Expression editor trigger */}
             <div className="flex-1">
               <ExpressionEditorDialogTrigger
                 label={index === 0 ? "Expression" : undefined}
                 expression={item.expression}
                 updateExpression={(expr) => updateItem(index, expr)}
                 required={required}
                 currentNodeId={currentNodeId}
                 restrictToConstant={isPercentageOperation(index)}
               />
             </div>
             
             {/* Delete button (only if more than one item) */}
             {items.length > 1 && (
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => removeItem(index)}
                 className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
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
 
 export default MathExpressionEditor;