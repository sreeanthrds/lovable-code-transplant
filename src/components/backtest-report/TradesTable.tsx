import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Workflow
} from 'lucide-react';
import type { Trade, ExecutionNode } from '@/types/backtest';
import { cn } from '@/lib/utils';
import TradeFlowDiagram from './TradeFlowDiagram';

interface TradesTableProps {
  trades: Trade[];
  getFlowNodes: (executionIds: string[]) => ExecutionNode[];
  onNodeClick: (node: ExecutionNode) => void;
}

type SortField = 'entry_time' | 'pnl' | 'duration_minutes' | 'symbol';
type SortOrder = 'asc' | 'desc';

const TradesTable: React.FC<TradesTableProps> = ({ 
  trades, 
  getFlowNodes,
  onNodeClick 
}) => {
  const [expandedTradeKey, setExpandedTradeKey] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('entry_time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [flowTypes, setFlowTypes] = useState<Record<string, 'entry' | 'exit'>>({});

  // Debug: Check for duplicate trade_ids and unique keys
  React.useEffect(() => {
    const tradeIds = trades.map(t => t.trade_id);
    const uniqueIds = new Set(tradeIds);
    if (tradeIds.length !== uniqueIds.size) {
      console.warn('🔴 Duplicate trade_ids detected:', {
        total: tradeIds.length,
        unique: uniqueIds.size,
        duplicates: tradeIds.filter((id, index) => tradeIds.indexOf(id) !== index)
      });
    }
    
    // Check array indices are always unique (they always are!)
    console.log('🔍 Array indices check:', {
      total: trades.length,
      uniqueIndices: trades.length, // Array indices are always unique
      allUnique: true // Always true for array indices
    });
  }, [trades]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedTrades = [...trades].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'entry_time':
        comparison = new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime();
        break;
      case 'pnl':
        comparison = parseFloat(a.pnl) - parseFloat(b.pnl);
        break;
      case 'duration_minutes':
        comparison = a.duration_minutes - b.duration_minutes;
        break;
      case 'symbol':
        comparison = a.symbol.localeCompare(b.symbol);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const parseSymbol = (symbol: string) => {
    // Parse: NIFTY:2024-11-07:OPT:24250:PE
    const parts = symbol.split(':');
    if (parts.length >= 5) {
      return {
        underlying: parts[0],
        expiry: parts[1],
        type: parts[2],
        strike: parts[3],
        optionType: parts[4]
      };
    }
    return { underlying: symbol, expiry: '', type: '', strike: '', optionType: '' };
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes: number) => {
    const totalSeconds = Math.round(minutes * 60);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 font-medium hover:bg-muted"
      onClick={() => handleSort(field)}
    >
      {label}
      {sortField === field && (
        sortOrder === 'asc' 
          ? <ChevronUp className="ml-1 h-3 w-3" />
          : <ChevronDown className="ml-1 h-3 w-3" />
      )}
    </Button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Trades</h3>
        <Badge variant="outline" className="font-mono">
          {trades.length} trades
        </Badge>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10"></TableHead>
              <TableHead><SortButton field="symbol" label="Symbol" /></TableHead>
              <TableHead>Side</TableHead>
              <TableHead><SortButton field="entry_time" label="Time" /></TableHead>
              <TableHead className="text-right">Entry</TableHead>
              <TableHead className="text-right">Exit</TableHead>
              <TableHead className="text-right"><SortButton field="pnl" label="P&L" /></TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Trigger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTrades.map((trade, index) => {
              // Use array index as unique key - simple and effective
              const uniqueKey = index.toString();
              const isExpanded = expandedTradeKey === uniqueKey;
              const pnl = parseFloat(trade.pnl);
              const isProfitable = pnl >= 0;
              const symbolInfo = parseSymbol(trade.symbol);

              return (
                <>
                  <TableRow
                    key={uniqueKey}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isExpanded && "bg-muted/30",
                      "hover:bg-muted/50"
                    )}
                    onClick={() => {
                      console.log('🔵 Trade clicked:', {
                        tradeId: uniqueKey,
                        trade: trade.symbol,
                        currentlyExpanded: expandedTradeKey,
                        willExpand: !isExpanded
                      });
                      setExpandedTradeKey(isExpanded ? null : uniqueKey);
                    }}
                  >
                    <TableCell className="w-10">
                      <ChevronRight 
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-90"
                        )} 
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{symbolInfo.underlying}</div>
                        <div className="text-xs text-muted-foreground">
                          {symbolInfo.strike} {symbolInfo.optionType}
                          {trade.re_entry_num > 0 && (
                            <Badge variant="secondary" className="ml-2 text-[10px] px-1">
                              R{trade.re_entry_num}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={trade.side.toUpperCase() === 'BUY' ? 'default' : 'destructive'}
                        className="font-mono text-xs"
                      >
                        {trade.side.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{formatTime(trade.entry_time)}</div>
                        {trade.exit_time && (
                          <div className="text-xs text-muted-foreground">
                            → {formatTime(trade.exit_time)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ₹{parseFloat(trade.entry_price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {trade.exit_price ? `₹${parseFloat(trade.exit_price).toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {trade.status === 'OPEN' || trade.status === 'PARTIAL' ? (
                        // Phase 6: Show unrealized P&L for OPEN/PARTIAL trades
                        trade.unrealized_pnl !== null && trade.unrealized_pnl !== undefined ? (
                          <>
                            <div className={cn(
                              "flex items-center justify-end gap-1 font-semibold",
                              parseFloat(trade.unrealized_pnl) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                              {parseFloat(trade.unrealized_pnl) >= 0 ? (
                                <ArrowUpRight className="h-4 w-4" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4" />
                              )}
                              ₹{Math.abs(parseFloat(trade.unrealized_pnl)).toFixed(2)}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {parseFloat(trade.pnl_percent).toFixed(2)}% (live)
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground">-</div>
                        )
                      ) : (
                        // Show realized P&L for CLOSED trades
                        <>
                          <div className={cn(
                            "flex items-center justify-end gap-1 font-semibold",
                            isProfitable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          )}>
                            {isProfitable ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                            ₹{Math.abs(pnl).toFixed(2)}
                          </div>
                          <div className={cn(
                            "text-xs",
                            isProfitable ? "text-green-600/70" : "text-red-600/70"
                          )}>
                            {parseFloat(trade.pnl_percent).toFixed(2)}%
                          </div>
                        </>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm font-mono">
                        {trade.status === 'PARTIAL' ? (
                          <span className="text-orange-600 dark:text-orange-400">
                            {trade.qty_closed}/{trade.actual_quantity || trade.quantity}
                          </span>
                        ) : trade.status === 'OPEN' ? (
                          <span className="text-blue-600 dark:text-blue-400">
                            {trade.actual_quantity || trade.quantity}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {trade.actual_quantity || trade.quantity}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 max-w-[150px]">
                        <Badge variant="outline" className="text-[10px] truncate block w-fit">
                          {trade.entry_trigger}
                        </Badge>
                        {trade.exit_reason && (
                          <Badge variant="secondary" className="text-[10px] truncate block w-fit">
                            {trade.exit_reason}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row with Flow Diagram */}
                  {(() => {
                    const shouldExpand = isExpanded;
                    console.log('🔍 Expansion check:', {
                      tradeId: uniqueKey,
                      isExpanded,
                      shouldExpand,
                      expandedTradeKey
                    });
                    return shouldExpand;
                  })() && (
                    <TableRow>
                      <TableCell colSpan={9} className="p-0">
                        <div className="bg-muted/20 p-4 space-y-4 overflow-hidden">
                          {/* Flow Type Toggle */}
                          <div className="flex items-center gap-2">
                            <Workflow className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Execution Flow:</span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={(flowTypes[uniqueKey] || 'entry') === 'entry' ? 'default' : 'outline'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFlowTypes(prev => ({ ...prev, [uniqueKey]: 'entry' }));
                                }}
                                className="h-7 text-xs"
                              >
                                Entry Flow ({trade.entry_flow_ids?.length || 0} nodes)
                              </Button>
                              <Button
                                size="sm"
                                variant={(flowTypes[uniqueKey] || 'entry') === 'exit' ? 'default' : 'outline'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFlowTypes(prev => ({ ...prev, [uniqueKey]: 'exit' }));
                                }}
                                className="h-7 text-xs"
                              >
                                Exit Flow ({trade.exit_flow_ids?.length || 0} nodes)
                              </Button>
                            </div>
                          </div>

                          {/* Debug info - shows flow IDs and resolved nodes count */}
                          {(() => {
                            const currentFlowType = flowTypes[uniqueKey] || 'entry';
                            // Handle exit_flow_ids being array of arrays (Phase 6: multiple partial exits)
                            const flowIds = currentFlowType === 'entry' 
                              ? trade.entry_flow_ids 
                              : (Array.isArray(trade.exit_flow_ids[0]) ? trade.exit_flow_ids[0] : trade.exit_flow_ids) as string[];
                            const resolvedNodes = getFlowNodes(flowIds || []);
                            if (flowIds && flowIds.length > 0 && resolvedNodes.length === 0) {
                              return (
                                <div className="text-xs text-amber-500 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                                  <div>⚠️ {flowIds.length} flow IDs found but 0 nodes resolved</div>
                                  <div className="mt-1 text-muted-foreground">
                                    IDs: {flowIds.slice(0, 3).join(', ')}{flowIds.length > 3 ? '...' : ''}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {/* Flow Diagram - contained scroll */}
                          <div className="w-full overflow-hidden">
                            {(() => {
                              const currentFlowType = flowTypes[uniqueKey] || 'entry';
                              // Handle exit_flow_ids being array of arrays (Phase 6: multiple partial exits)
                              const exitFlowIds = Array.isArray(trade.exit_flow_ids[0]) 
                                ? (trade.exit_flow_ids[0] as string[]) 
                                : (trade.exit_flow_ids as string[]);
                              return (
                                <TradeFlowDiagram
                                  nodes={getFlowNodes(
                                    currentFlowType === 'entry' 
                                      ? (trade.entry_flow_ids || [])
                                      : (exitFlowIds || [])
                                  )}
                                  onNodeClick={onNodeClick}
                                  flowType={currentFlowType}
                                />
                              );
                            })()}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TradesTable;
