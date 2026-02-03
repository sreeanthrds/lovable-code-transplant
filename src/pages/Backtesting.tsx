import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/AppLayout';
import BacktestForm, { TEST_STRATEGY_ID } from '@/components/backtest/BacktestForm';
import BacktestReport from '@/components/backtest-report/BacktestReport';
import BacktestProgress from '@/components/backtest/BacktestProgress';
import DailyResultsList from '@/components/backtest/DailyResultsList';
import OverallSummaryCard from '@/components/backtest/OverallSummaryCard';
import BacktestQuotaBanner from '@/components/backtest/BacktestQuotaBanner';
import QuotaExhaustedCard from '@/components/backtest/QuotaExhaustedCard';
import { ViewTradesModalV2 } from '@/components/live-trade/ViewTradesModalV2';
import { useBacktestSession } from '@/hooks/useBacktestSession';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useQuota } from '@/hooks/useQuota';
import { usePlanDefinitions } from '@/hooks/usePlanDefinitions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Backtesting = () => {
  const { user } = useClerkUser();
  const { isAdmin } = useAdminRole();
  const { toast } = useToast();
  const { quotaInfo, loading: quotaLoading, consumeBacktest, refreshQuota } = useQuota();
  const { getPlanByCode } = usePlanDefinitions();
  
  const {
    session,
    selectedDayData,
    loadingDay,
    startBacktest,
    loadDayDetail,
    reset,
    getDailyResultsArray,
  } = useBacktestSession({ userId: user?.id, isAdmin });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStrategy, setModalStrategy] = useState<any>(null);
  const [quotaConsumed, setQuotaConsumed] = useState(false);

  // Legacy test mode state
  const [legacyMode, setLegacyMode] = useState(false);
  const [legacyTradesData, setLegacyTradesData] = useState<any>(null);
  const [legacyDiagnosticsData, setLegacyDiagnosticsData] = useState<any>(null);

  // Get reset time from plan definitions
  const currentPlanDef = getPlanByCode(quotaInfo.plan);
  const resetHour = currentPlanDef?.daily_reset_hour ?? 0;
  const resetTimezone = currentPlanDef?.reset_timezone ?? 'Asia/Kolkata';

  // Watch for backtest completion and conditionally consume quota
  useEffect(() => {
    const handleQuotaConsumption = async () => {
      if (
        session?.status === 'completed' &&
        session.overall_summary &&
        !quotaConsumed &&
        !legacyMode
      ) {
        const totalTrades = session.overall_summary.total_trades || 0;
        
        if (totalTrades > 0) {
          // Consume quota only if trades were generated
          const success = await consumeBacktest();
          if (success) {
            await refreshQuota();
            setQuotaConsumed(true);
            toast({
              title: 'Backtest counted',
              description: `${totalTrades} trades generated. 1 backtest consumed from your quota.`,
            });
          }
        } else {
          // No trades - don't consume quota
          setQuotaConsumed(true);
          toast({
            title: 'No quota consumed',
            description: 'Backtest produced 0 trades. Your quota remains unchanged.',
          });
        }
      }
    };

    handleQuotaConsumption();
  }, [session?.status, session?.overall_summary, quotaConsumed, legacyMode, consumeBacktest, refreshQuota, toast]);

  // Handle test strategy - load from static files (legacy mode)
  const handleTestBacktest = async () => {
    setLegacyMode(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const [tradesResponse, diagnosticsResponse] = await Promise.all([
        fetch('/data/trades_daily.json'),
        fetch('/data/diagnostics_export.json')
      ]);

      if (!tradesResponse.ok || !diagnosticsResponse.ok) {
        throw new Error('Failed to load test data');
      }

      const trades = await tradesResponse.json();
      const diagnostics = await diagnosticsResponse.json();

      setLegacyTradesData(trades);
      setLegacyDiagnosticsData(diagnostics);
      
      toast({
        title: 'Test backtest loaded',
        description: 'Using static test data for UI testing',
      });
    } catch (error) {
      console.error('Error loading test data:', error);
      toast({
        title: 'Failed to load test data',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      setLegacyMode(false);
    }
  };

  // Handle real API backtest using SSE
  const handleApiBacktest = async (config: any) => {
    setLegacyMode(false);
    setLegacyTradesData(null);
    setLegacyDiagnosticsData(null);
    setSelectedDate(null);

    try {
      await startBacktest({
        strategy_id: config.strategyId,
        start_date: config.startDate,
        end_date: config.endDate || config.startDate,
        initial_capital: config.initialCapital,
        slippage_percentage: config.slippage,
        commission_percentage: config.commission,
      });
      
      toast({
        title: 'Backtest started',
        description: 'Streaming results will appear as each day completes',
      });
    } catch (error) {
      console.error('Backtest error:', error);
      toast({
        title: 'Backtest failed',
        description: error instanceof Error ? error.message : 'Failed to start backtest',
        variant: 'destructive',
      });
    }
  };

  const handleBacktestSubmit = async (config: any) => {
    setIsSubmitting(true);
    reset();

    try {
      if (config.strategyId === TEST_STRATEGY_ID) {
        await handleTestBacktest();
      } else {
        await handleApiBacktest(config);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDaySelect = async (date: string) => {
    setSelectedDate(date);
    try {
      await loadDayDetail(date);
    } catch (error) {
      toast({
        title: 'Failed to load day details',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  // Open modal when day data is loaded
  useEffect(() => {
    if (selectedDayData && selectedDate && !isModalOpen) {
      setModalStrategy({
        id: selectedDate,
        strategyId: session?.strategy_id || 'backtest',
        name: `Backtest - ${selectedDate}`,
        description: `Daily results for ${selectedDate}`
      });
      setIsModalOpen(true);
    }
  }, [selectedDayData, selectedDate, isModalOpen, session?.strategy_id]);

  const handleReset = () => {
    reset();
    setLegacyMode(false);
    setLegacyTradesData(null);
    setLegacyDiagnosticsData(null);
    setSelectedDate(null);
    setIsModalOpen(false);
    setModalStrategy(null);
    setQuotaConsumed(false); // Reset quota consumed flag for new backtest
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const dailyResults = getDailyResultsArray();
  const isRunning = session?.status === 'starting' || session?.status === 'running';
  const isCompleted = session?.status === 'completed';
  const isFailed = session?.status === 'failed';

  // Show legacy mode (test strategy)
  if (legacyMode && legacyTradesData && legacyDiagnosticsData) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-4rem)] overflow-auto">
          <div className="container max-w-7xl mx-auto px-4 py-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Backtesting Report</h1>
              <p className="text-muted-foreground">
                Test data loaded from static files
              </p>
            </div>

            <div className="mb-6 flex justify-end">
              <Button variant="outline" onClick={handleReset}>
                Run New Backtest
              </Button>
            </div>

            <BacktestReport 
              externalTradesData={legacyTradesData}
              externalDiagnosticsData={legacyDiagnosticsData}
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Check if quota is exhausted
  const isQuotaExhausted = !quotaLoading && quotaInfo.backtests.remaining === 0;

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] overflow-auto">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Backtesting Report</h1>
            <p className="text-muted-foreground">
              Run backtests and analyze detailed execution diagnostics
            </p>
          </div>

          {/* Quota Banner - always visible */}
          <div className="mb-6">
            <BacktestQuotaBanner
              quotaInfo={quotaInfo}
              resetHour={resetHour}
              resetTimezone={resetTimezone}
              loading={quotaLoading}
            />
          </div>

          {/* Quota Exhausted Card - blocks form when quota is 0 */}
          {isQuotaExhausted && !session && (
            <div className="mb-6">
              <QuotaExhaustedCard quotaInfo={quotaInfo} />
            </div>
          )}

          {/* Configuration Form - hidden when quota exhausted */}
          {!session && !isQuotaExhausted && (
            <div className="mb-6">
              <BacktestForm 
                onSubmit={handleBacktestSubmit} 
                isLoading={isSubmitting}
              />
            </div>
          )}

          {/* Active Session View */}
          {session && (
            <div className="space-y-6">
              {/* Header with reset button */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Backtest: {session.start_date} to {session.end_date}
                </h2>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  New Backtest
                </Button>
              </div>

              {/* Progress Bar - only show when running */}
              {isRunning && <BacktestProgress session={session} />}

              {/* Overall Summary (when completed) */}
              {isCompleted && session.overall_summary && (
                <OverallSummaryCard summary={session.overall_summary} />
              )}

              {/* Daily Results List - always show when session exists */}
              <DailyResultsList
                results={dailyResults}
                selectedDate={selectedDate}
                loadingDate={loadingDay}
                onSelectDay={handleDaySelect}
              />

              {/* Failed State */}
              {isFailed && (
                <Card className="border-destructive">
                  <CardContent className="py-8">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-destructive mb-2">
                        Backtest Failed
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {session.error || 'An unknown error occurred'}
                      </p>
                      <Button variant="outline" onClick={handleReset}>
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Idle State - No Session */}
          {!session && !isSubmitting && !legacyMode && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
                  <p className="text-muted-foreground">
                    Configure and run a backtest to see detailed execution diagnostics
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submitting State */}
          {isSubmitting && !session && (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-1">Starting Backtest...</h3>
                    <p className="text-muted-foreground text-sm">
                      Connecting to server
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* View Trades Modal */}
      {isModalOpen && modalStrategy && selectedDayData && (
        <ViewTradesModalV2
          strategy={modalStrategy}
          userId={user?.id || null}
          apiBaseUrl={null}
          onClose={handleModalClose}
          mode="backtest"
          backtestDate={selectedDate}
          streamingTradesData={{
            date: selectedDate,
            summary: {
              total_trades: selectedDayData.trades?.summary?.total_trades || selectedDayData.trades?.summary?.total_positions || 0,
              total_pnl: String(selectedDayData.trades?.summary?.total_pnl || "0"),
              realized_pnl: String(selectedDayData.trades?.summary?.realized_pnl || "0"),
              unrealized_pnl: String(selectedDayData.trades?.summary?.unrealized_pnl || "0"),
              winning_trades: selectedDayData.trades?.summary?.winning_trades || 0,
              losing_trades: selectedDayData.trades?.summary?.losing_trades || 0
            },
            trades: selectedDayData.trades?.trades || [],
            diagnostics: selectedDayData.diagnostics
          }}
          cachedBacktestResults={selectedDayData}
        />
      )}
    </AppLayout>
  );
};

export default Backtesting;
