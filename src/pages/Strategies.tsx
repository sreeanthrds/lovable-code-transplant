import React, { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAppAuth } from '@/contexts/AuthContext';
import { useStrategies } from '@/hooks/useStrategies';
import StrategiesList from '@/components/strategies/StrategiesList';
import CreateStrategyDialog from '@/components/strategies/CreateStrategyDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useStrategyCreation } from '@/hooks/strategy-management/useStrategyCreation';

const StrategiesPage = () => {
  const { userId } = useAppAuth();
  const { strategies, isLoading, deleteStrategy, refreshStrategies } = useStrategies(userId || undefined);
  const { createStrategy } = useStrategyCreation(strategies);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateStrategy = () => {
    setIsDialogOpen(true);
  };

  const handleDialogSubmit = async (name: string) => {
    console.log('🎯 Strategies.tsx - handleDialogSubmit called with:', name);
    const success = await createStrategy(name);
    console.log('📊 Strategies.tsx - createStrategy result:', success);
    if (success) {
      console.log('✅ Strategies.tsx - Closing dialog and refreshing');
      setIsDialogOpen(false);
      refreshStrategies();
    } else {
      console.log('❌ Strategies.tsx - Strategy creation failed, dialog remains open');
    }
  };

  const handleDuplicateStrategy = () => {
    refreshStrategies();
  };

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Strategies</h1>
              <p className="text-muted-foreground font-semibold mt-1">
                Create and manage your trading strategies
              </p>
            </div>
            <Button onClick={handleCreateStrategy} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Strategy
            </Button>
          </div>

          {/* Strategies List */}
          <StrategiesList
            strategies={strategies}
            isLoading={isLoading}
            onDeleteStrategy={deleteStrategy}
            onDuplicateStrategy={handleDuplicateStrategy}
            onCreateStrategy={handleCreateStrategy}
          />

          {/* Create Strategy Dialog */}
          <CreateStrategyDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSubmit={handleDialogSubmit}
            strategies={strategies}
          />
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
};

export default StrategiesPage;
