import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBrokerConnection } from '@/hooks/use-broker-connection';
import { Loader2, CheckCircle2, XCircle, RefreshCw, Power } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SaveBrokerConnectionForm } from './SaveBrokerConnectionForm';
import { BrokerConnectionList } from './BrokerConnectionList';
import { UpdateBrokerConnectionForm } from './UpdateBrokerConnectionForm';

export const BrokerConnectionManager: React.FC = () => {
  const {
    isConnected,
    isDisconnecting,
    isLoadingStatus,
    brokerStatus,
    error,
    disconnect,
    refreshStatus,
  } = useBrokerConnection();

  // ============================================
  // FORMAT CURRENCY
  // ============================================
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Broker Connection</h1>
        <p className="text-muted-foreground mt-2">
          Connect to AngelOne to enable live trading
        </p>
      </div>

      {/* Error Alert */}
      {error && !isConnected && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Connection Status Card */}
      {isConnected && brokerStatus && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Connected to AngelOne</CardTitle>
                  <CardDescription>
                    {brokerStatus.account_info?.name || 'Account Connected'}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="default" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account Info */}
            {brokerStatus.account_info && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Available Margin</p>
                  <p className="text-xl font-semibold text-primary">
                    {formatCurrency(brokerStatus.account_info.available_margin)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Used Margin</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(brokerStatus.account_info.used_margin)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Margin</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(brokerStatus.account_info.total_margin)}
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStatus}
                disabled={isLoadingStatus}
              >
                {isLoadingStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Status
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={disconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Disconnect
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Management Forms - Always show, even when connected */}
      <Tabs defaultValue="connect" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connect">Connect</TabsTrigger>
          <TabsTrigger value="register">Register New</TabsTrigger>
          <TabsTrigger value="update">Update Existing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connect" className="mt-4">
          <BrokerConnectionList onConnectionSuccess={refreshStatus} />
        </TabsContent>
        
        <TabsContent value="register" className="mt-4">
          <SaveBrokerConnectionForm onSuccess={refreshStatus} />
        </TabsContent>
        
        <TabsContent value="update" className="mt-4">
          <UpdateBrokerConnectionForm onSuccess={refreshStatus} />
        </TabsContent>
      </Tabs>

      {/* Help Text */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">How to get your credentials?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Log in to your AngelOne account</p>
          <p>2. Navigate to API settings</p>
          <p>3. Generate or copy your API Key and Client Code</p>
          <p>4. Save your credentials, then click "Connect" to authorize</p>
          <p>5. You'll be redirected to Angel One for secure OAuth authentication</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerConnectionManager;
