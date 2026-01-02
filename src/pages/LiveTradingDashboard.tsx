import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LiveTradingDashboard } from '@/components/live-trade/LiveTradingDashboard';

const LiveTradingDashboardPage = () => {
  return (
    <AppLayout>
      <ErrorBoundary>
        <LiveTradingDashboard />
      </ErrorBoundary>
    </AppLayout>
  );
};

export default LiveTradingDashboardPage;
