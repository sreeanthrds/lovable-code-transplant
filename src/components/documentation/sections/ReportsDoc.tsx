import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, BarChart, Info } from 'lucide-react';

const ReportsDoc: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
      
      <p className="text-muted-foreground">
        After backtesting a strategy, the Reports & Analytics module provides comprehensive visualizations
        and detailed metrics to help you analyze performance and make data-driven decisions about your strategy.
      </p>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Results Dashboard Overview</h2>
        <p>
          The Results Dashboard is organized into several tabs, each focusing on different aspects of your strategy's performance:
        </p>
        
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="performance">Performance Charts</TabsTrigger>
            <TabsTrigger value="trades">Trade Analysis</TabsTrigger>
            <TabsTrigger value="metrics">Advanced Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4 mt-4">
            <p>
              The Summary tab provides a high-level overview of your strategy's performance:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium text-muted-foreground">Total Return:</div>
                    <div>+25.63%</div>
                    <div className="font-medium text-muted-foreground">Annual Return:</div>
                    <div>+18.21%</div>
                    <div className="font-medium text-muted-foreground">Sharpe Ratio:</div>
                    <div>1.45</div>
                    <div className="font-medium text-muted-foreground">Max Drawdown:</div>
                    <div>-12.36%</div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    This section displays key performance metrics for quick evaluation of your strategy.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Trade Statistics</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium text-muted-foreground">Total Trades:</div>
                    <div>78</div>
                    <div className="font-medium text-muted-foreground">Win Rate:</div>
                    <div>62.8%</div>
                    <div className="font-medium text-muted-foreground">Profit Factor:</div>
                    <div>2.31</div>
                    <div className="font-medium text-muted-foreground">Avg. Trade:</div>
                    <div>+0.85%</div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    Overview of trading activity and success rates.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Risk Metrics</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium text-muted-foreground">Volatility:</div>
                    <div>14.3%</div>
                    <div className="font-medium text-muted-foreground">Sortino Ratio:</div>
                    <div>1.82</div>
                    <div className="font-medium text-muted-foreground">Calmar Ratio:</div>
                    <div>1.47</div>
                    <div className="font-medium text-muted-foreground">Max Drawdown Duration:</div>
                    <div>47 days</div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    Measures of risk and risk-adjusted performance.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Summary Chart</h3>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <LineChart className="h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mt-2">Equity Curve Visualization</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The equity curve shows your strategy's growth over time, with optional benchmark comparison and drawdown visualization.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Backtest Settings Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-medium text-muted-foreground">Date Range:</div>
                    <div className="col-span-2">Jan 1, 2023 - Dec 31, 2023</div>
                    <div className="font-medium text-muted-foreground">Initial Capital:</div>
                    <div className="col-span-2">$100,000</div>
                    <div className="font-medium text-muted-foreground">Instrument:</div>
                    <div className="col-span-2">NIFTY50</div>
                    <div className="font-medium text-muted-foreground">Timeframe:</div>
                    <div className="col-span-2">Daily</div>
                    <div className="font-medium text-muted-foreground">Commission:</div>
                    <div className="col-span-2">0.05% per trade</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Strategy Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-medium text-muted-foreground">Strategy Name:</div>
                    <div className="col-span-2">MA Crossover with RSI Filter</div>
                    <div className="font-medium text-muted-foreground">Created:</div>
                    <div className="col-span-2">Mar 15, 2024</div>
                    <div className="font-medium text-muted-foreground">Modified:</div>
                    <div className="col-span-2">Apr 2, 2024</div>
                    <div className="font-medium text-muted-foreground">Backtest ID:</div>
                    <div className="col-span-2">BT-2024040-32145</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4 mt-4">
            <p>
              The Performance Charts tab provides detailed visualizations of your strategy's performance over time:
            </p>
            
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Equity & Drawdown Chart</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="aspect-[3/2] bg-muted rounded-md flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <LineChart className="h-10 w-10 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mt-2">Detailed Equity Growth Visualization</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>Field Descriptions:</strong>
                  </p>
                  <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                    <li><strong>Main Chart (top):</strong> Equity curve showing account balance over time</li>
                    <li><strong>Benchmark Comparison:</strong> Optional overlay of market index for reference</li>
                    <li><strong>Underwater Chart (bottom):</strong> Drawdown visualization showing depths of declines from peaks</li>
                    <li><strong>Annotations:</strong> Trade markers showing entry and exit points on the equity curve</li>
                    <li><strong>Controls:</strong> Zoom levels, time period selection, chart type options, overlay selection</li>
                  </ul>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Monthly Returns</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <BarChart className="h-10 w-10 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground mt-2">Monthly Performance Heatmap</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Field Descriptions:</strong>
                    </p>
                    <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                      <li><strong>Heatmap Grid:</strong> Months (rows) vs. Years (columns)</li>
                      <li><strong>Color Intensity:</strong> Indicates performance level (green for positive, red for negative)</li>
                      <li><strong>Value Labels:</strong> Percentage returns for each month</li>
                      <li><strong>Summary Row/Column:</strong> Average performance by month and year</li>
                      <li><strong>Controls:</strong> Toggle between percentage and absolute values</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Drawdown Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <BarChart className="h-10 w-10 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground mt-2">Drawdown Duration & Depth Chart</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Field Descriptions:</strong>
                    </p>
                    <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                      <li><strong>Bar Chart:</strong> Top drawdowns by magnitude</li>
                      <li><strong>X-axis:</strong> Duration in trading days</li>
                      <li><strong>Y-axis:</strong> Drawdown percentage (depth)</li>
                      <li><strong>Table View:</strong> Start date, end date, depth, duration, recovery time</li>
                      <li><strong>Controls:</strong> Toggle between biggest drawdowns and all drawdowns</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Rolling Returns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="aspect-[3/2] bg-muted rounded-md flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <LineChart className="h-10 w-10 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mt-2">Rolling Performance Metrics</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>Field Descriptions:</strong>
                  </p>
                  <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                    <li><strong>Chart Type:</strong> Line chart showing rolling period metrics</li>
                    <li><strong>Period Selector:</strong> 20-day, 60-day, 90-day, 6-month, 1-year rolling windows</li>
                    <li><strong>Metric Selector:</strong> Return, Sharpe Ratio, Win Rate, Drawdown</li>
                    <li><strong>Controls:</strong> Time period selection, metric selection, comparison overlay</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trades" className="space-y-4 mt-4">
            <p>
              The Trade Analysis tab provides detailed information about individual trades and trading patterns:
            </p>
            
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Trade List</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="border rounded-md overflow-hidden">
                    <div className="grid grid-cols-7 gap-2 bg-muted px-4 py-2 text-xs font-medium">
                      <div>#</div>
                      <div>Entry Date</div>
                      <div>Exit Date</div>
                      <div>Direction</div>
                      <div>Size</div>
                      <div>P/L</div>
                      <div>Exit Type</div>
                    </div>
                    <div className="px-4 py-2 text-xs border-t">
                      <div className="grid grid-cols-7 gap-2">
                        <div>1</div>
                        <div>2023-01-12</div>
                        <div>2023-01-28</div>
                        <div>Long</div>
                        <div>10 lots</div>
                        <div className="text-green-500">+3.45%</div>
                        <div>Take Profit</div>
                      </div>
                    </div>
                    <div className="px-4 py-2 text-xs border-t bg-muted/50">
                      <div className="grid grid-cols-7 gap-2">
                        <div>2</div>
                        <div>2023-02-03</div>
                        <div>2023-02-17</div>
                        <div>Short</div>
                        <div>8 lots</div>
                        <div className="text-red-500">-1.20%</div>
                        <div>Stop Loss</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>Field Descriptions:</strong>
                  </p>
                  <ul className="list-disc pl-5 text-xs text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-1">
                    <li><strong>#:</strong> Trade sequence number</li>
                    <li><strong>Entry Date:</strong> Position open date/time</li>
                    <li><strong>Exit Date:</strong> Position close date/time</li>
                    <li><strong>Direction:</strong> Long (buy) or Short (sell)</li>
                    <li><strong>Size:</strong> Position size in lots/contracts/shares</li>
                    <li><strong>Entry Price:</strong> Execution price at entry</li>
                    <li><strong>Exit Price:</strong> Execution price at exit</li>
                    <li><strong>P/L:</strong> Profit/loss (% and absolute value)</li>
                    <li><strong>Duration:</strong> How long position was held</li>
                    <li><strong>Exit Type:</strong> Take profit, stop loss, signal, etc.</li>
                    <li><strong>MAE:</strong> Maximum adverse excursion</li>
                    <li><strong>MFE:</strong> Maximum favorable excursion</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong>Controls:</strong> Search, filter by date/direction/result, sort by any column, export to CSV/Excel
                  </p>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Trade Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <BarChart className="h-10 w-10 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground mt-2">Profit/Loss Distribution Histogram</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Field Descriptions:</strong>
                    </p>
                    <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                      <li><strong>X-axis:</strong> P/L ranges (binned by percentage or currency)</li>
                      <li><strong>Y-axis:</strong> Number of trades in each range</li>
                      <li><strong>Bar Colors:</strong> Green for profitable trades, red for losing trades</li>
                      <li><strong>Distribution Statistics:</strong> Mean, median, standard deviation, skewness</li>
                      <li><strong>Controls:</strong> Toggle between percentage and absolute values, bin size adjustment</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Trade Duration Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <BarChart className="h-10 w-10 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground mt-2">Duration vs. Performance Scatter Plot</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Field Descriptions:</strong>
                    </p>
                    <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                      <li><strong>X-axis:</strong> Trade duration (days/hours)</li>
                      <li><strong>Y-axis:</strong> Trade P/L (percentage or absolute)</li>
                      <li><strong>Data Points:</strong> Individual trades</li>
                      <li><strong>Color Coding:</strong> By direction (long/short) or exit type</li>
                      <li><strong>Trend Line:</strong> Correlation between duration and performance</li>
                      <li><strong>Controls:</strong> Filter by direction, exit type, date range</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">MAE/MFE Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="aspect-[3/2] bg-muted rounded-md flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <LineChart className="h-10 w-10 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mt-2">Maximum Adverse/Favorable Excursion Analysis</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>Field Descriptions:</strong>
                  </p>
                  <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                    <li><strong>MAE:</strong> Maximum adverse excursion - worst point during a trade</li>
                    <li><strong>MFE:</strong> Maximum favorable excursion - best point during a trade</li>
                    <li><strong>X-axis:</strong> MAE or MFE value</li>
                    <li><strong>Y-axis:</strong> Final trade P/L</li>
                    <li><strong>Data Points:</strong> Individual trades</li>
                    <li><strong>Colors:</strong> Winners (green) vs. losers (red)</li>
                    <li><strong>Quadrants:</strong> Analysis of trade management effectiveness</li>
                    <li><strong>Controls:</strong> Toggle between MAE and MFE views, filter by direction</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-4 mt-4">
            <p>
              The Advanced Metrics tab provides detailed statistics and specialized analytics:
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="space-y-1.5">
                        <h4 className="font-medium text-xs">Returns</h4>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="text-muted-foreground">Total:</div>
                          <div>+25.63%</div>
                          <div className="text-muted-foreground">Annual:</div>
                          <div>+18.21%</div>
                          <div className="text-muted-foreground">Monthly:</div>
                          <div>+1.41%</div>
                          <div className="text-muted-foreground">Daily:</div>
                          <div>+0.07%</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <h4 className="font-medium text-xs">Risk</h4>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="text-muted-foreground">Volatility:</div>
                          <div>14.3%</div>
                          <div className="text-muted-foreground">Max DD:</div>
                          <div>-12.36%</div>
                          <div className="text-muted-foreground">Avg DD:</div>
                          <div>-4.2%</div>
                          <div className="text-muted-foreground">DD Duration:</div>
                          <div>47 days</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <h4 className="font-medium text-xs">Risk-Adjusted</h4>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="text-muted-foreground">Sharpe:</div>
                          <div>1.45</div>
                          <div className="text-muted-foreground">Sortino:</div>
                          <div>1.82</div>
                          <div className="text-muted-foreground">Calmar:</div>
                          <div>1.47</div>
                          <div className="text-muted-foreground">UPI:</div>
                          <div>0.68</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <h4 className="font-medium text-xs">Trades</h4>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="text-muted-foreground">Total:</div>
                          <div>78</div>
                          <div className="text-muted-foreground">Win Rate:</div>
                          <div>62.8%</div>
                          <div className="text-muted-foreground">Profit Factor:</div>
                          <div>2.31</div>
                          <div className="text-muted-foreground">Expectancy:</div>
                          <div>1.23%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Metric Definitions</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[320px] overflow-y-auto">
                    <div className="space-y-3 text-xs">
                      <div>
                        <h4 className="font-medium">Sharpe Ratio</h4>
                        <p className="text-muted-foreground">
                          Measures risk-adjusted return by dividing excess return by standard deviation of returns.
                          Higher values indicate better risk-adjusted performance.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Sortino Ratio</h4>
                        <p className="text-muted-foreground">
                          Similar to Sharpe but uses downside deviation instead of standard deviation,
                          focusing only on negative volatility.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Calmar Ratio</h4>
                        <p className="text-muted-foreground">
                          Annual return divided by maximum drawdown. Measures return per unit of drawdown risk.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Profit Factor</h4>
                        <p className="text-muted-foreground">
                          Gross profit divided by gross loss. Values above 1 indicate a profitable strategy.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Strategy Consistency</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <LineChart className="h-10 w-10 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground mt-2">Moving Win Rate & Profit Factor</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Field Descriptions:</strong>
                    </p>
                    <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                      <li><strong>Chart Type:</strong> Line chart with rolling metrics</li>
                      <li><strong>X-axis:</strong> Time or trade sequence</li>
                      <li><strong>Y-axis (Left):</strong> Win rate percentage</li>
                      <li><strong>Y-axis (Right):</strong> Profit factor</li>
                      <li><strong>Rolling Window:</strong> 10, 20, or 30 trades</li>
                      <li><strong>Controls:</strong> Window size selection, metric selection</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Trade Timing Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <BarChart className="h-10 w-10 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground mt-2">Performance by Day/Time</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Field Descriptions:</strong>
                    </p>
                    <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                      <li><strong>Chart Type:</strong> Heatmap or bar chart</li>
                      <li><strong>Time Periods:</strong> Day of week, hour of day, month of year</li>
                      <li><strong>Metrics:</strong> Win rate, average return, trade frequency</li>
                      <li><strong>Color Intensity:</strong> Performance level</li>
                      <li><strong>Controls:</strong> Period selection, metric selection</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Market Regime Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="aspect-[3/2] bg-muted rounded-md flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <LineChart className="h-10 w-10 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mt-2">Performance by Market Condition</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>Field Descriptions:</strong>
                  </p>
                  <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                    <li><strong>Chart Type:</strong> Multi-panel comparison</li>
                    <li><strong>Market Conditions:</strong> Bullish, bearish, sideways, volatile, low volatility</li>
                    <li><strong>Metrics:</strong> Win rate, average return, trade frequency, drawdown</li>
                    <li><strong>Classification Method:</strong> Trend direction, volatility level, market index</li>
                    <li><strong>Controls:</strong> Condition definition settings, metric selection</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Exporting Results</h2>
        <p>
          The Reports & Analytics module offers several export options for further analysis or reporting:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg p-4 border">
            <h3 className="font-medium mb-2">Export Data Tables</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li><strong>Trade List:</strong> Export detailed trade data to CSV or Excel</li>
              <li><strong>Performance Tables:</strong> Export monthly/annual returns</li>
              <li><strong>Metric Summary:</strong> Export all performance metrics</li>
              <li><strong>Format Options:</strong> CSV, Excel, JSON</li>
              <li><strong>Controls:</strong> Field selection, date range filtering</li>
            </ul>
          </div>
          
          <div className="bg-card rounded-lg p-4 border">
            <h3 className="font-medium mb-2">Export Charts</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li><strong>Chart Images:</strong> Download visualizations as images</li>
              <li><strong>Format Options:</strong> PNG, JPG, SVG</li>
              <li><strong>Resolution:</strong> Standard or high-resolution</li>
              <li><strong>Customization:</strong> Chart title, axis labels, legend</li>
              <li><strong>Controls:</strong> Chart type selection, color scheme</li>
            </ul>
          </div>
          
          <div className="bg-card rounded-lg p-4 border">
            <h3 className="font-medium mb-2">Generate Reports</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li><strong>PDF Report:</strong> Comprehensive strategy report document</li>
              <li><strong>Strategy Summary:</strong> One-page overview of key metrics</li>
              <li><strong>Detailed Analysis:</strong> Multi-page deep dive with all charts</li>
              <li><strong>Template Options:</strong> Select from different report layouts</li>
              <li><strong>Sharing:</strong> Email report, download PDF, or print</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 mt-4">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> For detailed chart customization, click the settings icon in the top-right 
          corner of any chart. This allows you to modify colors, labels, scales, and other visual elements 
          before exporting.
        </AlertDescription>
      </Alert>
      
      <div className="bg-muted p-6 rounded-lg mt-6">
        <h2 className="text-xl font-bold tracking-tight mb-4">Interpreting Results</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Key Questions to Ask</h3>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li><strong>Is the strategy profitable after accounting for trading costs?</strong></li>
              <li><strong>How does the risk-adjusted return compare to benchmark indices?</strong></li>
              <li><strong>Is performance consistent over time or concentrated in specific periods?</strong></li>
              <li><strong>How severe are the drawdowns, and can you tolerate them emotionally?</strong></li>
              <li><strong>Does the strategy perform better in certain market conditions?</strong></li>
              <li><strong>Is the win rate sufficient given your trading psychology?</strong></li>
              <li><strong>How sensitive is performance to changes in strategy parameters?</strong></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Decision Framework</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Use this framework to decide whether to implement, modify, or reject your trading strategy:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md border border-green-200 dark:border-green-900">
                <h4 className="font-medium text-green-700 dark:text-green-400 mb-1">Implement</h4>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Positive risk-adjusted returns</li>
                  <li>Acceptable drawdowns</li>
                  <li>Consistent performance</li>
                  <li>Robust to parameter changes</li>
                  <li>Clear edge in specific markets</li>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDoc;
