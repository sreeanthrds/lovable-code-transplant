import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Edit, AlertCircle } from 'lucide-react';
import { tradingApiService, BrokerConnectionData } from '@/lib/api/trading-api-service';
import { useToast } from '@/hooks/use-toast';
import { useClerkUser } from '@/hooks/useClerkUser';
import { z } from 'zod';

const updateSchema = z.object({
  connection_name: z.string().trim().min(1, 'Connection Name is required').max(100),
  client_code: z.string().trim().min(1, 'Client Code is required').max(50),
});

interface UpdateBrokerConnectionFormProps {
  onSuccess?: () => void;
}

export const UpdateBrokerConnectionForm: React.FC<UpdateBrokerConnectionFormProps> = ({ onSuccess }) => {
  const { user } = useClerkUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connections, setConnections] = useState<BrokerConnectionData[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    connection_name: '',
    client_code: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.id) {
      loadConnections();
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedConnectionId) {
      const selected = connections.find(c => c.id === selectedConnectionId);
      if (selected) {
        setFormData({
          connection_name: selected.connection_name || '',
          client_code: selected.client_code || '',
        });
      }
    }
  }, [selectedConnectionId, connections]);

  const loadConnections = async () => {
    if (!user?.id) return;

    setIsLoadingConnections(true);
    try {
      const data = await tradingApiService.listBrokerConnections(user.id);
      setConnections(data);
      if (data.length > 0 && !selectedConnectionId) {
        setSelectedConnectionId(data[0].id || '');
      }
    } catch (err: any) {
      console.error('Failed to load connections:', err);
    } finally {
      setIsLoadingConnections(false);
    }
  };

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

    if (!selectedConnectionId) {
      toast({
        title: 'No Connection Selected',
        description: 'Please select a connection to update',
        variant: 'destructive',
      });
      return;
    }

    // Validate
    try {
      updateSchema.parse(formData);
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
      const response = await tradingApiService.updateBrokerConnection(selectedConnectionId, formData);

      if (response.success) {
        toast({
          title: 'Connection Updated',
          description: 'Your broker credentials have been updated successfully',
        });

        await loadConnections();
        onSuccess?.();
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update broker connection';
      setError(errorMessage);
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingConnections) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (connections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Saved Connections</CardTitle>
          <CardDescription>
            Please register a broker connection first
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Update Broker Connection
        </CardTitle>
        <CardDescription>
          Update your saved AngelOne credentials
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
            <Label htmlFor="connection">Select Connection</Label>
            <Select value={selectedConnectionId} onValueChange={setSelectedConnectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a connection" />
              </SelectTrigger>
              <SelectContent>
                {connections.map((conn) => (
                  <SelectItem key={conn.id} value={conn.id || ''}>
                    {conn.connection_name} - {conn.client_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="connection_name">Connection Name</Label>
            <Input
              id="connection_name"
              type="text"
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
              value={formData.client_code}
              onChange={(e) => handleInputChange('client_code', e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.client_code && (
              <p className="text-sm text-destructive">{fieldErrors.client_code}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Update Connection
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
