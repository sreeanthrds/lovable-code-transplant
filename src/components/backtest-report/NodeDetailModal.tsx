import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { ExecutionNode, ConditionEvaluated, CandleData } from '@/types/backtest';
import { getNodeCategory, getNodeColor } from '@/types/backtest';
import { cn } from '@/lib/utils';
import {
  Clock,
  GitBranch,
  Package,
  TrendingUp,
  AlertCircle,
  Layers,
  Database,
  CheckCircle2,
  XCircle,
  Timer,
  BarChart3,
  Target,
  Activity,
  X,
  ArrowRight,
  Zap,
  CircleDot
} from 'lucide-react';

interface NodeDetailModalProps {
  node: ExecutionNode | null;
  isOpen: boolean;
  onClose: () => void;
  allNodes?: Record<string, ExecutionNode>;
}

const NodeDetailModal: React.FC<NodeDetailModalProps> = ({ node, isOpen, onClose, allNodes = {} }) => {
  if (!node) return null;

  const category = getNodeCategory(node.node_type);
  const color = getNodeColor(category);

  // Find parent node details
  const getParentLabel = () => {
    if (!node.parent_execution_id) return null;
    const parentNode = allNodes[node.parent_execution_id];
    if (parentNode) {
      return `${parentNode.node_name} (${parentNode.node_id})`;
    }
    // Fallback: extract node_id from execution_id pattern like "exec_entry-condition-1_20241029_091900_57e875"
    const match = node.parent_execution_id.match(/^exec_([^_]+(?:_[^_]+)?)_\d{8}_\d{6}_/);
    if (match) {
      return match[1];
    }
    return node.parent_execution_id;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const isConditionNode = category === 'entry-signal' || category === 'exit-signal' || category === 're-entry-signal' || node.evaluated_conditions || node.conditions_preview;
  const isSquareOffNode = category === 'square-off' || node.square_off;
  const isActionNode = category === 'entry' || category === 'exit' || node.action;

  // Render a single condition evaluation with visual styling - using separate raw and evaluated fields
  const renderCondition = (condition: ConditionEvaluated, index: number) => (
    <div 
      key={index} 
      className={cn(
        "px-4 py-3 rounded-lg border transition-all",
        condition.result 
          ? "bg-emerald-500/10 border-emerald-500/30" 
          : "bg-rose-500/10 border-rose-500/30"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          condition.result ? "bg-emerald-500/20" : "bg-rose-500/20"
        )}>
          {condition.result ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-rose-500" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          {/* Raw condition - the original expression */}
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-slate-500/20 border-slate-500/40 text-slate-300 shrink-0 mt-0.5">
              RAW
            </Badge>
            <span className="font-mono text-sm text-foreground/70 break-all leading-relaxed">
              {condition.raw || condition.condition_text}
            </span>
          </div>
          {/* Evaluated condition - the computed values with distinct styling */}
          {condition.evaluated && (
            <div className="flex items-start gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4 shrink-0 mt-0.5",
                  condition.result 
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" 
                    : "bg-rose-500/20 border-rose-500/40 text-rose-300"
                )}
              >
                EVAL
              </Badge>
              <span className={cn(
                "font-mono text-sm font-semibold break-all leading-relaxed",
                condition.result ? "text-emerald-400" : "text-rose-400"
              )}>
                {condition.evaluated}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render candle data with visual styling - improved visibility
  const renderCandleData = (label: string, candle: CandleData) => (
    <div className="flex items-center gap-3 p-2.5 bg-background/60 rounded-lg">
      <span className="text-sm font-medium text-foreground/90 w-12">{label}</span>
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 font-medium rounded">O: {candle.open.toFixed(2)}</span>
        <span className="px-2.5 py-1 bg-green-500/20 text-green-400 font-medium rounded">H: {candle.high.toFixed(2)}</span>
        <span className="px-2.5 py-1 bg-red-500/20 text-red-400 font-medium rounded">L: {candle.low.toFixed(2)}</span>
        <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 font-medium rounded">C: {candle.close.toFixed(2)}</span>
      </div>
      {candle.indicators && Object.keys(candle.indicators).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(candle.indicators).map(([name, value]) => (
            <span key={name} className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-medium rounded text-sm">
              {name}: {typeof value === 'number' ? value.toFixed(2) : value}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const parentLabel = getParentLabel();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        {/* Header with close button */}
        <DialogHeader className="px-4 py-3 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-3 h-10 rounded shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-semibold truncate">{node.node_name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">{node.node_type}</Badge>
                  <Badge variant="secondary" className="font-mono text-xs">{node.node_id}</Badge>
                  {node.signal_emitted !== undefined && (
                    <Badge 
                      variant={node.signal_emitted ? "default" : "secondary"} 
                      className={cn("text-xs", node.signal_emitted && "bg-emerald-600 hover:bg-emerald-700")}
                    >
                      {node.signal_emitted ? "✓ Signal" : "No Signal"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="shrink-0 h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-4 space-y-4">
            {/* Execution Info - Clean grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Clock className="h-3 w-3" />
                  Timestamp
                </div>
                <div className="font-mono text-sm">{formatTimestamp(node.timestamp)}</div>
              </div>
              {parentLabel && (
                <div className="p-3 bg-muted/30 rounded-lg col-span-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <GitBranch className="h-3 w-3" />
                    Parent Node
                  </div>
                  <div className="font-mono text-sm truncate">{parentLabel}</div>
                </div>
              )}
            </div>

            {/* CONDITION NODE CONTENT */}
            {isConditionNode && (
              <div className="space-y-4">
                {/* Conditions Preview */}
                {node.conditions_preview && (
                  <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Target className="h-4 w-4 text-indigo-500" />
                      Conditions Preview
                    </div>
                    <div className="font-mono text-sm bg-background/50 p-3 rounded-lg break-all">
                      {node.conditions_preview}
                    </div>
                  </div>
                )}

                {/* Evaluated Conditions */}
                {node.evaluated_conditions?.conditions_evaluated && node.evaluated_conditions.conditions_evaluated.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CircleDot className="h-4 w-4 text-blue-500" />
                      Evaluated Conditions
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {node.evaluated_conditions.conditions_evaluated.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {node.evaluated_conditions.conditions_evaluated.map((cond, idx) => 
                        renderCondition(cond, idx)
                      )}
                    </div>
                  </div>
                )}

                {/* Market Data - Candles, Signal, LTP unified section */}
                {(node.evaluated_conditions?.candle_data || node.exit_signal_data || node.ltp_store) && (
                  <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 rounded-xl border border-cyan-500/20 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Activity className="h-4 w-4 text-cyan-500" />
                      Market Data
                    </div>

                    {/* Candle Data */}
                    {node.evaluated_conditions?.candle_data && Object.keys(node.evaluated_conditions.candle_data).length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <BarChart3 className="h-3 w-3" /> Candles
                        </div>
                        {Object.entries(node.evaluated_conditions.candle_data).map(([symbol, data]) => (
                          <div key={symbol} className="bg-background/30 rounded-lg p-3 space-y-2">
                            <div className="font-mono text-xs font-medium text-primary">{symbol}</div>
                            {renderCandleData("Curr", data.current)}
                            {renderCandleData("Prev", data.previous)}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Exit Signal Data */}
                    {node.exit_signal_data && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3 text-orange-500" /> Exit Signal
                        </div>
                        <div className="flex flex-wrap gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-orange-500" />
                            <span className="text-xs font-mono">{new Date(node.exit_signal_data.exit_signal_time).toLocaleTimeString()}</span>
                          </div>
                          <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30 text-orange-600">
                            {node.exit_signal_data.exit_reason}
                          </Badge>
                          {node.exit_signal_data.exit_signal_price > 0 && (
                            <span className="font-mono text-sm">₹{node.exit_signal_data.exit_signal_price}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* LTP Store */}
                    {node.ltp_store && Object.keys(node.ltp_store).length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Database className="h-3 w-3" /> LTP Data
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(node.ltp_store).map(([symbol, data]) => (
                            <div key={symbol} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border">
                              <span className="font-mono text-xs truncate flex-1">{symbol}</span>
                              <span className="font-mono font-bold text-primary ml-2">₹{data.ltp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ACTION NODE CONTENT */}
            {isActionNode && !isSquareOffNode && (
              <div className="space-y-4">
                {node.action && (
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/20">
                    <div className="flex items-center gap-2 text-sm font-medium mb-3">
                      <Zap className="h-4 w-4 text-blue-500" />
                      Order Execution
                    </div>
                    
                    {/* Order visual representation */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      {node.action.side && (
                        <Badge 
                          className={cn(
                            "text-sm px-3 py-1",
                            node.action.side.toLowerCase() === 'buy' 
                              ? 'bg-emerald-600 hover:bg-emerald-700' 
                              : 'bg-rose-600 hover:bg-rose-700'
                          )}
                        >
                          {node.action.side.toUpperCase()}
                        </Badge>
                      )}
                      {node.action.symbol && (
                        <span className="font-mono text-sm bg-background/50 px-3 py-1 rounded">{node.action.symbol}</span>
                      )}
                      {node.action.quantity && (
                        <span className="text-sm">× {node.action.quantity}</span>
                      )}
                      {node.action.price && (
                        <>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono font-bold text-lg">₹{node.action.price}</span>
                        </>
                      )}
                    </div>

                    {/* Order details grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {node.action.type && (
                        <div className="p-2 bg-background/30 rounded-lg">
                          <span className="text-xs text-muted-foreground block">Type</span>
                          <Badge className="mt-1">{node.action.type}</Badge>
                        </div>
                      )}
                      {node.action.action_type && (
                        <div className="p-2 bg-background/30 rounded-lg">
                          <span className="text-xs text-muted-foreground block">Action</span>
                          <Badge variant="outline" className="mt-1">{node.action.action_type}</Badge>
                        </div>
                      )}
                      {node.action.order_type && (
                        <div className="p-2 bg-background/30 rounded-lg">
                          <span className="text-xs text-muted-foreground block">Order Type</span>
                          <Badge variant="secondary" className="mt-1">{node.action.order_type}</Badge>
                        </div>
                      )}
                      {node.action.status && (
                        <div className="p-2 bg-background/30 rounded-lg">
                          <span className="text-xs text-muted-foreground block">Status</span>
                          <Badge 
                            className={cn(
                              "mt-1",
                              node.action.status === 'COMPLETE' && 'bg-emerald-600'
                            )}
                          >
                            {node.action.status}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {node.action.order_id && (
                      <div className="mt-3 text-xs text-muted-foreground">
                        Order ID: <span className="font-mono">{node.action.order_id}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Entry Config */}
                {node.entry_config && (
                  <div className="flex flex-wrap gap-3">
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{node.entry_config.max_entries}</div>
                      <div className="text-xs text-muted-foreground">Max Entries</div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{node.entry_config.position_num}</div>
                      <div className="text-xs text-muted-foreground">Position #</div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{node.entry_config.re_entry_num}</div>
                      <div className="text-xs text-muted-foreground">Re-entry #</div>
                    </div>
                  </div>
                )}

                {/* Position Info */}
                {node.position && (
                  <div className="p-4 bg-muted/20 rounded-xl border space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Package className="h-4 w-4" />
                      Position
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs bg-background/50 px-2 py-1 rounded">{node.position.position_id}</span>
                      {node.position.symbol && (
                        <span className="font-mono text-sm">{node.position.symbol}</span>
                      )}
                      {node.position.side && (
                        <Badge variant={node.position.side.toLowerCase() === 'buy' ? 'default' : 'destructive'}>
                          {node.position.side.toUpperCase()}
                        </Badge>
                      )}
                      {node.position.entry_price && (
                        <span className="font-mono font-bold">₹{node.position.entry_price}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Exit Result */}
                {node.exit_result && (
                  <div className={cn(
                    "p-4 rounded-xl border-2 space-y-3",
                    parseFloat(node.exit_result.pnl) >= 0 
                      ? "bg-emerald-500/10 border-emerald-500/30" 
                      : "bg-rose-500/10 border-rose-500/30"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <TrendingUp className="h-4 w-4" />
                        Exit Result
                      </div>
                      <div className={cn(
                        "text-2xl font-bold",
                        parseFloat(node.exit_result.pnl) >= 0 ? "text-emerald-600" : "text-rose-600"
                      )}>
                        ₹{node.exit_result.pnl}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Exit Price:</span>
                        <span className="font-mono ml-2">₹{node.exit_result.exit_price}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Positions Closed:</span>
                        <span className="ml-2">{node.exit_result.positions_closed}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-mono ml-2">{new Date(node.exit_result.exit_time).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SQUARE-OFF NODE CONTENT */}
            {isSquareOffNode && node.square_off && (
              <div className="space-y-4">
                {/* Square-Off Reason - Prominent */}
                <div className="p-4 bg-gradient-to-r from-purple-500/15 to-violet-500/15 rounded-xl border-2 border-purple-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Timer className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Square-Off Reason</div>
                      <div className="text-lg font-semibold">{node.square_off.reason}</div>
                    </div>
                  </div>

                  {/* Key details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="p-2 bg-background/30 rounded-lg text-center">
                      <div className={cn(
                        "text-lg font-bold",
                        node.square_off.executed ? "text-emerald-500" : "text-muted-foreground"
                      )}>
                        {node.square_off.executed ? "Yes" : "No"}
                      </div>
                      <div className="text-xs text-muted-foreground">Executed</div>
                    </div>
                    <div className="p-2 bg-background/30 rounded-lg text-center">
                      <Badge variant="outline" className="text-xs">{node.square_off.exit_type}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">Exit Type</div>
                    </div>
                    <div className="p-2 bg-background/30 rounded-lg text-center">
                      <Badge variant="secondary" className="text-xs">{node.square_off.condition_type}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">Condition</div>
                    </div>
                    <div className="p-2 bg-background/30 rounded-lg text-center">
                      <div className="text-lg font-bold text-primary">{node.square_off.positions_closed}</div>
                      <div className="text-xs text-muted-foreground">Positions Closed</div>
                    </div>
                  </div>

                  {/* Trigger Values */}
                  {node.square_off.trigger_values && (
                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                      <Badge variant="outline" className="bg-purple-500/10">
                        {node.square_off.trigger_values.time_type}
                      </Badge>
                      <span className="text-muted-foreground">Exit at:</span>
                      <span className="font-mono">{node.square_off.trigger_values.exit_time_configured}</span>
                      {node.square_off.trigger_values.trigger_time && (
                        <>
                          <span className="text-muted-foreground">Triggered:</span>
                          <span className="font-mono">{node.square_off.trigger_values.trigger_time}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Closed Positions */}
                {node.closed_positions && node.closed_positions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Package className="h-4 w-4" />
                      Closed Positions
                      <Badge variant="secondary" className="ml-auto">{node.closed_positions.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {node.closed_positions.map((pos, idx) => {
                        const pnl = (pos.exit_price - pos.entry_price) * (pos.side.toLowerCase() === 'sell' ? -1 : 1) * pos.quantity;
                        return (
                          <div 
                            key={idx} 
                            className={cn(
                              "p-3 rounded-lg border-l-4 flex items-center justify-between gap-3",
                              pnl >= 0 
                                ? "border-l-emerald-500 bg-emerald-500/5" 
                                : "border-l-rose-500 bg-rose-500/5"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-sm">{pos.symbol}</span>
                                <Badge variant={pos.side.toLowerCase() === 'buy' ? 'default' : 'destructive'} className="text-xs">
                                  {pos.side.toUpperCase()}
                                </Badge>
                                {pos.re_entry_num > 0 && (
                                  <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                                    R{pos.re_entry_num}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Qty: {pos.quantity} • ₹{pos.entry_price} → ₹{pos.exit_price}
                              </div>
                            </div>
                            <div className={cn(
                              "font-mono font-bold text-lg shrink-0",
                              pnl >= 0 ? "text-emerald-600" : "text-rose-600"
                            )}>
                              ₹{pnl.toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Config toggles */}
                {node.config && (
                  <div className="flex flex-wrap gap-3">
                    <div className={cn(
                      "px-3 py-2 rounded-lg flex items-center gap-2 text-sm",
                      node.config.time_based_exit_enabled ? "bg-emerald-500/10" : "bg-muted/30"
                    )}>
                      {node.config.time_based_exit_enabled ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      Time-based Exit
                    </div>
                    <div className={cn(
                      "px-3 py-2 rounded-lg flex items-center gap-2 text-sm",
                      node.config.immediate_exit_enabled ? "bg-emerald-500/10" : "bg-muted/30"
                    )}>
                      {node.config.immediate_exit_enabled ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      Immediate Exit
                    </div>
                    <div className={cn(
                      "px-3 py-2 rounded-lg flex items-center gap-2 text-sm",
                      node.config.performance_based_exit_enabled ? "bg-emerald-500/10" : "bg-muted/30"
                    )}>
                      {node.config.performance_based_exit_enabled ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      Performance-based
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Skip Reason */}
            {node.skip_reason?.skipped && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <span className="text-sm">{node.skip_reason.reason}</span>
                  <Badge variant="outline" className="ml-2 text-xs">{node.skip_reason.exit_reason}</Badge>
                </div>
              </div>
            )}

            {/* Children Nodes */}
            {node.children_nodes?.length > 0 && (
              <div className="p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <GitBranch className="h-4 w-4" />
                  Children Nodes
                  <Badge variant="secondary" className="ml-auto">{node.children_nodes.length}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {node.children_nodes.map((child, idx) => (
                    <Badge key={idx} variant="outline" className="font-mono text-xs">{child.id}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NodeDetailModal;
