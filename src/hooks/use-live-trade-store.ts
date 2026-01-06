import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BrokerConnection {
  id: string;
  brokerName: string;
  customerName: string;
  accountId: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastHeartbeat?: string;
  apiKey?: string;
  apiSecret?: string;
  createdAt: string;
}

export interface LiveStrategy {
  id: string; // This is the unique session ID
  strategyId: string; // Original strategy ID
  name: string;
  description: string;
  addedAt: string;
  connectionId?: string;
  status: 'inactive' | 'starting' | 'active' | 'stopping' | 'stopped' | 'completed';
  isLive: boolean; // Whether the session is started
  error?: string; // Connection or API error specific to this strategy
  backendSessionId?: string; // Session ID returned from backend API
}

export type TradingStatus = 'idle' | 'running' | 'paused';

interface LiveTradeState {
  // Strategies added to live trading
  liveStrategies: LiveStrategy[];
  
  // Broker connections (multiple customers per broker)
  brokerConnections: BrokerConnection[];
  
  // Strategy-to-broker connection mappings
  strategyConnections: Record<string, string>;
  
  // Currently selected connection for new strategies
  selectedConnectionId: string | null;
  
  // User-level trading status (persisted)
  tradingStatus: TradingStatus;
  
  // Actions
  addToLiveTrading: (strategy: { id: string; name: string; description: string }) => void;
  removeFromLiveTrading: (strategyId: string) => void;
  assignConnection: (strategyId: string, connectionId: string) => void;
  updateStrategyStatus: (sessionId: string, status: LiveStrategy['status'], isLive?: boolean, backendSessionId?: string) => void;
  setStrategyError: (sessionId: string, error: string | undefined) => void;
  addBrokerConnection: (connection: Omit<BrokerConnection, 'id' | 'createdAt'>) => void;
  removeBrokerConnection: (connectionId: string) => void;
  updateConnectionStatus: (connectionId: string, status: BrokerConnection['status']) => void;
  setSelectedConnection: (connectionId: string | null) => void;
  isStrategyInLiveTrading: (strategyId: string) => boolean;
  clearAllStrategies: () => void;
  setAllStrategies: (strategies: LiveStrategy[]) => void;
  setTradingStatus: (status: TradingStatus) => void;
}

export const useLiveTradeStore = create<LiveTradeState>()(
  persist(
    (set, get) => ({
      liveStrategies: [],
      brokerConnections: [],
      strategyConnections: {},
      selectedConnectionId: null,
      tradingStatus: 'idle',

      addToLiveTrading: (strategy) => {
        const { liveStrategies, selectedConnectionId } = get();
        
        // Generate secure unique session ID
        const sessionId = crypto.randomUUID();
        
        const newStrategy: LiveStrategy = {
          id: sessionId, // Unique session ID
          strategyId: strategy.id, // Original strategy ID
          name: strategy.name,
          description: strategy.description,
          addedAt: new Date().toISOString(),
          connectionId: selectedConnectionId || undefined,
          status: 'inactive',
          isLive: false
        };
        
        set({
          liveStrategies: [...liveStrategies, newStrategy],
          // Auto-assign selected connection if available
          strategyConnections: selectedConnectionId 
            ? { ...get().strategyConnections, [newStrategy.id]: selectedConnectionId }
            : get().strategyConnections,
        });
      },

      removeFromLiveTrading: (sessionId) => {
        const { liveStrategies, strategyConnections } = get();
        
        // Remove from live strategies
        const updatedStrategies = liveStrategies.filter(s => s.id !== sessionId);
        
        // Remove connection mapping
        const updatedConnections = { ...strategyConnections };
        delete updatedConnections[sessionId];
        
        set({
          liveStrategies: updatedStrategies,
          strategyConnections: updatedConnections
        });
      },

      updateStrategyStatus: (sessionId, status, isLive, backendSessionId) => {
        const { liveStrategies } = get();
        
        const updatedStrategies = liveStrategies.map(strategy =>
          strategy.id === sessionId
            ? { 
                ...strategy, 
                status, 
                isLive: isLive !== undefined ? isLive : strategy.isLive,
                backendSessionId: backendSessionId || strategy.backendSessionId,
                // Clear error when resetting to inactive
                error: status === 'inactive' ? undefined : strategy.error
              }
            : strategy
        );
        
        set({ liveStrategies: updatedStrategies });
      },

      setStrategyError: (sessionId, error) => {
        const { liveStrategies } = get();
        
        const updatedStrategies = liveStrategies.map(strategy =>
          strategy.id === sessionId
            ? { ...strategy, error }
            : strategy
        );
        
        set({ liveStrategies: updatedStrategies });
      },

      assignConnection: (strategyId, connectionId) => {
        const { strategyConnections } = get();
        
        set({
          strategyConnections: {
            ...strategyConnections,
            [strategyId]: connectionId
          }
        });
      },

      addBrokerConnection: (connectionData) => {
        const { brokerConnections } = get();
        
        const newConnection: BrokerConnection = {
          ...connectionData,
          id: `${connectionData.brokerName.toLowerCase()}-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        
        set({
          brokerConnections: [...brokerConnections, newConnection]
        });
      },

      removeBrokerConnection: (connectionId) => {
        const { brokerConnections, strategyConnections } = get();
        
        // Remove connection
        const updatedConnections = brokerConnections.filter(c => c.id !== connectionId);
        
        // Remove any strategy mappings to this connection
        const updatedMappings = Object.fromEntries(
          Object.entries(strategyConnections).filter(([_, connId]) => connId !== connectionId)
        );
        
        set({
          brokerConnections: updatedConnections,
          strategyConnections: updatedMappings
        });
      },

      updateConnectionStatus: (connectionId, status) => {
        const { brokerConnections } = get();
        
        const updatedConnections = brokerConnections.map(conn =>
          conn.id === connectionId
            ? { 
                ...conn, 
                status, 
                lastHeartbeat: status === 'connected' ? new Date().toISOString() : conn.lastHeartbeat 
              }
            : conn
        );
        
        set({ brokerConnections: updatedConnections });
      },

      setSelectedConnection: (connectionId) => {
        set({ selectedConnectionId: connectionId });
      },

      isStrategyInLiveTrading: (strategyId) => {
        const { liveStrategies } = get();
        return liveStrategies.some(s => s.id === strategyId);
      },

      clearAllStrategies: () => {
        set({ liveStrategies: [], strategyConnections: {}, tradingStatus: 'idle' });
      },

      setAllStrategies: (strategies) => {
        set({ liveStrategies: strategies });
      },

      setTradingStatus: (status) => {
        set({ tradingStatus: status });
      }
    }),
    {
      name: 'live-trade-storage', // Storage key in localStorage
    }
  )
);