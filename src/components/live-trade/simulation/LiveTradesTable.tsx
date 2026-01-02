import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LiveTrade } from '@/types/live-simulation';
import { cn } from '@/lib/utils';

interface LiveTradesTableProps {
  trades: LiveTrade[];
}

const LiveTradesTable: React.FC<LiveTradesTableProps> = ({ trades }) => {
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  const getTradeStatus = (pnl: number) => {
    if (pnl > 0) return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Win</Badge>;
    if (pnl < 0) return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Loss</Badge>;
    return <Badge className="bg-muted text-muted-foreground">Flat</Badge>;
  };

  const parseSymbol = (symbol: string) => {
    const parts = symbol.split(':');
    if (parts.length >= 5) {
      return {
        underlying: parts[0],
        strike: parts[3],
        optionType: parts[4],
      };
    }
    return { underlying: symbol, strike: '', optionType: '' };
  };

  if (trades.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No completed trades yet</p>
        <p className="text-sm">Trades will appear here as positions are closed</p>
      </div>
    );
  }

  // Sort trades by exit time descending (most recent first)
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(b.exit_time).getTime() - new Date(a.exit_time).getTime()
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Entry Time</TableHead>
            <TableHead>Exit Time</TableHead>
            <TableHead className="text-right">Entry Price</TableHead>
            <TableHead className="text-right">Exit Price</TableHead>
            <TableHead className="text-right">PNL</TableHead>
            <TableHead className="text-right">PNL %</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Exit Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTrades.map((trade) => {
            const symbolInfo = parseSymbol(trade.symbol);
            
            return (
              <TableRow
                key={trade.position_id}
                className={cn(
                  trade.pnl > 0 ? 'border-l-2 border-l-green-500' : 
                  trade.pnl < 0 ? 'border-l-2 border-l-red-500' : ''
                )}
              >
                <TableCell>
                  <div>
                    <span className="font-medium">{symbolInfo.underlying}</span>
                    {symbolInfo.strike && (
                      <span className="text-muted-foreground ml-1">
                        {symbolInfo.strike} {symbolInfo.optionType}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={trade.side === 'BUY' ? 'default' : 'secondary'}>
                    {trade.side}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{formatTime(trade.entry_time)}</TableCell>
                <TableCell className="text-sm">{formatTime(trade.exit_time)}</TableCell>
                <TableCell className="text-right">₹{trade.entry_price.toFixed(2)}</TableCell>
                <TableCell className="text-right">₹{trade.exit_price.toFixed(2)}</TableCell>
                <TableCell
                  className={cn(
                    'text-right font-medium',
                    trade.pnl > 0 ? 'text-green-500' : trade.pnl < 0 ? 'text-red-500' : ''
                  )}
                >
                  ₹{trade.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right text-sm',
                    trade.pnl_percentage > 0 ? 'text-green-500' : trade.pnl_percentage < 0 ? 'text-red-500' : ''
                  )}
                >
                  {trade.pnl_percentage.toFixed(2)}%
                </TableCell>
                <TableCell className="text-center">{getTradeStatus(trade.pnl)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {trade.exit_reason || '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default LiveTradesTable;
