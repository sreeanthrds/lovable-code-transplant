
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Info } from "lucide-react";

const BacktestingDoc = () => {
  return (
    <div>
      <h1>Backtesting Documentation</h1>
      <p className="lead">Learn how to validate your trading strategies with our comprehensive backtesting tools.</p>
      
      <Alert className="my-4 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-600 dark:text-blue-400">Pro Tip</AlertTitle>
        <AlertDescription className="text-blue-600/90 dark:text-blue-400/90">
          Always backtest your strategies across different market conditions to ensure robustness.
        </AlertDescription>
      </Alert>
      
      <h2 className="mt-6">Getting Started with Backtesting</h2>
      <p>
        Backtesting is a critical phase in strategy development that allows you to simulate how your trading strategy would have performed in the past. This helps you assess the viability of your strategy before risking real capital.
      </p>
      
      <Tabs defaultValue="setup" className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="execution">Execution</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="setup" className="py-4">
          <h3 className="text-xl font-semibold mb-3">Setting Up Your Backtest</h3>
          <p className="mb-4">To set up a backtest for your strategy, follow these steps:</p>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>Finalize your strategy in the Strategy Builder</li>
            <li>Navigate to the Backtesting module</li>
            <li>Select the strategy you want to test</li>
            <li>Configure the test period and data resolution</li>
            <li>Set your initial capital and commission structure</li>
            <li>Choose which metrics you want to track</li>
          </ol>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Required Components</CardTitle>
              <CardDescription>Ensure your strategy has these elements before backtesting</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                <li>At least one Start node with a defined instrument</li>
                <li>Properly connected signal nodes</li>
                <li>Entry and exit action nodes</li>
                <li>Complete logic flow from start to end</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="parameters" className="py-4">
          <h3 className="text-xl font-semibold mb-3">Key Backtesting Parameters</h3>
          <p className="mb-4">Understanding and correctly setting these parameters is crucial for accurate backtesting:</p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Time Period Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="font-medium">Start Date</dt>
                    <dd className="text-muted-foreground">The beginning of your backtest period</dd>
                  </div>
                  <div>
                    <dt className="font-medium">End Date</dt>
                    <dd className="text-muted-foreground">The ending of your backtest period</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Data Resolution</dt>
                    <dd className="text-muted-foreground">Timeframe for candles (1m, 5m, 15m, 1h, 1d, etc.)</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Capital Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="font-medium">Initial Capital</dt>
                    <dd className="text-muted-foreground">Starting amount for your backtest</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Position Sizing</dt>
                    <dd className="text-muted-foreground">Fixed amount, percentage, or risk-based allocation</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Max Open Positions</dt>
                    <dd className="text-muted-foreground">Maximum number of simultaneous trades</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Cost Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="font-medium">Commission Model</dt>
                  <dd className="text-muted-foreground">Fixed fee, percentage, or tiered structure</dd>
                </div>
                <div>
                  <dt className="font-medium">Slippage Model</dt>
                  <dd className="text-muted-foreground">Fixed pips, percentage, or volume-based model</dd>
                </div>
                <div>
                  <dt className="font-medium">Spread</dt>
                  <dd className="text-muted-foreground">Bid-ask difference (fixed or variable)</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="execution" className="py-4">
          <h3 className="text-xl font-semibold mb-3">Executing Your Backtest</h3>
          <p className="mb-4">Once your parameters are set, follow these steps to run your backtest:</p>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>Review all your settings for accuracy</li>
            <li>Click the "Run Backtest" button to start</li>
            <li>Wait for the backtest to complete (time varies with strategy complexity)</li>
            <li>Review the summary results displayed after completion</li>
            <li>Drill down into detailed metrics as needed</li>
          </ol>
          
          <Alert className="my-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
            <AlertTitle className="text-yellow-600 dark:text-yellow-400">Performance Note</AlertTitle>
            <AlertDescription className="text-yellow-600/90 dark:text-yellow-400/90">
              Complex strategies or very large data sets may take several minutes to backtest. The progress bar will indicate the current status.
            </AlertDescription>
          </Alert>
          
          <h4 className="text-lg font-semibold mt-6 mb-3">Execution Models</h4>
          <p className="mb-3">We offer several execution models for more realistic backtesting:</p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Standard Model</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Executes trades at the specified price without accounting for liquidity or market impact
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Realistic Model</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Includes slippage and delayed execution for more accurate results
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Next Bar Model</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Executes trades on the open of the next bar to avoid look-ahead bias
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Advanced Model</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Includes market impact, partial fills, and realistic order book simulation
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="py-4">
          <h3 className="text-xl font-semibold mb-3">Analyzing Backtest Results</h3>
          <p className="mb-4">
            After your backtest completes, you'll have access to comprehensive analytics to evaluate strategy performance:
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Total Return (absolute and %)</li>
                  <li>Annualized Return</li>
                  <li>Volatility</li>
                  <li>Sharpe Ratio</li>
                  <li>Sortino Ratio</li>
                  <li>Maximum Drawdown</li>
                  <li>Recovery Factor</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Trade Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Win Rate (%)</li>
                  <li>Average Win/Loss</li>
                  <li>Profit Factor</li>
                  <li>Expectancy</li>
                  <li>Number of Trades</li>
                  <li>Average Holding Period</li>
                  <li>Maximum Consecutive Wins/Losses</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Visual Analytics</CardTitle>
              <CardDescription>Charts and visualizations to understand performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Equity Curve</li>
                <li>Drawdown Chart</li>
                <li>Monthly/Weekly Returns Heatmap</li>
                <li>Trade Distribution</li>
                <li>Win/Loss Distribution</li>
                <li>Profit/Loss by Market Condition</li>
                <li>Performance by Time of Day</li>
              </ul>
            </CardContent>
          </Card>
          
          <h4 className="text-lg font-semibold mt-6 mb-3">Interpreting Results</h4>
          <p className="mb-3">When analyzing your results, consider these key factors:</p>
          
          <div className="grid gap-4 mt-4">
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md border border-green-200 dark:border-green-900">
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-1">Implement</h4>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Consistent profitability across different market conditions</li>
                <li>Acceptable drawdowns relative to returns</li>
                <li>High Sharpe and Sortino ratios</li>
                <li>Sufficient number of trades for statistical significance</li>
                <li>Results align with your risk tolerance and goals</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-900">
              <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">Modify</h4>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Positive returns but high drawdowns</li>
                <li>Good concept but inconsistent results</li>
                <li>Overly sensitive to parameters</li>
                <li>Seasonal or market-dependent performance</li>
                <li>Too few trades for statistical significance</li>
              </ul>
            </div>
            
            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-900">
              <h4 className="font-medium text-red-700 dark:text-red-400 mb-1">Reject</h4>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Negative returns after costs</li>
                <li>Unacceptable drawdowns</li>
                <li>No clear edge over buy-and-hold</li>
                <li>Poor risk-adjusted metrics</li>
                <li>Works in backtests but fails forward testing</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-8" />
      
      <h2>Advanced Backtesting Techniques</h2>
      <p className="mb-4">
        Once you're comfortable with basic backtesting, explore these advanced techniques for more robust evaluation:
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Walk-Forward Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">
              Optimizes parameters on one segment of data and validates on the next, moving forward through time to test adaptability.
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Divide your data into segments</li>
              <li>Optimize on segment 1, test on segment 2</li>
              <li>Optimize on segment 2, test on segment 3</li>
              <li>Continue through all segments</li>
              <li>Analyze out-of-sample performance</li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monte Carlo Simulation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">
              Randomizes trade sequence to understand the range of possible outcomes and strategy robustness.
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Run your backtest to get trade results</li>
              <li>Randomize the order of trades</li>
              <li>Create thousands of possible equity curves</li>
              <li>Analyze the distribution of outcomes</li>
              <li>Calculate probability of drawdowns and returns</li>
            </ol>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Multi-Market Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-3">
            Test your strategy across different markets and asset classes to ensure it's not over-optimized.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-md p-3">
              <h4 className="font-medium mb-2">Forex Markets</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
                <li>Major pairs (EUR/USD, GBP/USD)</li>
                <li>Cross pairs (EUR/GBP, AUD/NZD)</li>
                <li>Exotic pairs (USD/TRY, EUR/PLN)</li>
              </ul>
            </div>
            <div className="border rounded-md p-3">
              <h4 className="font-medium mb-2">Stock Markets</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
                <li>Large cap stocks</li>
                <li>Sector ETFs</li>
                <li>Stock indices (S&P 500, NASDAQ)</li>
              </ul>
            </div>
            <div className="border rounded-md p-3">
              <h4 className="font-medium mb-2">Commodity Markets</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
                <li>Precious metals (Gold, Silver)</li>
                <li>Energy products (Oil, Natural Gas)</li>
                <li>Agricultural products</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BacktestingDoc;
