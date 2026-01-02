import React, { useState, useEffect } from 'react';
import { apiClient, getApiBaseUrl } from '@/lib/api-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

/**
 * Example component demonstrating how to use the dynamic API configuration
 */
const ApiUsageExample: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load current API URL on component mount
    loadCurrentUrl();
  }, []);

  const loadCurrentUrl = async () => {
    try {
      const url = await getApiBaseUrl();
      setCurrentUrl(url);
    } catch (error) {
      console.error('Error loading API URL:', error);
    }
  };

  const testApiCall = async () => {
    setLoading(true);
    try {
      // Example: Making a GET request using the configured API client
      const response = await apiClient.get('/api/test');
      const data = await response.json();
      
      setTestResponse(data);
      toast({
        title: "API Call Successful",
        description: "Data retrieved from the configured API server",
        variant: "default"
      });
    } catch (error) {
      console.error('API call failed:', error);
      toast({
        title: "API Call Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testPostData = async () => {
    setLoading(true);
    try {
      // Example: Making a POST request with data
      const testData = {
        message: "Hello from dynamic API client",
        timestamp: new Date().toISOString(),
        userId: "test-user"
      };

      const response = await apiClient.post('/api/submit', testData);
      const data = await response.json();
      
      setTestResponse(data);
      toast({
        title: "POST Request Successful",
        description: "Data submitted to the configured API server",
        variant: "default"
      });
    } catch (error) {
      console.error('POST request failed:', error);
      toast({
        title: "POST Request Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dynamic API Configuration Example</CardTitle>
          <CardDescription>
            This example shows how to use the dynamic API client that automatically reads the configured URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Current API URL:</span>
            <Badge variant="outline">{currentUrl || 'Loading...'}</Badge>
            <Button variant="outline" size="sm" onClick={loadCurrentUrl}>
              Refresh
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={testApiCall} disabled={loading || !currentUrl}>
              Test GET Request
            </Button>
            <Button onClick={testPostData} disabled={loading || !currentUrl} variant="outline">
              Test POST Request
            </Button>
          </div>

          {testResponse && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">API Response:</h4>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(testResponse, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Code Example:</h4>
            <pre className="text-sm">
{`// Import the API client
import { apiClient, getApiBaseUrl } from '@/lib/api-config';

// Get current API URL
const url = await getApiBaseUrl();

// Make requests (URL is automatically resolved)
const response = await apiClient.get('/api/endpoint');
const data = await apiClient.post('/api/submit', { key: 'value' });

// The API client handles:
// - Dynamic URL resolution
// - Automatic retries
// - Timeout handling
// - Error handling`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiUsageExample;