import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Loader2, 
  ChevronRight,
  AlertCircle,
  Clock
} from 'lucide-react';
import { DayResult } from '@/types/backtest-session';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface DailyResultsListProps {
  results: DayResult[];
  selectedDate: string | null;
  loadingDate: string | null;
  onSelectDay: (date: string) => void;
}

const DailyResultsList: React.FC<DailyResultsListProps> = ({
  results,
  selectedDate,
  loadingDate,
  onSelectDay,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatPnl = (pnl: string) => {
    const value = parseFloat(pnl);
    return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
  };

  const getPnlColor = (pnl: string) => {
    const value = parseFloat(pnl);
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getStatusBadge = (result: DayResult) => {
    switch (result.status) {
      case 'running':
        return (
          <Badge variant="outline" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="gap-1">
            {result.summary.total_trades} trades
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No daily results yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Daily Results
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-border">
            {results.map((result) => {
              const isSelected = selectedDate === result.date;
              const isLoading = loadingDate === result.date;
              
              return (
                <Button
                  key={result.date}
                  variant="ghost"
                  className={cn(
                    "w-full justify-between rounded-none h-auto py-4 px-4 border-l-4 transition-all duration-300",
                    // Default border
                    "border-l-transparent",
                    // Selected state - solid primary border
                    isSelected && "border-l-primary",
                    // Loading state - animated pulsing border
                    isLoading && "border-l-primary animate-pulse",
                    // Non-completed items dimmed
                    result.status !== 'completed' && "opacity-60",
                    // Hover effect
                    result.has_detail_data && !isLoading && "hover:border-l-primary/50"
                  )}
                  onClick={() => result.has_detail_data && !isLoading && onSelectDay(result.date)}
                  disabled={!result.has_detail_data || isLoading}
                >
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <p className="font-medium">{formatDate(result.date)}</p>
                    <p className="text-xs text-muted-foreground">
                      Day {result.day_number}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Show summary data if available, regardless of status */}
                  {result.summary && (result.summary.total_trades > 0 || parseFloat(result.summary.total_pnl || '0') !== 0) && (
                    <div className="text-right">
                      <p className={cn("font-medium", getPnlColor(result.summary.total_pnl))}>
                        {parseFloat(result.summary.total_pnl) >= 0 ? (
                          <TrendingUp className="inline h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="inline h-4 w-4 mr-1" />
                        )}
                        {formatPnl(result.summary.total_pnl)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.summary.win_rate}% win rate
                      </p>
                    </div>
                  )}

                  {getStatusBadge(result)}

                  {loadingDate === result.date ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : result.has_detail_data ? (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  ) : null}
                </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DailyResultsList;
