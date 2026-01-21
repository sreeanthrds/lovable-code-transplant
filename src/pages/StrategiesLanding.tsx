
import React, { useEffect, useState } from 'react';
import { useStrategyManagement } from '@/hooks/use-strategy-management';
import StrategiesHeader from '@/components/strategies/StrategiesHeader';
import StrategiesList from '@/components/strategies/StrategiesList';
import CreateStrategyDialog from '@/components/strategies/CreateStrategyDialog';
import AppLayout from '@/layouts/AppLayout';

const StrategiesLanding = () => {
  const { 
    strategies, 
    isLoading, 
    createStrategy, 
    deleteStrategy, 
    refreshStrategies,
    loadStrategies 
  } = useStrategyManagement();
  
  const [showNameDialog, setShowNameDialog] = useState(false);
  
  // Load strategies on mount
  useEffect(() => {
    console.log('StrategiesLanding mounted, loading strategies...');
    console.log('StrategiesLanding - Current strategies:', strategies);
    console.log('StrategiesLanding - isLoading:', isLoading);
    loadStrategies();
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'strategies' || e.key?.startsWith('strategy_')) {
        console.log('Storage change detected, reloading strategies');
        loadStrategies();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadStrategies]);
  
  const handleCreateStrategy = () => {
    setShowNameDialog(true);
  };

  const handleSubmitStrategyName = async (strategyName: string) => {
    await createStrategy(strategyName);
    setShowNameDialog(false);
  };

  const handleDuplicateStrategy = async (id: string) => {
    console.log('handleDuplicateStrategy called with ID:', id);
    // Add a small delay to ensure the strategy is saved before refreshing
    setTimeout(async () => {
      console.log('Calling refreshStrategies after delay...');
      await refreshStrategies();
      console.log('refreshStrategies completed');
    }, 1000);
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen">
        <div className="container max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div>
                  <h1 className="text-3xl font-semibold text-white/95">
                    Trading Strategies
                  </h1>
                  <p className="text-sm mt-1 font-medium text-white/70">
                    Build, backtest, and deploy sophisticated trading algorithms
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <StrategiesHeader 
              onRefresh={refreshStrategies} 
              onCreateStrategy={handleCreateStrategy} 
            />
            
            <StrategiesList
              strategies={strategies} 
              isLoading={isLoading} 
              onDeleteStrategy={deleteStrategy}
              onDuplicateStrategy={handleDuplicateStrategy}
              onCreateStrategy={handleCreateStrategy}
            />
          </div>

          <CreateStrategyDialog 
            open={showNameDialog}
            onOpenChange={setShowNameDialog}
            onSubmit={handleSubmitStrategyName}
            defaultName="My New Strategy"
            strategies={strategies}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default StrategiesLanding;
