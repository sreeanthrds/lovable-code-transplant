import React, { useState } from 'react';
import { useAppAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { localApiService } from '@/lib/api/local-api-service';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Play, TestTube } from 'lucide-react';

const BacktestExecutor: React.FC = () => {
  const { user } = useAppAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const executeMockBacktest = () => {
    setLoading(true);
    setResults(null);
    setError(null);

    // Simulate API delay
    setTimeout(() => {
      const mockResults = {
        status: "completed",
        strategy_id: "93ed16bc-122b-4e01-8421-2f849287d74c",
        start_date: "01-12-2024",
        end_date: "31-12-2024",
        user_id: user?.id || "demo-user",
        performance: {
          total_return: 15.45,
          win_rate: 68.2,
          sharpe_ratio: 1.85,
          max_drawdown: -8.3,
          total_trades: 127,
          profit_factor: 1.78
        },
        trades: [
          { id: 1, symbol: "AAPL", entry: 150.25, exit: 155.80, pnl: 555, date: "2024-12-15" },
          { id: 2, symbol: "MSFT", entry: 380.45, exit: 375.20, pnl: -525, date: "2024-12-18" },
          { id: 3, symbol: "GOOGL", entry: 2845.30, exit: 2920.15, pnl: 748, date: "2024-12-22" }
        ],
        equity_curve: [
          { date: "2024-12-01", value: 100000 },
          { date: "2024-12-15", value: 105550 },
          { date: "2024-12-31", value: 115450 }
        ]
      };

      setResults(mockResults);
      setLoading(false);
      toast({
        title: "Mock Backtest completed!",
        description: "Demo results generated successfully",
      });
    }, 2000);
  };

  const executeBacktest = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to run backtest",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResults(null);
    setError(null);
    
    try {
      const payload = {
        start_date: "01-12-2024",
        end_date: "31-12-2024",
        user_id: user.id,
        strategy_id: "93ed16bc-122b-4e01-8421-2f849287d74c"
      };

      console.log('Sending backtest payload:', payload);
      
      const response = await localApiService.runBacktest(payload);

      if (response.success) {
        setResults(response.data);
        setError(null);
        toast({
          title: "Backtest completed successfully!",
          description: "Results are displayed below",
        });
      } else {
        setError(response.error || "Unknown error occurred");
        toast({
          title: "Backtest failed",
          description: response.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Backtest error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Connection failed: ${errorMessage}`);
      toast({
        title: "Connection error",
        description: "API endpoint not reachable. Try mock data instead.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const executeSimpleBacktest = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    
    try {
      console.log('Calling /backtest endpoint...');
      
      const response = await localApiService.getBacktest();

      if (response.success) {
        setResults(response.data);
        setError(null);
        toast({
          title: "Backtest endpoint called successfully!",
          description: "Results from /backtest endpoint",
        });
      } else {
        setError(response.error || "Unknown error occurred");
        toast({
          title: "Backtest failed",
          description: response.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Backtest error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Connection failed: ${errorMessage}`);
      toast({
        title: "Connection error",
        description: "API endpoint not reachable.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Backtest Executor</CardTitle>
          <CardDescription>Execute backtest and view results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={executeBacktest} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Backtest...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Execute Real Backtest
                </>
              )}
            </Button>
            
            <Button 
              onClick={executeSimpleBacktest} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calling /backtest...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Call /backtest
                </>
              )}
            </Button>
            
            <Button 
              onClick={executeMockBacktest} 
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Mock Data...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Try Mock Data
                </>
              )}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Payload being sent:</strong></p>
            <div className="bg-muted p-2 rounded text-xs font-mono">
              {JSON.stringify({
                start_date: "01-12-2024",
                end_date: "31-12-2024", 
                user_id: user?.id || "user_2yfjTGEKjL7XkklQyBaMP6SN2Lc",
                strategy_id: "93ed16bc-122b-4e01-8421-2f849287d74c"
              }, null, 2)}
            </div>
            <div className="text-xs space-y-1">
              <div>
                <Badge variant="outline" className="mr-2">Endpoint 1:</Badge>
                https://8d487e14275e.ngrok-free.app/backtest/range/optimized
              </div>
              <div>
                <Badge variant="outline" className="mr-2">Endpoint 2:</Badge>
                https://8d487e14275e.ngrok-free.app/backtest
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>Failed to execute backtest</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{error}</p>
            <div className="mt-4 p-3 bg-muted rounded text-xs">
              <p><strong>Troubleshooting:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Make sure the ngrok tunnel is running</li>
                <li>Verify the API server is accessible at the endpoint</li>
                <li>Check if the ngrok URL has changed</li>
                <li>Try the mock data button to test the UI</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Backtest Results</CardTitle>
            <CardDescription>Strategy performance from 01-12-2024 to 31-12-2024</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BacktestExecutor;