import React, { useState, useEffect } from 'react';
import LiveStrategiesGrid from './LiveStrategiesGrid';
import BrokerSidebar from './BrokerSidebar';
import { useLiveTradeStore, type LiveStrategy } from '@/hooks/use-live-trade-store';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useLiveSimulationStore } from '@/stores/live-simulation-store';
import { LiveSimulationDashboard } from './simulation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const LiveTradeTab = () => {
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(true);
  const [selectedStrategyForTrades, setSelectedStrategyForTrades] = useState<string | null>(null);
  const { removeFromLiveTrading, liveStrategies, addToLiveTrading } = useLiveTradeStore();
  const { isAuthenticated, user } = useClerkUser();
  const { activeSession, clearActiveSession } = useLiveSimulationStore();

  const handleRemoveFromLiveTrading = (strategyId: string) => {
    removeFromLiveTrading(strategyId);
  };

  const handleBackFromSimulation = () => {
    clearActiveSession();
  };

  const handleViewTrades = (strategyId: string) => {
    console.log('🔍 View Trades clicked for strategy:', strategyId);
    setSelectedStrategyForTrades(strategyId);
  };

  const handleCloseTradesModal = () => {
    setSelectedStrategyForTrades(null);
  };

  // Fetch strategies from backend API and sync to store
  useEffect(() => {
    const fetchStrategies = async () => {
      if (!user?.id) {
        setIsLoadingStrategies(false);
        return;
      }

      try {
        setIsLoadingStrategies(true);
        const response = await fetch(
          `http://localhost:8000/api/live-trading/strategies/${user.id}`,
          { headers: { 'ngrok-skip-browser-warning': 'true' } }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch strategies');
        }

        const data = await response.json();
        console.log('📊 Backend strategies:', data.strategies);
        
        // Get fresh state from store to avoid stale closure
        const currentStrategies = useLiveTradeStore.getState().liveStrategies;
        
        // Sync backend strategies to store - add any missing ones
        data.strategies.forEach((s: any) => {
          const existsInStore = currentStrategies.some(
            ls => ls.strategyId === s.strategy_id || ls.id === s.strategy_id
          );
          
          if (!existsInStore) {
            console.log('➕ Adding missing strategy to store:', s.strategy_id, s.strategy_name);
            addToLiveTrading({
              id: s.strategy_id,
              name: s.strategy_name,
              description: ''
            });
          }
        });
      } catch (error) {
        console.error('Failed to fetch strategies:', error);
      } finally {
        setIsLoadingStrategies(false);
      }
    };

    fetchStrategies();
  }, [user?.id, addToLiveTrading]);

  console.log('LiveTradeTab render:', { 
    isAuthenticated, 
    userId: user?.id,
    activeSession: activeSession?.sessionId,
    timestamp: new Date().toISOString()
  });

  // If there's an active simulation session, show the simulation dashboard
  if (activeSession && activeSession.status === 'running') {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <LiveSimulationDashboard
            sessionId={activeSession.sessionId}
            strategyName={activeSession.strategyName}
            brokerType={activeSession.brokerType}
            simulationDate={activeSession.simulationDate}
            initialSpeedMultiplier={activeSession.speedMultiplier}
            onBack={handleBackFromSimulation}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-transparent border-white/40 dark:border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Live Trading</h1>
              <p className="text-white/70 font-semibold">
                Deploy your strategies for live trading with connected brokers
              </p>
            </div>
          </div>
        </div>

        {/* Live Strategies Content */}
        <div className="flex-1 p-6 overflow-auto">
          {isLoadingStrategies ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white/70">Loading strategies...</div>
            </div>
          ) : (
            <>
              <LiveStrategiesGrid 
                strategies={liveStrategies}
                onRemoveStrategy={handleRemoveFromLiveTrading}
                onViewTrades={handleViewTrades}
              />
              
              {/* Trades Modal */}
              <Dialog open={!!selectedStrategyForTrades} onOpenChange={(open) => !open && handleCloseTradesModal()}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>
                      Trades - {liveStrategies.find(s => s.id === selectedStrategyForTrades)?.name || 'Strategy'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                    <p className="text-muted-foreground text-sm">
                      Trades data will be displayed here from backend API.
                    </p>
                    <p className="text-muted-foreground text-xs mt-2">
                      Strategy ID: {selectedStrategyForTrades}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Broker Sidebar */}
      <BrokerSidebar />
    </div>
  );
};

export default LiveTradeTab;
