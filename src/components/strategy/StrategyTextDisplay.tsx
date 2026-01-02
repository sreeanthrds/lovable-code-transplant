
import React, { useMemo } from 'react';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { groupConditionToString } from './utils/conditions/stringRepresentation';
import { FileText, TrendingUp, TrendingDown, Clock, Target, Activity, BarChart3, Settings, Play } from 'lucide-react';
import { useTimeframeMigration } from './utils/timeframe-migration/useTimeframeMigration';
import { Badge } from '@/components/ui/badge';

const StrategyTextDisplay: React.FC = () => {
  const { nodes, edges } = useStrategyStore();
  
  useTimeframeMigration();

  const realNodes = nodes?.filter(node => !node.data?.isVirtual && !node.data?.isStrategyOverview) || [];
  const startNode = realNodes.find(node => node.type === 'startNode');
  const entrySignalNodes = realNodes.filter(node => node.type === 'entrySignalNode');
  const entryActionNodes = realNodes.filter(node => node.type === 'entryNode');
  const exitSignalNodes = realNodes.filter(node => node.type === 'exitSignalNode');
  const exitActionNodes = realNodes.filter(node => node.type === 'exitNode');
  const reEntryNodes = realNodes.filter(node => node.type === 'reEntrySignalNode');

  if (realNodes.length === 0) {
    return (
      <div className="h-full w-full overflow-auto">
        <div className="p-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-2">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground">No strategy configured yet</p>
            <p className="text-sm text-muted-foreground/70">Add strategy components to see details here</p>
          </div>
        </div>
      </div>
    );
  }

  const startData = startNode?.data as any;

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden">
      <div className="p-4 space-y-3 pb-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-2">
          <div className="glass-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Total Nodes</p>
                <p className="text-xl font-bold text-primary">{realNodes.length}</p>
              </div>
              <div className="p-2 rounded-full bg-primary/20">
                <Activity className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="glass-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Connections</p>
                <p className="text-xl font-bold text-accent">{edges?.length || 0}</p>
              </div>
              <div className="p-2 rounded-full bg-accent/20">
                <BarChart3 className="h-4 w-4 text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Trading Instrument */}
        {startData && (startData.symbol || startData.tradingInstrument) && (
          <div className="glass-card overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 py-2 px-3 border-b border-white/10">
              <div className="text-xs flex items-center gap-1.5 font-medium">
                <Target className="h-3.5 w-3.5" style={{ color: 'rgb(59, 130, 246)' }} />
                Trading Instrument & Market Configuration
              </div>
            </div>
            <div className="p-3 space-y-2">
              {/* Primary Market Details - Show Symbol First */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Trading Symbol</span>
                  <Badge variant="default" className="font-mono text-[11px] h-6 font-bold">
                    {startData.symbol || 'Not Selected'}
                  </Badge>
                </div>
                
                {startData.exchange && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Exchange</span>
                    <Badge variant="outline" className="text-[10px] h-5">{startData.exchange}</Badge>
                  </div>
                )}
                
                {startData.series && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Series</span>
                    <Badge variant="outline" className="text-[10px] h-5">{startData.series}</Badge>
                  </div>
                )}
              </div>

              {/* Instrument Type Configuration */}
              {startData.tradingInstrument && (
                <div className="border-t border-border/30 pt-2 mt-2 space-y-2">
                  <div className="text-[10px] font-semibold text-muted-foreground">Instrument Configuration</div>
                  
                  {startData.tradingInstrument.type && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Instrument Type</span>
                      <Badge variant="default" className="text-[10px] h-5">{startData.tradingInstrument.type.toUpperCase()}</Badge>
                    </div>
                  )}
                  
                  {startData.tradingInstrument.underlyingType && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Underlying Asset Type</span>
                      <Badge variant="outline" className="text-[10px] h-5">{startData.tradingInstrument.underlyingType.toUpperCase()}</Badge>
                    </div>
                  )}

                  {/* Options Specific Configuration */}
                  {startData.tradingInstrument.type === 'options' && (
                    <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded text-[10px] space-y-1 mt-2">
                      <div className="font-semibold text-blue-600 mb-1">Options Strategy Parameters:</div>
                      {startData.tradingInstrument.underlyingType === 'index' ? (
                        <>
                          <div>• Strike Selection: ATM (At The Money) - Default</div>
                          <div>• Expiry Selection: Current Week (W0) - Default</div>
                          <div>• Option Type: Call/Put based on position direction</div>
                          <div>• Premium: Market-based at execution</div>
                        </>
                      ) : (
                        <>
                          <div>• Strike Selection: Based on underlying {startData.tradingInstrument.underlyingType}</div>
                          <div>• Expiry: Configurable per position</div>
                          <div>• Option Type: Call/Put per position requirements</div>
                        </>
                      )}
                      <div className="text-muted-foreground italic mt-1.5">
                        ℹ Specific strike and expiry configured in Entry/Exit signals
                      </div>
                    </div>
                  )}

                  {/* Futures Configuration */}
                  {startData.tradingInstrument.type === 'futures' && (
                    <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded text-[10px] space-y-1 mt-2">
                      <div className="font-semibold text-blue-600 mb-1">Futures Contract:</div>
                      <div>• Contract: Current month by default</div>
                      <div>• Lot Size: Exchange defined</div>
                      <div>• Settlement: Cash settled</div>
                    </div>
                  )}

                  {/* Equity Configuration */}
                  {startData.tradingInstrument.type === 'equity' && (
                    <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded text-[10px] space-y-1 mt-2">
                      <div className="font-semibold text-blue-600 mb-1">Equity Trading:</div>
                      <div>• Direct stock trading</div>
                      <div>• Delivery or Intraday available</div>
                      <div>• Market/Limit orders supported</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Technical Setup - Only show if data exists */}
        {startData && (startData.timeframe || (startData.indicators && Object.keys(startData.indicators).length > 0)) && (
          <div className="glass-card overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 py-2 px-3 border-b border-white/10">
              <div className="text-xs flex items-center gap-1.5 font-medium">
                <Activity className="h-3.5 w-3.5" style={{ color: 'rgb(168, 85, 247)' }} />
                Technical Analysis Setup
              </div>
            </div>
            <div className="p-3 space-y-2">
              {startData.timeframe && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Chart Timeframe</span>
                  <Badge variant="secondary" className="text-[10px] h-5">{startData.timeframe} candles</Badge>
                </div>
              )}
              {startData.indicators && Object.keys(startData.indicators).length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground font-medium">Technical Indicators</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.values(startData.indicators).map((indicator: any, idx: number) => (
                      indicator?.indicator_name && (
                        <Badge key={idx} variant="outline" className="text-[10px] h-5 px-2">
                          {indicator.indicator_name} (Period: {indicator.timeperiod})
                        </Badge>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Strategy Controller (Start Node) Details */}
        {startData && (
          <div className="glass-card overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 py-2 px-3 border-b border-white/10">
              <div className="text-xs flex items-center gap-1.5 font-medium">
                <Settings className="h-3.5 w-3.5" style={{ color: 'rgb(45, 212, 191)' }} />
                Strategy Controller Configuration
              </div>
            </div>
            <div className="p-3 space-y-2">
              <div className="text-[10px] text-muted-foreground mb-2">
                Core strategy execution parameters and initialization settings
              </div>
              
              {startData.strategyName && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Strategy Name</span>
                  <span className="font-medium">{startData.strategyName}</span>
                </div>
              )}
              
              {startData.timeframe && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Data Resolution</span>
                  <Badge variant="secondary" className="text-[10px] h-5">{startData.timeframe}</Badge>
                </div>
              )}
              
              {startData.symbol && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Primary Symbol</span>
                  <Badge variant="outline" className="text-[10px] h-5 font-mono">{startData.symbol}</Badge>
                </div>
              )}

              {startData.exchange && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Exchange</span>
                  <Badge variant="outline" className="text-[10px] h-5">{startData.exchange}</Badge>
                </div>
              )}

              <div className="p-2 bg-muted/30 rounded text-[10px] space-y-1 mt-2">
                <div className="font-medium">Execution Flow:</div>
                <div>1. Initialize strategy parameters</div>
                <div>2. Load technical indicators & market data</div>
                <div>3. Monitor entry signal conditions</div>
                <div>4. Execute trades when signals trigger</div>
                <div>5. Track positions & manage exits</div>
                <div>6. Apply square-off rules at session end</div>
              </div>
            </div>
          </div>
        )}

        {/* Square-off Strategy */}
        {startData?.endConditions && (
          <div className="glass-card overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 py-2 px-3 border-b border-white/10">
              <div className="text-xs flex items-center gap-1.5 font-medium">
                <Clock className="h-3.5 w-3.5" style={{ color: 'rgb(251, 146, 60)' }} />
                Square-off Strategy
              </div>
            </div>
            <div className="p-3 space-y-1.5">
              {startData.endConditions.timeBasedExit?.enabled && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Time-based exit:</span>
                  <span className="ml-1.5 font-medium">Before market close (3:25 PM)</span>
                </div>
              )}
              {startData.endConditions.positionClosure?.orderType && (
                <div className="text-xs flex items-center gap-1.5">
                  <span className="text-muted-foreground">Order type:</span>
                  <Badge variant="secondary" className="text-[10px] h-5">{startData.endConditions.positionClosure.orderType}</Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Entry Signal Nodes */}
        {entrySignalNodes.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 py-2 px-3 border-b border-white/10">
              <div className="text-xs flex items-center gap-1.5 font-medium">
                <TrendingUp className="h-3.5 w-3.5" style={{ color: 'rgb(34, 197, 94)' }} />
                Entry Signals - Condition Triggers ({entrySignalNodes.length})
              </div>
            </div>
            <div className="p-3 space-y-3">
              {entrySignalNodes.map((node, index) => {
                const data = node.data as any;
                const color = { 
                  rgb: 'rgb(34, 197, 94)', 
                  rgba: 'rgba(34, 197, 94, 0.5)', 
                  bg: 'rgba(34, 197, 94, 0.2)',
                  light: 'rgb(74, 222, 128)' // lighter for arrows
                };
                return (
                  <div key={node.id} className="glass-card p-3 space-y-2 border-l-4" style={{ borderColor: color.rgba }}>
                    <div className="font-semibold text-xs flex items-center gap-1" style={{ color: color.rgb }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: color.bg }}>{index + 1}</span>
                      Entry Signal #{index + 1}
                    </div>
                    
                    {/* Position Configuration */}
                    <div className="space-y-1.5 border-l-2 pl-2" style={{ borderColor: color.rgba }}>
                      <div className="text-[10px] font-semibold text-muted-foreground">Position Configuration:</div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {data.positionType && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground text-[10px]">Direction:</span>
                            <Badge variant={data.positionType === 'BUY' ? 'default' : 'destructive'} className="text-[10px] h-5">
                              {data.positionType}
                            </Badge>
                          </div>
                        )}
                        {data.quantity && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground text-[10px]">Quantity:</span>
                            <span className="font-mono text-[10px] font-medium">{data.quantity} lots</span>
                          </div>
                        )}
                        {data.orderType && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground text-[10px]">Order Type:</span>
                            <Badge variant="outline" className="text-[10px] h-5">{data.orderType}</Badge>
                          </div>
                        )}
                        {data.priceType && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground text-[10px]">Price Type:</span>
                            <Badge variant="outline" className="text-[10px] h-5">{data.priceType}</Badge>
                          </div>
                        )}
                        {data.productType && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground text-[10px]">Product:</span>
                            <Badge variant="outline" className="text-[10px] h-5">{data.productType}</Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Risk Management */}
                    {(data.stopLoss || data.target) && (
                      <div className="space-y-1.5 border-t border-white/10 pt-1.5">
                        <div className="text-[10px] font-semibold text-muted-foreground">Risk Management:</div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          {data.stopLoss && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground text-[10px]">Stop Loss:</span>
                              <span className="font-mono text-[10px] text-red-400 font-medium">{data.stopLoss}</span>
                            </div>
                          )}
                          {data.target && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground text-[10px]">Target:</span>
                              <span className="font-mono text-[10px] text-green-400 font-medium">{data.target}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Entry Trigger Conditions */}
                    {data.conditions && data.conditions.length > 0 && (
                      <div className="border-t border-white/10 pt-1.5">
                        <div className="text-[10px] font-semibold text-muted-foreground mb-1">Entry Trigger Conditions:</div>
                        <div className="p-2 bg-white/5 backdrop-blur-sm border rounded text-[10px] leading-relaxed space-y-1" style={{ borderColor: color.rgba }}>
                          {data.conditions.map((conditionGroup: any, idx: number) => {
                            try {
                              const conditionText = groupConditionToString(conditionGroup, startData);
                              return conditionText ? (
                                <div key={idx} className="flex items-start gap-1">
                                  <span className="font-semibold" style={{ color: color.light }}>→</span>
                                  <span>{conditionText}</span>
                                </div>
                              ) : null;
                            } catch {
                              return null;
                            }
                          })}
                        </div>
                      </div>
                    )}

                    {/* Execution Notes */}
                    <div className="text-[10px] text-muted-foreground italic bg-white/5 p-1.5 rounded border border-white/5">
                      📝 Position opens when ALL conditions are met. Entry price, time & ID logged for tracking.
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Entry Action Nodes */}
        {entryActionNodes.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 py-2 px-3 border-b border-white/10">
              <div className="text-xs flex items-center gap-1.5 font-medium">
                <Play className="h-3.5 w-3.5" style={{ color: 'rgb(6, 182, 212)' }} />
                Entry Actions - Position Execution ({entryActionNodes.length})
              </div>
            </div>
            <div className="p-3 space-y-3">
              {entryActionNodes.map((node, index) => {
                const data = node.data as any;
                const color = { 
                  rgb: 'rgb(6, 182, 212)', 
                  rgba: 'rgba(6, 182, 212, 0.5)', 
                  bg: 'rgba(6, 182, 212, 0.2)',
                  light: 'rgb(34, 211, 238)'
                };
                return (
                  <div key={node.id} className="glass-card p-3 space-y-2 border-l-4" style={{ borderColor: color.rgba }}>
                    <div className="font-semibold text-xs flex items-center gap-1" style={{ color: color.rgb }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: color.bg }}>{index + 1}</span>
                      Entry Action #{index + 1}
                    </div>
                    
                    {/* Position Configuration */}
                    <div className="space-y-1.5 border-l-2 pl-2" style={{ borderColor: color.rgba }}>
                      <div className="text-[10px] font-semibold text-muted-foreground">Position Configuration:</div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {data.positions && data.positions.length > 0 && data.positions.map((pos: any, pidx: number) => (
                          <React.Fragment key={pidx}>
                            {pos.positionType && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground text-[10px]">Direction:</span>
                                <Badge variant={pos.positionType === 'buy' ? 'default' : 'destructive'} className="text-[10px] h-5">
                                  {pos.positionType.toUpperCase()}
                                </Badge>
                              </div>
                            )}
                            {pos.quantity && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground text-[10px]">Quantity:</span>
                                <span className="font-mono text-[10px] font-medium">{pos.quantity} lots</span>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Execution Notes */}
                    <div className="text-[10px] text-muted-foreground italic bg-white/5 p-1.5 rounded border border-white/5">
                      📝 Executes trade entry when triggered by entry signal.
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Re-Entry Signal Nodes */}
        {reEntryNodes.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500/10 to-violet-500/5 py-2 px-3 border-b border-white/10">
              <div className="text-xs flex items-center gap-1.5 font-medium">
                <Activity className="h-3.5 w-3.5" style={{ color: 'rgb(139, 92, 246)' }} />
                Re-Entry Signals - Retry Conditions ({reEntryNodes.length})
              </div>
            </div>
            <div className="p-3 space-y-3">
              {reEntryNodes.map((node, index) => {
                const data = node.data as any;
                const color = { 
                  rgb: 'rgb(139, 92, 246)', 
                  rgba: 'rgba(139, 92, 246, 0.5)', 
                  bg: 'rgba(139, 92, 246, 0.2)',
                  light: 'rgb(167, 139, 250)'
                };
                return (
                  <div key={node.id} className="glass-card p-3 space-y-2 border-l-4" style={{ borderColor: color.rgba }}>
                    <div className="font-semibold text-xs flex items-center gap-1" style={{ color: color.rgb }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: color.bg }}>{index + 1}</span>
                      Re-Entry Signal #{index + 1}
                    </div>
                    
                    {/* Re-Entry Trigger Conditions */}
                    {data.conditions && data.conditions.length > 0 && (
                      <div className="border-t border-white/10 pt-1.5">
                        <div className="text-[10px] font-semibold text-muted-foreground mb-1">Re-Entry Trigger Conditions:</div>
                        <div className="p-2 bg-white/5 backdrop-blur-sm border rounded text-[10px] leading-relaxed space-y-1" style={{ borderColor: color.rgba }}>
                          {data.conditions.map((conditionGroup: any, idx: number) => {
                            try {
                              const conditionText = groupConditionToString(conditionGroup, startData);
                              return conditionText ? (
                                <div key={idx} className="flex items-start gap-1">
                                  <span className="font-semibold" style={{ color: color.light }}>→</span>
                                  <span>{conditionText}</span>
                                </div>
                              ) : null;
                            } catch {
                              return null;
                            }
                          })}
                        </div>
                      </div>
                    )}

                    {/* Execution Notes */}
                    <div className="text-[10px] text-muted-foreground italic bg-white/5 p-1.5 rounded border border-white/5">
                      🔄 Re-enters position when conditions are met after exit.
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Exit Signal Nodes */}
        {exitSignalNodes.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 py-2 px-3 border-b border-white/10">
              <div className="text-xs flex items-center gap-1.5 font-medium">
                <TrendingDown className="h-3.5 w-3.5" style={{ color: 'rgb(251, 191, 36)' }} />
                Exit Signals - Condition Triggers ({exitSignalNodes.length})
              </div>
            </div>
            <div className="p-3 space-y-3">
              {exitSignalNodes.map((node, index) => {
                const data = node.data as any;
                const color = { 
                  rgb: 'rgb(251, 191, 36)', 
                  rgba: 'rgba(251, 191, 36, 0.5)', 
                  bg: 'rgba(251, 191, 36, 0.2)',
                  light: 'rgb(252, 211, 77)' // lighter for arrows
                };
                return (
                  <div key={node.id} className="glass-card p-3 space-y-2 border-l-4" style={{ borderColor: color.rgba }}>
                    <div className="font-semibold text-xs flex items-center gap-1" style={{ color: color.rgb }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: color.bg }}>{index + 1}</span>
                      Exit Signal #{index + 1}
                    </div>
                    
                    {/* Exit Configuration */}
                    <div className="space-y-1.5 border-l-2 pl-2" style={{ borderColor: color.rgba }}>
                      <div className="text-[10px] font-semibold text-muted-foreground">Exit Configuration:</div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {data.exitType && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground text-[10px]">Exit Type:</span>
                            <Badge variant="secondary" className="text-[10px] h-5">{data.exitType}</Badge>
                          </div>
                        )}
                        {data.exitQuantity && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground text-[10px]">Quantity:</span>
                            <Badge variant="outline" className="text-[10px] h-5">
                              {data.exitQuantity}
                            </Badge>
                          </div>
                        )}
                        {data.orderType && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground text-[10px]">Order Type:</span>
                            <Badge variant="outline" className="text-[10px] h-5">{data.orderType}</Badge>
                          </div>
                        )}
                        {data.priceType && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground text-[10px]">Price Type:</span>
                            <Badge variant="outline" className="text-[10px] h-5">{data.priceType}</Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Exit Trigger Conditions */}
                    {data.conditions && data.conditions.length > 0 && (
                      <div className="border-t border-white/10 pt-1.5">
                        <div className="text-[10px] font-semibold text-muted-foreground mb-1">Exit Trigger Conditions:</div>
                        <div className="p-2 bg-white/5 backdrop-blur-sm border rounded text-[10px] leading-relaxed space-y-1" style={{ borderColor: color.rgba }}>
                          {data.conditions.map((conditionGroup: any, idx: number) => {
                            try {
                              const conditionText = groupConditionToString(conditionGroup, startData);
                              return conditionText ? (
                                <div key={idx} className="flex items-start gap-1">
                                  <span className="font-semibold" style={{ color: color.light }}>→</span>
                                  <span>{conditionText}</span>
                                </div>
                              ) : null;
                            } catch {
                              return null;
                            }
                          })}
                        </div>
                      </div>
                    )}

                    {/* Execution Notes */}
                    <div className="text-[10px] text-muted-foreground italic bg-white/5 p-1.5 rounded border border-white/5">
                      📝 Position exits when conditions met. P&L calculated & logged. Remaining quantity updated.
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Exit Action Nodes */}
        {exitActionNodes.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="bg-gradient-to-r from-red-500/10 to-red-500/5 py-2 px-3 border-b border-white/10">
              <div className="text-xs flex items-center gap-1.5 font-medium">
                <Target className="h-3.5 w-3.5" style={{ color: 'rgb(239, 68, 68)' }} />
                Exit Actions - Position Closure ({exitActionNodes.length})
              </div>
            </div>
            <div className="p-3 space-y-3">
              {exitActionNodes.map((node, index) => {
                const data = node.data as any;
                const color = { 
                  rgb: 'rgb(239, 68, 68)', 
                  rgba: 'rgba(239, 68, 68, 0.5)', 
                  bg: 'rgba(239, 68, 68, 0.2)',
                  light: 'rgb(248, 113, 113)'
                };
                return (
                  <div key={node.id} className="glass-card p-3 space-y-2 border-l-4" style={{ borderColor: color.rgba }}>
                    <div className="font-semibold text-xs flex items-center gap-1" style={{ color: color.rgb }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: color.bg }}>{index + 1}</span>
                      Exit Action #{index + 1}
                    </div>
                    
                    {/* Exit Configuration */}
                    <div className="space-y-1.5 border-l-2 pl-2" style={{ borderColor: color.rgba }}>
                      <div className="text-[10px] font-semibold text-muted-foreground">Exit Configuration:</div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {data.positions && data.positions.length > 0 && data.positions.map((pos: any, pidx: number) => (
                          <React.Fragment key={pidx}>
                            {pos.exitType && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground text-[10px]">Exit Type:</span>
                                <Badge variant="secondary" className="text-[10px] h-5">{pos.exitType}</Badge>
                              </div>
                            )}
                            {pos.quantity && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground text-[10px]">Quantity:</span>
                                <Badge variant="outline" className="text-[10px] h-5">{pos.quantity}</Badge>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Execution Notes */}
                    <div className="text-[10px] text-muted-foreground italic bg-white/5 p-1.5 rounded border border-white/5">
                      📝 Closes position when triggered by exit signal. P&L calculated.
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyTextDisplay;
