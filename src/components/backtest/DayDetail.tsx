import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DayDetailResponse, Position } from '@/lib/api/backtest-api';
import { cn } from '@/lib/utils';
import TradeDetail from './TradeDetail';

interface DayDetailProps {
  detail: DayDetailResponse;
}

const DayDetail: React.FC<DayDetailProps> = ({ detail }) => {
  const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set());

  const toggleTrade = (positionId: string) => {
    setExpandedTrades(prev => {
      const next = new Set(prev);
      if (next.has(positionId)) {
        next.delete(positionId);
      } else {
        next.add(positionId);
      }
      return next;
    });
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getTradeStatus = (pnl: number) => {
    if (pnl > 0) return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Win</Badge>;
    if (pnl < 0) return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Loss</Badge>;
    return <Badge className="bg-muted text-muted-foreground">Flat</Badge>;
  };

  const parseSymbol = (symbol: string) => {
    // NIFTY:2024-11-07:OPT:24300:CE
    const parts = symbol.split(':');
    if (parts.length >= 5) {
      return {
        underlying: parts[0],
        expiry: parts[1],
        type: parts[2],
        strike: parts[3],
        optionType: parts[4],
      };
    }
    return { underlying: symbol, expiry: '', type: '', strike: '', optionType: '' };
  };

  const getEntryPrice = (position: Position): number | null => {
    return position.entry_price ?? position.entry?.price ?? position.entry?.contract_ltp ?? null;
  };

  const getExitPrice = (position: Position): number | null => {
    return position.exit_price ?? position.exit?.price ?? position.exit?.contract_ltp ?? null;
  };

  const getSpotAtEntry = (position: Position): number | null => {
    return position.nifty_spot_at_entry ?? position.entry?.nifty_spot ?? null;
  };

  const getSpotAtExit = (position: Position): number | null => {
    return position.nifty_spot_at_exit ?? position.exit?.nifty_spot ?? null;
  };

  return (
    <div className="p-4">
      {/* Day Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3 mb-4 p-3 bg-background rounded-lg">
        <div>
          <p className="text-xs text-muted-foreground">Total Trades</p>
          <p className="font-medium">{detail.summary.total_positions || 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Winning</p>
          <p className="font-medium text-green-500">{detail.summary.winning_trades || 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Losing</p>
          <p className="font-medium text-red-500">{detail.summary.losing_trades || 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Breakeven</p>
          <p className="font-medium text-muted-foreground">{detail.summary.breakeven_trades || 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Win Rate</p>
          <p className="font-medium">{(detail.summary.win_rate || 0).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total PNL</p>
          <p className={cn(
            'font-medium',
            detail.summary.total_pnl > 0 ? 'text-green-500' : detail.summary.total_pnl < 0 ? 'text-red-500' : ''
          )}>
            ₹{(detail.summary.total_pnl || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        {detail.summary.avg_win !== undefined && (
          <div>
            <p className="text-xs text-muted-foreground">Avg Win</p>
            <p className="font-medium text-green-500">₹{(detail.summary.avg_win || 0).toFixed(2)}</p>
          </div>
        )}
        {detail.summary.avg_loss !== undefined && (
          <div>
            <p className="text-xs text-muted-foreground">Avg Loss</p>
            <p className="font-medium text-red-500">₹{(detail.summary.avg_loss || 0).toFixed(2)}</p>
          </div>
        )}
        {detail.summary.largest_win !== undefined && (
          <div>
            <p className="text-xs text-muted-foreground">Largest Win</p>
            <p className="font-medium text-green-500">₹{(detail.summary.largest_win || 0).toFixed(2)}</p>
          </div>
        )}
        {detail.summary.largest_loss !== undefined && (
          <div>
            <p className="text-xs text-muted-foreground">Largest Loss</p>
            <p className="font-medium text-red-500">₹{(detail.summary.largest_loss || 0).toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Trades Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Entry Time</TableHead>
              <TableHead>Exit Time</TableHead>
              <TableHead className="text-right">Entry Price</TableHead>
              <TableHead className="text-right">Exit Price</TableHead>
              <TableHead className="text-right">Spot Entry</TableHead>
              <TableHead className="text-right">Spot Exit</TableHead>
              <TableHead className="text-right">PNL</TableHead>
              <TableHead className="text-right">PNL %</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detail.positions.map((position) => {
              const symbolInfo = parseSymbol(position.symbol);
              const entryPrice = getEntryPrice(position);
              const exitPrice = getExitPrice(position);
              const spotEntry = getSpotAtEntry(position);
              const spotExit = getSpotAtExit(position);
              
              return (
                <React.Fragment key={position.position_id}>
                  <TableRow
                    className={cn(
                      'cursor-pointer hover:bg-muted/50 transition-colors',
                      expandedTrades.has(position.position_id) && 'bg-muted/30',
                      position.pnl > 0 ? 'border-l-2 border-l-green-500' : 
                      position.pnl < 0 ? 'border-l-2 border-l-red-500' : ''
                    )}
                    onClick={() => toggleTrade(position.position_id)}
                  >
                    <TableCell className="w-8">
                      {expandedTrades.has(position.position_id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{symbolInfo.underlying}</span>
                        {symbolInfo.strike && (
                          <span className="text-muted-foreground ml-1">
                            {symbolInfo.strike} {symbolInfo.optionType}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {position.re_entry_num > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Re-entry #{position.re_entry_num}
                          </Badge>
                        )}
                        {position.quantity && (
                          <Badge variant="secondary" className="text-xs">
                            Qty: {position.quantity}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {position.side && (
                        <Badge variant={position.side === 'BUY' ? 'default' : 'secondary'}>
                          {position.side}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{formatTime(position.entry_time)}</TableCell>
                    <TableCell className="text-sm">{formatTime(position.exit_time)}</TableCell>
                    <TableCell className="text-right">
                      {entryPrice !== null ? `₹${entryPrice.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {exitPrice !== null ? `₹${exitPrice.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {spotEntry !== null ? spotEntry.toFixed(2) : '-'}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {spotExit !== null ? spotExit.toFixed(2) : '-'}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        position.pnl > 0 ? 'text-green-500' : position.pnl < 0 ? 'text-red-500' : ''
                      )}
                    >
                      ₹{position.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right text-sm',
                        position.pnl > 0 ? 'text-green-500' : position.pnl < 0 ? 'text-red-500' : ''
                      )}
                    >
                      {position.pnl_percentage !== undefined ? `${position.pnl_percentage.toFixed(2)}%` : '-'}
                    </TableCell>
                    <TableCell className="text-center">{getTradeStatus(position.pnl)}</TableCell>
                  </TableRow>
                  {expandedTrades.has(position.position_id) && (
                    <TableRow>
                      <TableCell colSpan={12} className="p-0 bg-muted/10">
                        <TradeDetail position={position} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DayDetail;
