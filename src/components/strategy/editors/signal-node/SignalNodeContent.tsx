
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ConditionBuilder from '../condition-builder/ConditionBuilder';
import { GroupCondition } from '../../utils/conditionTypes';
import ReEntryConditionsToggle from './ReEntryConditionsToggle';

interface SignalNodeContentProps {
  conditions: GroupCondition[];
  updateConditions: (condition: GroupCondition) => void;
  exitConditions?: GroupCondition[];
  updateExitConditions?: (condition: GroupCondition) => void;
  conditionContext?: 'entry' | 'exit';
  showTabSelector?: boolean;
  // Re-entry conditions support
  hasReEntryConditions?: boolean;
  reEntryConditions?: GroupCondition[];
  updateReEntryConditions?: (condition: GroupCondition) => void;
  hasReEntryExitConditions?: boolean;
  reEntryExitConditions?: GroupCondition[];
  updateReEntryExitConditions?: (condition: GroupCondition) => void;
  onReEntryToggle?: (enabled: boolean) => void;
  onReEntryExitToggle?: (enabled: boolean) => void;
  onCopyInitialConditions?: () => void;
  onCopyInitialExitConditions?: () => void;
}

const SignalNodeContent: React.FC<SignalNodeContentProps> = ({
  conditions,
  updateConditions,
  exitConditions,
  updateExitConditions,
  conditionContext = 'entry',
  showTabSelector = true,
  hasReEntryConditions,
  reEntryConditions,
  updateReEntryConditions,
  hasReEntryExitConditions,
  reEntryExitConditions,
  updateReEntryExitConditions,
  onReEntryToggle,
  onReEntryExitToggle,
  onCopyInitialConditions,
  onCopyInitialExitConditions,
}) => {
  const [activeTab, setActiveTab] = useState<string>(conditionContext || 'entry');
  
  const handleUpdateConditions = (updatedCondition: GroupCondition) => {
    updateConditions(updatedCondition);
  };
  
  const handleUpdateExitConditions = (updatedCondition: GroupCondition) => {
    if (updateExitConditions) {
      updateExitConditions(updatedCondition);
    }
  };

  const handleUpdateReEntryConditions = (updatedCondition: GroupCondition) => {
    if (updateReEntryConditions) {
      updateReEntryConditions(updatedCondition);
    }
  };

  const handleUpdateReEntryExitConditions = (updatedCondition: GroupCondition) => {
    if (updateReEntryExitConditions) {
      updateReEntryExitConditions(updatedCondition);
    }
  };

  // For single context (entry or exit only), don't show tabs
  if (!showTabSelector) {
    const isEntryContext = conditionContext === 'entry';
    const currentConditions = conditions;
    const currentReEntryConditions = isEntryContext ? reEntryConditions : reEntryExitConditions;
    const hasReEntry = isEntryContext ? hasReEntryConditions : hasReEntryExitConditions;
    const reEntryToggle = isEntryContext ? onReEntryToggle : onReEntryExitToggle;
    const copyFunction = isEntryContext ? onCopyInitialConditions : onCopyInitialExitConditions;
    const updateReEntryFunction = isEntryContext ? handleUpdateReEntryConditions : handleUpdateReEntryExitConditions;

    return (
      <div className="space-y-3">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {conditionContext === 'entry' ? 'Entry Conditions' : 'Exit Conditions'}
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-4 w-4 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="end" className="max-w-sm">
                  {conditionContext === 'entry'
                    ? 'Define conditions that will trigger an entry signal when they are met.'
                    : 'Define conditions that will trigger an exit signal when they are met.'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {conditionContext === 'entry'
              ? 'When these conditions are met, this node will emit an entry signal.'
              : 'When these conditions are met, this node will emit an exit signal.'}
          </p>
        </div>
        
        <ConditionBuilder
          rootCondition={conditions[0] || { id: 'root', groupLogic: 'AND', conditions: [] }}
          updateConditions={handleUpdateConditions}
          context={conditionContext}
        />

        {/* Re-entry conditions toggle and builder */}
        {reEntryToggle && copyFunction && (
          <>
            <ReEntryConditionsToggle
              enabled={hasReEntry || false}
              onToggle={reEntryToggle}
              onCopyFromInitial={copyFunction}
              title={`Re-entry ${conditionContext === 'entry' ? 'Entry' : 'Exit'} Conditions`}
              description={`Define separate conditions for when positions are re-entering via re-entry signals.`}
              infoTooltip={`When enabled, different conditions will be used when this ${conditionContext} is triggered by a re-entry signal instead of initial entry.`}
            />

            {hasReEntry && currentReEntryConditions && updateReEntryFunction && (
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-2">
                  Re-entry {conditionContext === 'entry' ? 'Entry' : 'Exit'} Conditions
                </h4>
                <ConditionBuilder
                  rootCondition={currentReEntryConditions[0] || { id: 'reentry-root', groupLogic: 'AND', conditions: [] }}
                  updateConditions={updateReEntryFunction}
                  context={conditionContext}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // For combined signal node with both entry and exit tabs
  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="entry" className="text-xs">
            Entry Conditions
          </TabsTrigger>
          <TabsTrigger value="exit" className="text-xs">
            Exit Conditions
          </TabsTrigger>
        </TabsList>
        
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Info className="h-4 w-4 text-muted-foreground" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent side="top" align="end" className="max-w-sm">
            <p className="text-sm">
              {activeTab === 'entry'
                ? 'Entry conditions define when your strategy should look for entry opportunities.'
                : 'Exit conditions define when your strategy should exit existing positions.'}
            </p>
          </HoverCardContent>
        </HoverCard>
      </div>

      <TabsContent value="entry" className="space-y-3">
        <p className="text-xs text-gray-400">
          When these conditions are met, this node will emit an entry signal.
        </p>
        <ConditionBuilder
          rootCondition={conditions[0] || { id: 'root', groupLogic: 'AND', conditions: [] }}
          updateConditions={handleUpdateConditions}
          context="entry"
        />

        {/* Re-entry entry conditions */}
        {onReEntryToggle && onCopyInitialConditions && (
          <>
            <ReEntryConditionsToggle
              enabled={hasReEntryConditions || false}
              onToggle={onReEntryToggle}
              onCopyFromInitial={onCopyInitialConditions}
              title="Re-entry Entry Conditions"
              description="Define separate conditions for when positions are re-entering via re-entry signals."
              infoTooltip="When enabled, different conditions will be used when this entry is triggered by a re-entry signal instead of initial entry."
            />

            {hasReEntryConditions && reEntryConditions && updateReEntryConditions && (
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-2">Re-entry Entry Conditions</h4>
                <ConditionBuilder
                  rootCondition={reEntryConditions[0] || { id: 'reentry-entry-root', groupLogic: 'AND', conditions: [] }}
                  updateConditions={handleUpdateReEntryConditions}
                  context="entry"
                />
              </div>
            )}
          </>
        )}
      </TabsContent>
      
      <TabsContent value="exit" className="space-y-3">
        <p className="text-xs text-gray-400">
          When these conditions are met, this node will emit an exit signal.
        </p>
        <ConditionBuilder
          rootCondition={(exitConditions && exitConditions[0]) || { id: 'root', groupLogic: 'AND', conditions: [] }}
          updateConditions={handleUpdateExitConditions}
          context="exit"
        />

        {/* Re-entry exit conditions */}
        {onReEntryExitToggle && onCopyInitialExitConditions && (
          <>
            <ReEntryConditionsToggle
              enabled={hasReEntryExitConditions || false}
              onToggle={onReEntryExitToggle}
              onCopyFromInitial={onCopyInitialExitConditions}
              title="Re-entry Exit Conditions"
              description="Define separate conditions for when positions are exiting via re-entry signals."
              infoTooltip="When enabled, different conditions will be used when this exit is triggered by a re-entry signal."
            />

            {hasReEntryExitConditions && reEntryExitConditions && updateReEntryExitConditions && (
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-2">Re-entry Exit Conditions</h4>
                <ConditionBuilder
                  rootCondition={reEntryExitConditions[0] || { id: 'reentry-exit-root', groupLogic: 'AND', conditions: [] }}
                  updateConditions={handleUpdateReEntryExitConditions}
                  context="exit"
                />
              </div>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default SignalNodeContent;
