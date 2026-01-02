import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trade } from '@/types/live-trading-websocket';
import { formatDistanceToNow } from 'date-fns';

interface TradeHistoryProps {
  trades: Trade[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trade History</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No trades executed yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Trade History ({trades.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {trades.map((trade) => (
            <div 
              key={trade.id}
              className="p-3 rounded-lg border bg-card hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{trade.symbol}</span>
                  <Badge 
                    variant={trade.side === 'BUY' ? 'default' : 'secondary'}
                    className={trade.side === 'BUY' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }
                  >
                    {trade.side}
                  </Badge>
                  <Badge 
                    variant={
                      trade.status === 'executed' ? 'default' : 
                      trade.status === 'pending' ? 'secondary' : 
                      'destructive'
                    }
                  >
                    {trade.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true })}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">Qty: </span>
                  <span className="font-medium text-foreground">{trade.quantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Price: </span>
                  <span className="font-medium text-foreground">₹{trade.price.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total: </span>
                  <span className="font-medium text-foreground">
                    ₹{(trade.quantity * trade.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
