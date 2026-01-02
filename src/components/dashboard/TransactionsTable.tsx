
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Transaction } from '@/components/strategy/backtesting/types';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TransactionsTableProps {
  transactions: Transaction[];
}

const TransactionsTable = ({ transactions }: TransactionsTableProps) => {
  const [sortField, setSortField] = useState<keyof Transaction>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<'all' | 'entry' | 'exit'>('all');
  
  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  const getExitReasonBadge = (reason?: string) => {
    if (!reason) return null;
    
    const colors: Record<string, string> = {
      take_profit: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      stop_loss: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      trailing_stop: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      manual: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      strategy_end: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    
    const labels: Record<string, string> = {
      take_profit: 'Take Profit',
      stop_loss: 'Stop Loss',
      trailing_stop: 'Trailing Stop',
      manual: 'Manual Exit',
      strategy_end: 'Strategy End'
    };
    
    return (
      <Badge variant="outline" className={colors[reason]}>
        {labels[reason] || reason}
      </Badge>
    );
  };
  
  // Apply sorting and filtering
  const filteredTransactions = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  
  const SortIcon = ({ field }: { field: keyof Transaction }) => (
    <>
      {sortField === field && (
        sortDirection === 'asc' ? (
          <ChevronUp className="ml-1 h-4 w-4 inline" />
        ) : (
          <ChevronDown className="ml-1 h-4 w-4 inline" />
        )
      )}
    </>
  );
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              All trades executed during the backtest period
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge 
              variant={filter === 'all' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setFilter('all')}
            >
              All
            </Badge>
            <Badge 
              variant={filter === 'entry' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setFilter('entry')}
            >
              Entries
            </Badge>
            <Badge 
              variant={filter === 'exit' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setFilter('exit')}
            >
              Exits
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('timestamp')}
                >
                  Date <SortIcon field="timestamp" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('type')}
                >
                  Type <SortIcon field="type" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('symbol')}
                >
                  Symbol <SortIcon field="symbol" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('side')}
                >
                  Side <SortIcon field="side" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  Price <SortIcon field="price" />
                </TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('pnl')}
                >
                  P/L <SortIcon field="pnl" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.timestamp), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === 'entry' ? 'secondary' : 'default'}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.symbol}</TableCell>
                  <TableCell>
                    <span className={transaction.side === 'buy' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.side.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(transaction.price)}</TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>
                    {transaction.type === 'exit' ? (
                      <div className="space-y-1">
                        <div className={transaction.pnl && transaction.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {transaction.pnl !== undefined ? formatCurrency(transaction.pnl) : '-'}
                          {transaction.pnlPercentage !== undefined && 
                            ` (${transaction.pnlPercentage >= 0 ? '+' : ''}${transaction.pnlPercentage.toFixed(2)}%)`
                          }
                        </div>
                        {transaction.exitReason && (
                          <div>{getExitReasonBadge(transaction.exitReason)}</div>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsTable;
