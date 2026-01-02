import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Shield, Clock, CheckCircle, ExternalLink, Copy, AlertTriangle, ChevronDown } from 'lucide-react';
import { useBrokerConnections, BrokerMetadata, getMetadataField } from '@/hooks/use-broker-connections';
import { useToast } from '@/hooks/use-toast';
import { useClerkUser } from '@/hooks/useClerkUser';

interface BrokerConnectionSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  selectedBroker: any;
  editingConnection?: any;
}

// Helper to get connection data - prefers broker_metadata, falls back to legacy columns
const getConnectionField = (connection: any, field: string): string => {
  if (!connection) return '';
  // First try broker_metadata
  const metadata = connection.broker_metadata as BrokerMetadata | null;
  if (metadata) {
    const value = getMetadataField<string>(metadata, field);
    if (value) return value;
  }
  // Fallback to legacy columns
  return connection[field] || '';
};

const BrokerConnectionSettingsDialog: React.FC<BrokerConnectionSettingsDialogProps> = ({
  open,
  onOpenChange,
  onBack,
  selectedBroker,
  editingConnection
}) => {
  const { connections, createConnection, updateConnection, updateConnectionTokens } = useBrokerConnections();
  const { toast } = useToast();
  const { user } = useClerkUser();
  
  // Initialize form data from broker_metadata or legacy fields
  const [formData, setFormData] = useState({
    connectionName: editingConnection ? editingConnection.connection_name : (selectedBroker ? `${selectedBroker.name} Trading Account` : ''),
    apiKey: editingConnection ? getConnectionField(editingConnection, 'api_key') : '',
    apiSecret: editingConnection ? getConnectionField(editingConnection, 'api_secret') : '',
    clientCode: editingConnection ? (getConnectionField(editingConnection, 'client_code') || getConnectionField(editingConnection, 'client_id')) : ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [nameError, setNameError] = useState('');

  const defaultPostbackUrl = `${window.location.origin}/auth/callback/[broker]`;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Check for duplicate names when connection name changes
    if (field === 'connectionName') {
      const isDuplicate = connections.some(conn => 
        conn.broker_type.toLowerCase() === selectedBroker?.id.toLowerCase() && 
        conn.connection_name.toLowerCase() === value.toLowerCase() &&
        conn.id !== editingConnection?.id // Exclude current connection when editing
      );
      
      if (isDuplicate && value.trim()) {
        setNameError('A connection with this name already exists. Please choose a unique name.');
      } else {
        setNameError('');
      }
    }
  };

  // Get OAuth URL for each broker
  const getBrokerOAuthUrl = (brokerId: string, redirectUrl: string) => {
    const clientId = formData.apiKey;
    const encodedRedirectUrl = encodeURIComponent(redirectUrl);
    
    const oauthUrls: Record<string, string> = {
      'angel-one': `https://smartapi.angelbroking.com/publisher-login?api_key=${clientId}&redirect_url=${encodedRedirectUrl}`,
      'zerodha': `https://kite.trade/connect/login?v=3&api_key=${clientId}&redirect_params=${encodedRedirectUrl}`,
      'upstox': `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectUrl}`,
      'fyers': `https://api.fyers.in/api/v2/generate-authcode?client_id=${clientId}&redirect_uri=${encodedRedirectUrl}&response_type=code&state=sample_state`,
      'alice-blue': `https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/customer/getEncKey?userId=${clientId}&redirect_uri=${encodedRedirectUrl}`,
      '5paisa': `https://dev-openapi.5paisa.com/WebVendorLogin/VLogin/Index?VendorKey=${clientId}&ResponseURL=${encodedRedirectUrl}`,
      'dhan': `https://api.dhan.co/v2/auth/login?client_id=${clientId}&redirect_uri=${encodedRedirectUrl}&response_type=code`,
      'mastertrust': `https://masterswift-beta.mastertrust.co.in/oauth2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectUrl}`
    };

    return oauthUrls[brokerId] || '';
  };

  const handleConnect = async () => {
    // For Angel One, require authentication fields
    if (selectedBroker?.id === 'angel-one') {
      if (!formData.connectionName || !formData.apiKey || !formData.clientCode) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields including Connection Name, API Key, and Client Code",
          variant: "destructive"
        });
        return;
      }
    } else if (!formData.connectionName || !formData.apiKey) {
      toast({
        title: "Missing Information",
        description: "Please fill in Connection Name and API Key to proceed",
        variant: "destructive"
      });
      return;
    }

    // Check if this is an attempt to update an existing connection
    const existingConnection = connections.find(conn => 
      conn.broker_type.toLowerCase() === selectedBroker?.id.toLowerCase() && 
      conn.connection_name.toLowerCase() === formData.connectionName.toLowerCase() &&
      conn.id !== editingConnection?.id
    );

    // Only block if nameError exists and we're not updating an existing connection
    if (nameError && !existingConnection) {
      toast({
        title: "Invalid Connection Name",
        description: "Please choose a unique connection name",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      if (editingConnection) {
        // Build broker_metadata with all connection data
        const metadata: BrokerMetadata = {
          type: selectedBroker.id,
          api_key: formData.apiKey,
          api_secret: formData.apiSecret,
          ...(selectedBroker?.id === 'angel-one' && { 
            client_code: formData.clientCode,
            client_id: formData.clientCode 
          })
        };
        
        // Update existing connection with broker_metadata
        await updateConnection(editingConnection.id, {
          connection_name: formData.connectionName,
          broker_metadata: metadata,
        });

        toast({
          title: "Connection Updated",
          description: "Your broker connection has been updated successfully",
        });

        onOpenChange(false);
      } else if (existingConnection) {
        // Update existing connection found by name match
        const existingMetadata = (existingConnection.broker_metadata || {}) as Record<string, unknown>;
        const metadata: BrokerMetadata = {
          ...existingMetadata,
          type: selectedBroker.id,
          api_key: formData.apiKey,
          api_secret: formData.apiSecret,
        };
        
        await updateConnection(existingConnection.id, {
          broker_metadata: metadata,
        });
        
        // Proceed with OAuth flow
        const oauthUrl = getBrokerOAuthUrl(selectedBroker.id, existingConnection.redirect_url || `${window.location.origin}/auth/callback/${selectedBroker.id}`);
        if (oauthUrl) {
          window.location.href = oauthUrl;
        }
      } else {
        // Build broker_metadata for new connection
        const metadata: BrokerMetadata = {
          type: selectedBroker.id,
          api_key: formData.apiKey,
          api_secret: formData.apiSecret,
          ...(selectedBroker.id === 'angel-one' && { 
            client_code: formData.clientCode,
            client_id: formData.clientCode 
          })
        };

        // Create new connection with broker_metadata
        const connectionData: any = {
          broker_type: selectedBroker.id,
          connection_name: formData.connectionName,
          broker_metadata: metadata,
          status: 'disconnected'
        };
        
        console.log('🔵 Creating broker connection with broker_metadata:', {
          ...connectionData,
          broker_metadata: '***hidden***'
        });
        
        const newConnection = await createConnection(connectionData) as any;
        
        console.log('✅ Connection created successfully:', newConnection?.id);

        // For Angel One, credentials are now saved - user needs to connect separately with passcode
        if (selectedBroker.id === 'angel-one') {
          toast({
            title: "Registration Successful",
            description: "Your Angel One credentials have been registered. Click 'Connect' to establish connection with your passcode.",
          });

          onOpenChange(false);
          setIsConnecting(false);
          return;
        }

        // For other brokers, use OAuth flow
        const oauthUrl = getBrokerOAuthUrl(selectedBroker.id, newConnection.redirect_url || '');
        
        console.log('OAuth Debug Info:', {
          brokerId: selectedBroker.id,
          redirectUrl: newConnection.redirect_url,
          oauthUrl,
          connectionId: newConnection.id
        });
        
        if (!oauthUrl) {
          toast({
            title: "OAuth Not Configured",
            description: `OAuth URL not configured for ${selectedBroker.name}`,
            variant: "destructive"
          });
          setIsConnecting(false);
          return;
        }

        // Store connection info temporarily for OAuth callback  
        const tempConnection = {
          id: newConnection.id,
          brokerName: selectedBroker.name,
          customerName: formData.connectionName,
          apiKey: formData.apiKey,
          apiSecret: formData.apiSecret || '',
          oauthState: newConnection.oauth_state,
          status: 'connecting' as const,
          accountId: formData.apiKey.slice(0, 8) + '...',
          lastHeartbeat: new Date().toISOString()
        };

        // Store in localStorage for retrieval after OAuth callback
        localStorage.setItem('pendingBrokerConnection', JSON.stringify(tempConnection));

        toast({
          title: "Redirecting to " + selectedBroker.name,
          description: "You will be redirected to complete authentication",
        });

        // Redirect to broker's OAuth URL
        setTimeout(() => {
          window.location.href = oauthUrl;
        }, 1000);
      }

    } catch (error) {
      console.error('❌ Connection error:', error);
      toast({
        title: editingConnection ? "Update Failed" : "Registration Failed",
        description: editingConnection 
          ? "Failed to update connection" 
          : error instanceof Error 
            ? error.message 
            : "Failed to register broker connection. Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Redirect URL copied to clipboard"
    });
  };

  // Broker-specific setup information
  const getBrokerSetupInfo = (brokerId: string) => {
    const setupInfo = {
      'angel-one': {
        portalName: 'SmartAPI Developer Portal',
        portalUrl: 'https://smartapi.angelbroking.com/',
        instructions: [
          {
            title: 'Open Angel One SmartAPI Portal',
            description: 'Click "Visit Portal" button above → Go to smartapi.angelbroking.com → Click "Register" if you don\'t have an account, or "Login" if you do.',
            hasLink: true
          },
          {
            title: 'Create Your Trading App',
            description: 'After login → Click "My Apps" in the top menu → Click "Create New App" button → Fill App Name (e.g., "My Trading Bot") → Select API Type: "Trading APIs" → Enter your Angel Client ID → Copy the Redirect URL from step 3 below and paste it → Copy the Postback URL from step 4 below and paste it → Click "Create App"',
            hasLink: false
          },
          {
            title: 'Set the Redirect URL',
            description: 'In your app settings → Find "Redirect URL" field → Copy the URL shown below and paste it exactly → Save the settings',
            hasLink: false
          },
          {
            title: 'Configure Postback URL',
            description: 'In the same app settings → Find "Postback URL" or "Webhook URL" field → Copy the postback URL below and paste it → This enables real-time trade updates',
            hasLink: false
          },
          {
            title: 'Copy Your API Keys',
            description: 'From your app dashboard → Copy "API Key" (starts with your client code) → Copy "API Secret" → Paste both keys in the form below and click "Connect"',
            hasLink: false
          }
        ]
      },
      'zerodha': {
        portalName: 'Kite Connect Developer Portal',
        portalUrl: 'https://kite.trade/',
        instructions: [
          {
            title: 'Open Kite Connect Portal',
            description: 'Click "Visit Portal" → Go to kite.trade → Click "Signup" if new user, or "Login" → Complete the registration form with your details',
            hasLink: true
          },
          {
            title: 'Create Your Trading App',
            description: 'After login → Click "My Apps" → Click "Create new app" → App name: "My Trading Bot" → Copy the Redirect URL from step 3 below and paste it in URL field → Copy the Postback URL from step 4 below and paste it → Description: "Personal trading" → Click "Create"',
            hasLink: false
          },
          {
            title: 'Configure Redirect URL',
            description: 'Click on your app name → Find "Redirect URLs" section → Copy the URL below and paste it → Click "Update app" to save',
            hasLink: false
          },
          {
            title: 'Set Postback URL',
            description: 'In the same app settings → Find "Postback URL" field → Copy the postback URL below and paste it → This enables instant order status updates',
            hasLink: false
          },
          {
            title: 'Get Your API Credentials',
            description: 'In your app page → Copy "API key" (long string starting with letters) → Copy "API secret" → Paste both in the form below and click "Connect"',
            hasLink: false
          }
        ]
      },
      'upstox': {
        portalName: 'Upstox Developer Console',
        portalUrl: 'https://upstox.com/developer/',
        instructions: [
          {
            title: 'Open Upstox Developer Portal',
            description: 'Click "Visit Portal" → Go to upstox.com/developer → Click "Login" with your Upstox account → If no account, first open Upstox app and create one',
            hasLink: true
          },
          {
            title: 'Create New Application',
            description: 'Click "Create App" → App Name: "My Trading App" → App Type: select "Connect" → Copy the Redirect URL from step 3 below and paste it → Copy the Postback URL from step 4 below and paste it → Description: "Personal trading bot" → Click "Create App"',
            hasLink: false
          },
          {
            title: 'Add Redirect URL',
            description: 'Click on your app → Scroll to "Redirect URIs" → Click "Add URI" → Copy the URL below and paste it → Click "Save Changes"',
            hasLink: false
          },
          {
            title: 'Configure Postback URL',
            description: 'In the same app settings → Find "Postback URL" section → Copy the postback URL below and paste it → This enables real-time position updates',
            hasLink: false
          },
          {
            title: 'Copy API Keys',
            description: 'In your app page → Copy "API Key" → Copy "API Secret" → Paste both keys in the form below → Click "Connect to Upstox"',
            hasLink: false
          }
        ]
      },
      'fyers': {
        portalName: 'Fyers API Portal',
        portalUrl: 'https://api-docs.fyers.in/',
        instructions: [
          {
            title: 'Open Fyers API Portal',
            description: 'Click "Visit Portal" → Go to api-docs.fyers.in → Click "Get Started" → Login with your Fyers account credentials → If no account, download Fyers app first',
            hasLink: true
          },
          {
            title: 'Create Your App',
            description: 'Go to "My Apps" section → Click "Create App" → App Name: "Trading Bot" → App ID: choose unique name → App Type: "Web App" → Copy the Redirect URL from step 3 below and paste it → Copy the Postback URL from step 4 below and paste it → Click "Create"',
            hasLink: false
          },
          {
            title: 'Set Redirect URL',
            description: 'In your app settings → Find "Redirect URL" field → Copy the URL shown below → Paste it exactly → Click "Update App"',
            hasLink: false
          },
          {
            title: 'Configure Postback URL',
            description: 'In the same app settings → Find "Postback URL" or "Webhook URL" field → Copy the postback URL below and paste it → This enables real-time order updates',
            hasLink: false
          },
          {
            title: 'Get App Credentials',
            description: 'From app dashboard → Copy "App ID" (your app identifier) → Copy "Secret Key" → Enter both in the form below → Click "Connect to Fyers"',
            hasLink: false
          }
        ]
      },
      'alice-blue': {
        portalName: 'Alice Blue API Portal',
        portalUrl: 'https://a3.aliceblueonline.com/',
        instructions: [
          {
            title: 'Access Alice Blue API',
            description: 'Log in to your Alice Blue account and navigate to the API section.',
            hasLink: true
          },
          {
            title: 'Generate API Key',
            description: 'Generate a new API key for your trading application.',
            hasLink: false
          },
          {
            title: 'Configure Settings',
            description: 'Set up the redirect URL and other required configurations.',
            hasLink: false
          },
          {
            title: 'Save Credentials',
            description: 'Copy your User ID and API Key for authentication.',
            hasLink: false
          }
        ]
      },
      '5paisa': {
        portalName: '5paisa Developer Portal',
        portalUrl: 'https://www.5paisa.com/developerapi',
        instructions: [
          {
            title: 'Register for Developer API',
            description: 'Sign up for 5paisa Developer API access and complete verification.',
            hasLink: true
          },
          {
            title: 'Create Application',
            description: 'Register your trading application in the developer portal.',
            hasLink: false
          },
          {
            title: 'Configure App Details',
            description: 'Set the redirect URL and other application configurations.',
            hasLink: false
          },
          {
            title: 'Get API Credentials',
            description: 'Copy your App Name, App Source, and User Key.',
            hasLink: false
          }
        ]
      },
      'dhan': {
        portalName: 'Dhan API Portal',
        portalUrl: 'https://dhanhq.co/docs/',
        instructions: [
          {
            title: 'Open Dhan Developer Portal',
            description: 'Click "Visit Portal" → Go to dhanhq.co/docs → Click "API Access" → Login with your Dhan trading account → Contact support for API access if needed',
            hasLink: true
          },
          {
            title: 'Request API Access',
            description: 'Fill the API request form → Submit required documents → Wait for approval (usually 2-3 days) → You\'ll receive API credentials via email',
            hasLink: false
          },
          {
            title: 'Configure Redirect URL',
            description: 'Once approved → Login to developer portal → Go to "My Apps" → Find "Redirect URL" setting → Copy URL below and paste → Save settings',
            hasLink: false
          },
          {
            title: 'Set Postback URL',
            description: 'In the same settings → Find "Postback URL" field → Copy the postback URL below and paste it → This enables real-time trade notifications',
            hasLink: false
          },
          {
            title: 'Use Your Credentials',
            description: 'From approval email → Copy "Client ID" → Copy "Access Token" → Paste both in the form below → Click "Connect to Dhan"',
            hasLink: false
          }
        ]
      },
      'mastertrust': {
        portalName: 'Mastertrust API Portal',
        portalUrl: 'https://masterswift-beta.mastertrust.co.in/',
        instructions: [
          {
            title: 'Access API Portal',
            description: 'Visit Mastertrust API portal and register for developer access.',
            hasLink: true
          },
          {
            title: 'Create New App',
            description: 'Register your trading application with required details.',
            hasLink: false
          },
          {
            title: 'Configure Redirect',
            description: 'Set the redirect URL in your application configuration.',
            hasLink: false
          },
          {
            title: 'Get API Keys',
            description: 'Copy your API Key and Secret from the app dashboard.',
            hasLink: false
          }
        ]
      },
      'paytm-money': {
        portalName: 'Paytm Money API',
        portalUrl: 'https://developer.paytmmoney.com/',
        instructions: [
          {
            title: 'Register for API',
            description: 'Sign up for Paytm Money API access and complete onboarding.',
            hasLink: true
          },
          {
            title: 'Create Application',
            description: 'Register your trading application in the developer console.',
            hasLink: false
          },
          {
            title: 'Setup Redirect URL',
            description: 'Configure the redirect URL for OAuth authentication.',
            hasLink: false
          },
          {
            title: 'Get Credentials',
            description: 'Copy your Consumer Key and Consumer Secret.',
            hasLink: false
          }
        ]
      },
      'groww': {
        portalName: 'Groww Developer Portal',
        portalUrl: 'https://groww.in/developer',
        instructions: [
          {
            title: 'Access Developer Portal',
            description: 'Visit Groww developer portal and apply for API access.',
            hasLink: true
          },
          {
            title: 'Submit Application',
            description: 'Complete the application process for API access approval.',
            hasLink: false
          },
          {
            title: 'Configure App',
            description: 'Once approved, configure your application settings.',
            hasLink: false
          },
          {
            title: 'Get API Access',
            description: 'Obtain your API credentials from the developer dashboard.',
            hasLink: false
          }
        ]
      }
    };

    return setupInfo[brokerId] || {
      portalName: `${selectedBroker.name} Developer Portal`,
      portalUrl: `https://${selectedBroker.domain}`,
      instructions: [
        {
          title: `Register with ${selectedBroker.name}`,
          description: `Visit ${selectedBroker.name}'s developer portal to register for API access.`,
          hasLink: true
        },
        {
          title: 'Create Application',
          description: 'Register your trading application with the required details.',
          hasLink: false
        },
        {
          title: 'Configure Redirect URL',
          description: 'Set the redirect URL provided below in your app configuration.',
          hasLink: false
        },
        {
          title: 'Get API Credentials',
          description: 'Copy your API Key and API Secret from the dashboard.',
          hasLink: false
        }
      ]
    };
  };

  if (!selectedBroker) return null;

  const brokerSetup = getBrokerSetupInfo(selectedBroker.id);

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col bg-background border shadow-xl">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack} 
                className="hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-lg border bg-white flex items-center justify-center shadow-sm">
                  <img 
                    src={selectedBroker.logoUrl || `https://logo.clearbit.com/${selectedBroker.domain}`}
                    alt={`${selectedBroker.name} logo`}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      if (selectedBroker.logoUrl && e.currentTarget.src === selectedBroker.logoUrl) {
                        e.currentTarget.src = `https://logo.clearbit.com/${selectedBroker.domain}`;
                      } else {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedBroker.name)}&size=32&background=000&color=fff`;
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-lg font-semibold">
                      {editingConnection ? `Edit ${selectedBroker.name} Connection` : `Connect to ${selectedBroker.name}`}
                    </DialogTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center cursor-help">
                          <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3 text-green-600" />
                            <p className="font-semibold text-sm">Bank-Grade Security</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Your credentials are encrypted with AES-256 and stored securely. 
                            You'll be redirected to {selectedBroker.name}'s official OAuth portal.
                          </p>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">AES-256</Badge>
                            <Badge variant="secondary" className="text-xs">SOC 2</Badge>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <DialogDescription className="text-sm text-muted-foreground sr-only">
                    {editingConnection ? `Update credentials for ${selectedBroker.name} connection` : `Set up secure connection to ${selectedBroker.name} trading platform`}
                  </DialogDescription>
                  <p className="text-sm text-muted-foreground">{selectedBroker.description}</p>
                </div>
              </div>
            </div>
          </DialogHeader>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {/* Setup Instructions */}
            <Collapsible open={isSetupOpen} onOpenChange={setIsSetupOpen}>
              <Card className="border-primary/20 bg-primary/5 shadow-md">
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-primary/10 transition-colors">
                    <CardTitle className="text-base flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-primary font-semibold">Setup Instructions (Mandatory)</span>
                        <Badge variant="destructive" className="text-xs bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
                          Required
                        </Badge>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-primary transition-transform duration-200 ${isSetupOpen ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    {brokerSetup.instructions.map((step, index) => (
                      <div key={index + 1} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{step.title}</h4>
                            {step.hasLink && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs bg-primary/10 hover:bg-primary/20 text-primary"
                                onClick={() => window.open(brokerSetup.portalUrl, '_blank', 'noopener,noreferrer')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Visit Portal
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                           {index === 2 && (
                             <div className="mt-2 p-3 rounded-md bg-muted border">
                               <div className="flex items-center gap-2 mb-2">
                                 <span className="text-xs font-medium text-muted-foreground">Redirect URL:</span>
                                 <Tooltip>
                                   <TooltipTrigger>
                                     <AlertTriangle className="h-3 w-3 text-amber-500" />
                                   </TooltipTrigger>
                                   <TooltipContent>
                                     <p className="text-xs max-w-xs">Use this URL in your broker's app configuration. The state parameter will be automatically generated for security.</p>
                                   </TooltipContent>
                                 </Tooltip>
                               </div>
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 text-xs font-mono bg-background px-2 py-1 rounded border">
                                    {window.location.origin}/auth/callback/[broker]?state=USER:BROKER:CONNECTION:TIMESTAMP
                                  </code>
                                   <Button 
                                     size="sm" 
                                     variant="outline" 
                                     onClick={() => copyToClipboard(`${window.location.origin}/auth/callback/[broker]`)} 
                                     className="h-7 w-7 p-0"
                                   >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            {index === 3 && (
                              <div className="mt-2 p-3 rounded-md bg-muted border">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-medium text-muted-foreground">Postback URL:</span>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <AlertTriangle className="h-3 w-3 text-blue-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs max-w-xs">Configure this URL in your broker app settings to receive real-time position and order updates. This enables instant notifications when your trades change.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 text-xs font-mono bg-background px-2 py-1 rounded border">
                                    {defaultPostbackUrl}
                                  </code>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => copyToClipboard(defaultPostbackUrl)} 
                                    className="h-7 w-7 p-0"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                         </div>
                      </div>
                    ))}
                   </CardContent>
                 </CollapsibleContent>
               </Card>
             </Collapsible>

            {/* Connection Form */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  API Credentials
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground ml-10">
                  Enter your {selectedBroker.name} API credentials
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="connectionName" className="text-sm font-medium">
                    Connection Name
                  </Label>
                  <Input
                    id="connectionName"
                    placeholder="e.g., My Trading Account"
                    value={formData.connectionName}
                    onChange={(e) => handleInputChange('connectionName', e.target.value)}
                    className={`h-10 ${nameError ? 'border-destructive focus:border-destructive' : ''}`}
                  />
                  {nameError && (
                    <div className="space-y-3">
                      <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        A connection with this name already exists.
                      </p>
                      
                      {/* Show comparison of values */}
                      {(() => {
                        const existingConnection = connections.find(conn => 
                          conn.broker_type.toLowerCase() === selectedBroker?.id.toLowerCase() && 
                          conn.connection_name.toLowerCase() === formData.connectionName.toLowerCase()
                        );
                        
                        if (!existingConnection) return null;
                        
                        const existingApiKey = getConnectionField(existingConnection, 'api_key');
                        const existingApiSecret = getConnectionField(existingConnection, 'api_secret');
                        const apiKeyChanged = formData.apiKey !== existingApiKey;
                        const apiSecretChanged = formData.apiSecret !== existingApiSecret;
                        
                        return (
                          <div className="bg-muted/40 rounded-md p-3 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Changes to be made:</p>
                            
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span>API Key:</span>
                                <div className="flex items-center gap-2">
                                  {apiKeyChanged ? (
                                    <>
                                      <span className="text-red-600 dark:text-red-400">
                                        {existingApiKey ? '••••••••' : 'Enter API Key'}
                                      </span>
                                      <span>→</span>
                                      <span className="text-green-600 dark:text-green-400">
                                        {formData.apiKey ? '••••••••' : 'Enter API Key'}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground">No change</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span>API Secret:</span>
                                <div className="flex items-center gap-2">
                                  {apiSecretChanged ? (
                                    <>
                                      <span className="text-red-600 dark:text-red-400">
                                        {existingApiSecret ? '••••••••' : 'Enter Secret Key'}
                                      </span>
                                      <span>→</span>
                                      <span className="text-green-600 dark:text-green-400">
                                        {formData.apiSecret ? '••••••••' : 'Enter Secret Key'}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground">No change</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {(!apiKeyChanged && !apiSecretChanged) && (
                              <p className="text-xs text-muted-foreground italic">
                                No changes detected in credentials
                              </p>
                            )}
                          </div>
                        );
                      })()}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const existingConnection = connections.find(conn => 
                            conn.broker_type.toLowerCase() === selectedBroker?.id.toLowerCase() && 
                            conn.connection_name.toLowerCase() === formData.connectionName.toLowerCase()
                          );
                          if (existingConnection) {
                            setFormData({
                              connectionName: existingConnection.connection_name,
                              apiKey: getConnectionField(existingConnection, 'api_key'),
                              apiSecret: getConnectionField(existingConnection, 'api_secret'),
                              clientCode: getConnectionField(existingConnection, 'client_code') || getConnectionField(existingConnection, 'client_id')
                            });
                            setNameError('');
                          }
                        }}
                      >
                        Load Existing Values
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-sm font-medium">
                      API Key
                    </Label>
                    <Input
                      id="apiKey"
                      placeholder="••••••••••••••••••••"
                      value={formData.apiKey}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      type="password"
                      className="h-10 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiSecret" className="text-sm font-medium">
                      API Secret
                    </Label>
                    <Input
                      id="apiSecret"
                      placeholder="••••••••••••••••••••"
                      value={formData.apiSecret}
                      onChange={(e) => handleInputChange('apiSecret', e.target.value)}
                      type="password"
                      className="h-10 font-mono"
                    />
                  </div>
                </div>

                {/* Angel One specific fields */}
                {selectedBroker?.id === 'angel-one' && (
                  <div className="space-y-4 mt-4 p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">Angel One Authentication</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clientCode" className="text-sm font-medium">
                        Client Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="clientCode"
                        placeholder="Your Angel One Client Code"
                        value={formData.clientCode}
                        onChange={(e) => handleInputChange('clientCode', e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t p-4 bg-muted/30">
          <div className="flex justify-between items-center gap-4">
            <Button 
              variant="outline" 
              onClick={editingConnection ? () => onOpenChange(false) : onBack} 
              className="h-10 px-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {editingConnection ? 'Cancel' : 'Back'}
            </Button>
            
            <Button 
              onClick={handleConnect}
              disabled={
                isConnecting || 
                !formData.connectionName || 
                !formData.apiKey ||
                (selectedBroker?.id === 'angel-one' && !formData.clientCode)
              }
              className="h-10 px-6"
            >
              {isConnecting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  {(() => {
                    if (editingConnection) return `Update ${selectedBroker.name}`;
                    
                    // For Angel One, use "Register" instead of "Connect"
                    if (selectedBroker?.id === 'angel-one') {
                      return 'Register';
                    }
                    
                    // Check if this is an existing connection with changes
                    if (nameError) {
                      const existingConnection = connections.find(conn => 
                        conn.broker_type.toLowerCase() === selectedBroker?.id.toLowerCase() && 
                        conn.connection_name.toLowerCase() === formData.connectionName.toLowerCase()
                      );
                      const existingApiKey = existingConnection ? getConnectionField(existingConnection, 'api_key') : '';
                      const existingApiSecret = existingConnection ? getConnectionField(existingConnection, 'api_secret') : '';
                      const hasChanges = existingConnection && (
                        formData.apiKey !== existingApiKey ||
                        formData.apiSecret !== existingApiSecret
                      );
                      return hasChanges ? `Update & Connect to ${selectedBroker.name}` : `Connect to ${selectedBroker.name}`;
                    }
                    
                    return `Connect to ${selectedBroker.name}`;
                  })()}
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  );
};

export default BrokerConnectionSettingsDialog;