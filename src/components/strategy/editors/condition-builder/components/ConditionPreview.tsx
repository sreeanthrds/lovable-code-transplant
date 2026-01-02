
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GroupCondition, groupConditionToString } from '../../../utils/conditions';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { useTimeframeMigration } from '../../../utils/timeframe-migration/useTimeframeMigration';

interface ConditionPreviewProps {
  rootCondition: GroupCondition;
  contextLabel?: string;
}

const ConditionPreview: React.FC<ConditionPreviewProps> = ({
  rootCondition,
  contextLabel = 'When:'
}) => {
  const strategyStore = useStrategyStore();
  
  // Initialize TimeframeResolver to ensure timeframes are loaded
  useTimeframeMigration();

  const formatCondition = () => {
    try {
      
      // Find the start node to get indicator parameters
      const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
      
      // Basic validation
      if (!rootCondition) {
        console.log('No root condition provided');
        return "No conditions defined";
      }
      
      if (!rootCondition.conditions || !Array.isArray(rootCondition.conditions)) {
        console.log('Invalid conditions array:', rootCondition.conditions);
        return "No conditions defined";
      }
      
      if (rootCondition.conditions.length === 0) {
        console.log('Empty conditions array');
        return "No conditions defined";
      }
      
      // Check if any individual conditions are incomplete
      const hasIncompleteConditions = rootCondition.conditions.some(condition => {
        if ('groupLogic' in condition) {
          // Recursively check nested groups
          return false; // For now, assume nested groups are valid
        } else {
          // Check if basic condition has all required fields
          const lhs = condition.lhs;
          const rhs = condition.rhs;
          const isIncomplete = !lhs || !rhs || !condition.operator || 
                              !lhs.type || !rhs.type;
          
          if (isIncomplete) {
            console.log('Incomplete condition found:', condition);
          }
          
          return isIncomplete;
        }
      });
      
      if (hasIncompleteConditions) {
        return "Incomplete conditions - please fill all fields";
      }
      
      const result = groupConditionToString(rootCondition, startNode?.data);
      return result;
    } catch (error) {
      console.error("Error in condition preview:", error);
      console.error("Root condition:", rootCondition);
      return "Please complete your condition setup";
    }
  };

  const formattedCondition = formatCondition();

  return (
    <Card className="mt-2 bg-muted/30 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">
          Condition Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm font-mono bg-muted/50 p-3 rounded border">
          <span className="text-gray-400 mr-2">{contextLabel}</span>
          <span className={formattedCondition.includes("Error") || formattedCondition.includes("Incomplete") || formattedCondition.includes("Please complete") ? "text-destructive" : ""}>
            {formattedCondition}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConditionPreview;
