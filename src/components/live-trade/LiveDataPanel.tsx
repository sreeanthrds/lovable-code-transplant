import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEffect, useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus, Maximize2, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { tradelayoutClient as supabase } from "@/lib/supabase/tradelayout-client";
import BrokerConnectionSettingsDialog from "./BrokerConnectionSettingsDialog";
import ClickHouseConnectionDialog from "./simulation/ClickHouseConnectionDialog";

interface LiveDataPanelProps {
  sessionTicks: Record<string, any>;
  brokerConnections: Array<any>;
  strategies: Array<any>;
  mode?: 'live' | 'backtest';
  isExpanded?: boolean;
  onExpandToggle?: () => void;
}

export const LiveDataPanel = ({ sessionTicks, brokerConnections, strategies, mode = 'live', isExpanded = false, onExpandToggle }: LiveDataPanelProps) => {
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [expandedLTP, setExpandedLTP] = useState<Record<string, boolean>>({});
  const [expandedPositions, setExpandedPositions] = useState<Record<string, boolean>>({});
  const [deletingBrokerId, setDeletingBrokerId] = useState<string | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [showClickHouseDialog, setShowClickHouseDialog] = useState(false);
  const [editingBroker, setEditingBroker] = useState<any>(null);
  const [selectedBrokerType, setSelectedBrokerType] = useState<any>(null);
  const { toast } = useToast();
  
  const handleDeleteBroker = async (brokerId: string, brokerName: string) => {
    if (!confirm(`Are you sure you want to delete "${brokerName}"?`)) {
      return;
    }
    
    setDeletingBrokerId(brokerId);
    try {
      const { error } = await (supabase as any)
        .from('broker_connections')
        .delete()
        .eq('id', brokerId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Broker "${brokerName}" deleted successfully`,
      });
    } catch (error) {
      console.error('Failed to delete broker:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete broker connection',
        variant: 'destructive',
      });
    } finally {
      setDeletingBrokerId(null);
    }
  };

  // Compute aggregated data with useMemo to track dependencies properly
  const aggregatedData = useMemo(() => {
    console.log('[LiveDataPanel] Computing aggregated data - mode:', mode, 'sessionTicks keys:', Object.keys(sessionTicks));
    
    const sessionData: Record<string, any> = {};
    let totalPnL = 0;
    let totalRealized = 0;
    let totalUnrealized = 0;
    let totalClosedTrades = 0;
    let totalOpenPositions = 0;
    let totalLTPSymbols = 0;
    
    Object.entries(sessionTicks).forEach(([keyId, tickData]) => {
      // In backtest mode, keyId is strategy_id; in live mode, keyId is session_id
      const strategy = mode === 'backtest' 
        ? strategies.find(s => s.strategyId === keyId)
        : strategies.find(s => s.backendSessionId === keyId);
      
      const ltpStore = tickData?.tickState?.ltp_store || {};
      // Support both formats: open_positions (array) or positions (object)
      const positionsData = tickData?.tickState?.positions || tickData?.tickState?.open_positions || {};
      // Show ALL positions (both OPEN and CLOSED) - no filtering
      const positions = Array.isArray(positionsData) 
        ? positionsData 
        : Object.values(positionsData);
      const pnlSummary = tickData?.tickState?.pnl_summary;
      
      console.log(`[LiveDataPanel] ${mode === 'backtest' ? 'Strategy' : 'Session'} ${keyId.slice(0, 20)}: LTP=${Object.keys(ltpStore).length}, Positions=${positions.length}`);
      
      const strategyName = strategy?.name || keyId.slice(0, 20);
      const broker = brokerConnections.find(b => b.id === strategy?.connectionId);
      const brokerName = broker?.connection_name || (mode === 'backtest' ? 'Backtest' : 'Unknown');
      
      // Aggregate P&L
      if (pnlSummary) {
        totalPnL += parseFloat(pnlSummary.total_pnl || 0);
        totalRealized += parseFloat(pnlSummary.realized_pnl || 0);
        totalUnrealized += parseFloat(pnlSummary.unrealized_pnl || 0);
        totalClosedTrades += parseInt(pnlSummary.closed_trades || 0);
      }
      totalOpenPositions += positions.length;
      totalLTPSymbols += Object.keys(ltpStore).length;
      
      sessionData[keyId] = {
        strategyName,
        brokerName,
        ltpStore,
        positions,
        pnlSummary
      };
    });
    
    return {
      sessionData,
      totalPnL,
      totalRealized,
      totalUnrealized,
      totalClosedTrades,
      totalOpenPositions,
      totalLTPSymbols
    };
  }, [sessionTicks, strategies, brokerConnections, mode]);
  
  const { sessionData, totalPnL, totalRealized, totalUnrealized, totalClosedTrades, totalOpenPositions, totalLTPSymbols } = aggregatedData;

  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString());
    // Auto-expand first strategy
    const sessions = Object.keys(sessionData);
    if (sessions.length > 0 && !expandedLTP[sessions[0]]) {
      setExpandedLTP({ [sessions[0]]: true });
      setExpandedPositions({ [sessions[0]]: true });
    }
  }, [sessionTicks]);

  // Dynamic width based on expanded state
  const panelWidth = isExpanded ? 'w-[50vw]' : 'w-[30vw] min-w-[384px]';

  return (
    <div className={`${panelWidth} border-l bg-background flex flex-col h-full transition-all duration-300`}>
      <Tabs defaultValue="pnl" className="h-full flex flex-col">
        <div className="border-b px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Live Data Monitor</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {lastUpdate}
              </Badge>
              {onExpandToggle && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onExpandToggle}
                  title={isExpanded ? 'Collapse panel' : 'Expand panel'}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pnl">
              P&L
            </TabsTrigger>
            <TabsTrigger value="ltp">
              LTP
              <Badge variant="secondary" className="ml-1 text-xs">
                {totalLTPSymbols}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="positions">
              Positions
              <Badge variant="secondary" className="ml-1 text-xs">
                {totalOpenPositions}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="brokers">
              Brokers
              <Badge variant="secondary" className="ml-1 text-xs">
                {brokerConnections.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Overall P&L Tab */}
          <TabsContent value="pnl" className="h-full m-0 p-0">
            <div className="h-full overflow-y-auto p-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Overall P&L Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Total P&L</span>
                      <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{totalPnL.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Closed Trades</span>
                      <p className="text-2xl font-bold">{totalClosedTrades}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">Realized</span>
                      <p className={`font-medium ${totalRealized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{totalRealized.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Unrealized</span>
                      <p className={`font-medium ${totalUnrealized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{totalUnrealized.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                    <div>
                      <span className="text-xs text-muted-foreground">Open Positions</span>
                      <p className="font-medium">{totalOpenPositions}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">LTP Symbols</span>
                      <p className="font-medium">{totalLTPSymbols}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* LTP Store Tab - Grouped by Strategy */}
          <TabsContent value="ltp" className="h-full m-0 p-0">
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-2">
                {Object.keys(sessionData).length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No LTP data yet
                  </div>
                ) : (
                  Object.entries(sessionData).map(([sessionId, data]) => {
                    const ltpSymbols = Object.keys(data.ltpStore).sort();
                    const isExpanded = expandedLTP[sessionId];
                    
                    return (
                      <Collapsible
                        key={sessionId}
                        open={isExpanded}
                        onOpenChange={(open) => setExpandedLTP(prev => ({ ...prev, [sessionId]: open }))}
                      >
                        <Card>
                          <CollapsibleTrigger className="w-full">
                            <CardHeader className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                  <span className="font-medium text-sm">{data.strategyName}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {ltpSymbols.length} symbols
                                </Badge>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="p-3 pt-0 space-y-1">
                              {ltpSymbols.map((symbol) => {
                                const price = data.ltpStore[symbol];
                                const displaySymbol = symbol.length > 30 ? symbol.slice(0, 30) + '...' : symbol;
                                return (
                                  <div 
                                    key={symbol}
                                    className="flex justify-between items-center py-1.5 px-2 bg-muted/20 rounded text-xs"
                                  >
                                    <span className="font-mono text-muted-foreground truncate flex-1" title={symbol}>
                                      {displaySymbol}
                                    </span>
                                    <span className="font-bold text-cyan-600 ml-2">
                                      ₹{price.toFixed(2)}
                                    </span>
                                  </div>
                                );
                              })}
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>

          {/* Positions Tab - Grouped by Strategy+Broker */}
          <TabsContent value="positions" className="h-full m-0 p-0">
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-2">
                {Object.keys(sessionData).length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No positions yet
                  </div>
                ) : (
                  Object.entries(sessionData).map(([sessionId, data]) => {
                    const positions = data.positions || [];
                    const isExpanded = expandedPositions[sessionId];
                    
                    if (positions.length === 0) return null;
                    
                    return (
                      <Collapsible
                        key={sessionId}
                        open={isExpanded}
                        onOpenChange={(open) => setExpandedPositions(prev => ({ ...prev, [sessionId]: open }))}
                      >
                        <Card>
                          <CollapsibleTrigger className="w-full">
                            <CardHeader className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium text-sm">{data.strategyName}</span>
                                    <span className="text-xs text-muted-foreground">{data.brokerName}</span>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {positions.length} {positions.length === 1 ? 'position' : 'positions'}
                                </Badge>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="p-3 pt-0 space-y-2">
                              {positions.map((position: any, idx: number) => {
                                const isClosed = position.status === 'CLOSED' || position.status === 'closed';
                                const pnlValue = isClosed ? (position.pnl || position.realized_pnl || 0) : (position.unrealized_pnl || 0);
                                const pnlNum = typeof pnlValue === 'string' ? parseFloat(pnlValue) : pnlValue;
                                const entryTime = position.entry_time ? new Date(position.entry_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '—';
                                const exitTime = position.exit_time ? new Date(position.exit_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : null;
                                const currentLtp = position.current_ltp || position.current_price;
                                
                                return (
                                  <div key={position.position_id || idx} className="p-3 bg-muted/20 rounded space-y-2">
                                    {/* Header: Symbol + Side Badge */}
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-sm truncate flex-1" title={position.symbol}>
                                        {position.symbol}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {isClosed && (
                                          <Badge variant="secondary" className="text-xs">CLOSED</Badge>
                                        )}
                                        <Badge variant={position.side?.toLowerCase() === 'buy' ? 'default' : 'destructive'} className="text-xs">
                                          {position.side?.toUpperCase()}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    {/* Row 1: Qty + P&L */}
                                    <div className="flex justify-between text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Qty:</span>
                                        <span className="ml-1 font-medium">{position.actual_quantity || position.quantity}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">{isClosed ? 'Realized P&L:' : 'Unrealized P&L:'}</span>
                                        <span className={`ml-1 font-semibold ${pnlNum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          ₹{pnlNum.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {/* Row 2: Entry Price + Entry Time */}
                                    <div className="flex justify-between text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Entry:</span>
                                        <span className="ml-1 font-medium">₹{parseFloat(position.entry_price || 0).toFixed(2)}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Entry Time:</span>
                                        <span className="ml-1 font-medium">{entryTime}</span>
                                      </div>
                                    </div>
                                    
                                    {/* Row 3: Exit/LTP + Exit Time (for closed) or just LTP (for open) */}
                                    <div className="flex justify-between text-sm">
                                      {isClosed ? (
                                        <>
                                          <div>
                                            <span className="text-muted-foreground">Exit:</span>
                                            <span className="ml-1 font-medium">₹{parseFloat(position.exit_price || 0).toFixed(2)}</span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">Exit Time:</span>
                                            <span className="ml-1 font-medium">{exitTime || '—'}</span>
                                          </div>
                                        </>
                                      ) : (
                                        <div>
                                          <span className="text-muted-foreground">LTP:</span>
                                          <span className="ml-1 font-medium">
                                            {currentLtp ? `₹${parseFloat(currentLtp).toFixed(2)}` : '—'}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="brokers" className="h-full m-0 p-0">
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-3">
                {/* Add New Connection Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-muted-foreground">Broker Connections</h3>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setEditingBroker(null);
                      setShowClickHouseDialog(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add New
                  </Button>
                </div>

                {brokerConnections.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No broker connections
                  </div>
                ) : (
                  brokerConnections.map((broker) => (
                    <Card key={broker.id}>
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>{broker.connection_name}</span>
                          <Badge variant={broker.status === 'connected' ? 'default' : 'secondary'} className="text-xs">
                            {broker.status}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium">{broker.broker_type}</span>
                        </div>
                        {broker.broker_metadata?.simulation_date && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium">{broker.broker_metadata.simulation_date}</span>
                          </div>
                        )}
                        {broker.broker_metadata?.speed_multiplier && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Speed:</span>
                            <span className="font-medium">{broker.broker_metadata.speed_multiplier}x</span>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setEditingBroker(broker);
                              if (broker.broker_type === 'clickhouse') {
                                setShowClickHouseDialog(true);
                              } else {
                                setSelectedBrokerType({ id: broker.broker_type, name: broker.connection_name });
                                setShowConnectionDialog(true);
                              }
                            }}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => handleDeleteBroker(broker.id, broker.connection_name)}
                            disabled={deletingBrokerId === broker.id}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            {deletingBrokerId === broker.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Inline Broker Connection Dialogs */}
      {showClickHouseDialog && (
        <ClickHouseConnectionDialog
          open={showClickHouseDialog}
          onOpenChange={setShowClickHouseDialog}
          editingConnection={editingBroker}
          onSuccess={() => {
            setShowClickHouseDialog(false);
            setEditingBroker(null);
          }}
        />
      )}

      {showConnectionDialog && (
        <BrokerConnectionSettingsDialog
          open={showConnectionDialog}
          onOpenChange={setShowConnectionDialog}
          onBack={() => setShowConnectionDialog(false)}
          selectedBroker={selectedBrokerType}
          editingConnection={editingBroker}
        />
      )}
    </div>
  );
};
