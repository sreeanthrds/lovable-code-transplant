import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { tradingApiService, SaveBrokerConnectionRequest } from '@/lib/api/trading-api-service';
import { useToast } from '@/hooks/use-toast';
import { useClerkUser } from '@/hooks/useClerkUser';
import { z } from 'zod';

const brokerConnectionSchema = z.object({
  connection_name: z.string().trim().min(1, 'Connection Name is required').max(100),
  client_code: z.string().trim().min(1, 'Client Code is required').max(50),
  api_key: z.string().trim().min(1, 'API Key is required').max(255),
});

interface SaveBrokerConnectionFormProps {
  onSuccess?: () => void;
}

export const SaveBrokerConnectionForm: React.FC<SaveBrokerConnectionFormProps> = ({ onSuccess }) => {
  const { user } = useClerkUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    connection_name: '',
    client_code: '',
    api_key: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save broker connection',
        variant: 'destructive',
      });
      return;
    }

    // Validate
    try {
      brokerConnectionSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0].toString()] = error.message;
          }
        });
        setFieldErrors(errors);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: SaveBrokerConnectionRequest = {
        user_id: user.id,
        broker: 'angelone',
        ...formData,
      };

      const response = await tradingApiService.saveBrokerConnection(request);

      if (response.success) {
        toast({
          title: 'Connection Saved',
          description: 'Your broker credentials have been saved successfully',
        });

        // Clear form
        setFormData({
          connection_name: '',
          client_code: '',
          api_key: '',
        });

        onSuccess?.();
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save broker connection';
      setError(errorMessage);
      toast({
        title: 'Save Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Register Broker Connection
        </CardTitle>
        <CardDescription>
          Save your AngelOne credentials. You'll only need to do this once.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="connection_name">Connection Name</Label>
            <Input
              id="connection_name"
              type="text"
              placeholder="e.g., My Trading Account"
              value={formData.connection_name}
              onChange={(e) => handleInputChange('connection_name', e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.connection_name && (
              <p className="text-sm text-destructive">{fieldErrors.connection_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_code">Client Code</Label>
            <Input
              id="client_code"
              type="text"
              placeholder="Enter your Client Code"
              value={formData.client_code}
              onChange={(e) => handleInputChange('client_code', e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.client_code && (
              <p className="text-sm text-destructive">{fieldErrors.client_code}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_key">API Key</Label>
            <Input
              id="api_key"
              type="password"
              placeholder="Enter your Angel One API Key"
              value={formData.api_key}
              onChange={(e) => handleInputChange('api_key', e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.api_key && (
              <p className="text-sm text-destructive">{fieldErrors.api_key}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Your API Key from Angel One SmartAPI
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !formData.connection_name.trim() || !formData.client_code.trim() || !formData.api_key.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Register
              </>
            )}
          </Button>
        </form>

        <Alert className="mt-4">
          <AlertDescription className="text-xs">
            <strong>Security Note:</strong> Your credentials will be encrypted and stored securely. 
            After saving, use the "Connect" tab to authorize via Angel One's secure OAuth flow.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
