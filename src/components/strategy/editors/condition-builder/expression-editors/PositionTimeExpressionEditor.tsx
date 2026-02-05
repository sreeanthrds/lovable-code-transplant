 import React from 'react';
 import { Expression, PositionTimeExpression } from '../../../utils/conditions';
 import { useStrategyStore } from '@/hooks/use-strategy-store';
 import { RadioGroupField } from '../../shared';
 
 interface PositionTimeExpressionEditorProps {
   expression: Expression;
   updateExpression: (expr: Expression) => void;
   required?: boolean;
 }
 
 const PositionTimeExpressionEditor: React.FC<PositionTimeExpressionEditorProps> = ({
   expression,
   updateExpression,
   required = false
 }) => {
   if (expression.type !== 'position_time') {
     return null;
   }
 
   const positionTimeExpr = expression as PositionTimeExpression;
   const nodes = useStrategyStore(state => state.nodes);
 
   // Extract all positions from entry nodes
   const positions = React.useMemo(() => {
     const allPositions: Array<{
       id: string;
       vpi: string;
       vpt?: string;
     }> = [];
 
     nodes.forEach(node => {
       if (node.type === 'entryNode' && Array.isArray(node.data?.positions)) {
         node.data.positions.forEach((position: any) => {
           if (position.vpi) {
             allPositions.push({
               id: position.vpi,
               vpi: position.vpi,
               vpt: position.vpt
             });
           }
         });
       }
     });
 
     return allPositions;
   }, [nodes]);
 
   const positionOptions = positions.map(pos => ({
     value: pos.vpi,
     label: pos.vpt ? `${pos.vpi} (${pos.vpt})` : pos.vpi
   }));
 
   const timeFieldOptions = [
     { value: 'entryTime', label: 'Entry Time' },
     { value: 'exitTime', label: 'Exit Time' }
   ];
 
   const updateTimeField = (value: string) => {
     updateExpression({
       ...positionTimeExpr,
       timeField: value as 'entryTime' | 'exitTime'
     });
   };
 
   const updateVpi = (value: string) => {
     updateExpression({
       ...positionTimeExpr,
       vpi: value
     });
   };
 
   if (positions.length === 0) {
     return (
       <div className="text-center py-4 text-muted-foreground">
         <p>No positions available. Add positions in an Entry node first.</p>
       </div>
     );
   }
 
   return (
     <div className="space-y-3">
       {/* Position Selection */}
       <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30">
         <RadioGroupField
           label="Position"
           value={positionTimeExpr.vpi || ''}
           onChange={updateVpi}
           options={positionOptions}
           layout="horizontal"
           required={required}
         />
       </div>
 
       {/* Time Field Selection */}
       {positionTimeExpr.vpi && (
         <div className="p-3 border border-purple-200 rounded-lg bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30">
           <RadioGroupField
             label="Time Field"
             value={positionTimeExpr.timeField || 'entryTime'}
             onChange={updateTimeField}
             options={timeFieldOptions}
             layout="horizontal"
             required={required}
           />
         </div>
       )}
     </div>
   );
 };
 
 export default PositionTimeExpressionEditor;