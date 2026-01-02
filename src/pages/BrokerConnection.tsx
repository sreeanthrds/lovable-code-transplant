import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import BrokerConnectionManager from '@/components/broker/BrokerConnectionManager';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useBrokerOAuthCallback } from '@/hooks/useBrokerOAuthCallback';

const BrokerConnection = () => {
  // Handle OAuth callback
  useBrokerOAuthCallback();

  return (
    <AppLayout>
      <ErrorBoundary>
        <BrokerConnectionManager />
      </ErrorBoundary>
    </AppLayout>
  );
};

export default BrokerConnection;
