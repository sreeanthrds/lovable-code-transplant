import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Position } from '@/types/live-trading-websocket';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PositionsListProps {
  positions: Position[];
}

export function PositionsList({ positions }: PositionsListProps) {
  if (positions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No open positions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Open Positions ({positions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {positions.map((position, index) => {
            const isProfitable = position.pnl >= 0;
            const priceChange = position.current_price - position.entry_price;
            const priceChangePercent = (priceChange / position.entry_price) * 100;

            return (
              <div 
                key={index}
                className="p-4 rounded-lg border bg-card hover:bg-card/80 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{position.symbol}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={position.side === 'BUY' ? 'default' : 'secondary'}
                        className={position.side === 'BUY' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }
                      >
                        {position.side}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Qty: {position.quantity}
                      </span>
                    </div>
                  </div>
                  
                  {/* P&L */}
                  <div className="text-right">
                    <div className={`text-lg font-bold flex items-center gap-1 ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                      {isProfitable ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {isProfitable ? '+' : ''}{position.pnl.toFixed(2)}
                    </div>
                    <p className={`text-xs ${isProfitable ? 'text-green-400/70' : 'text-red-400/70'}`}>
                      {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Entry Price</p>
                    <p className="text-sm font-medium text-foreground">{position.entry_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Price</p>
                    <p className="text-sm font-medium text-foreground">{position.current_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Change</p>
                    <p className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
