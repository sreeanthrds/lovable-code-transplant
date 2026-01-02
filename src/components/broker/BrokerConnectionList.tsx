import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Edit2, Trash2, Plus } from 'lucide-react';
import { useClerkUser } from '@/hooks/useClerkUser';
import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';
import { ConnectBrokerButton } from './ConnectBrokerButton';
import { useToast } from '@/hooks/use-toast';

interface BrokerConnection {
  id: string;
  user_id: string;
  broker_type: string;
  connection_name: string;
  status: string;
  is_active: boolean;
  created_at: string;
}

interface BrokerConnectionListProps {
  onConnectionSuccess?: () => void;
  onAddNew?: () => void;
}

export const BrokerConnectionList: React.FC<BrokerConnectionListProps> = ({ onConnectionSuccess, onAddNew }) => {
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { userId } = useClerkUser();
  const { toast } = useToast();

  const loadConnections = async () => {
    if (!userId) return;

    try {
      const { data, error } = await (supabase as any)
        .from('broker_connections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Failed to load connections:', error);
      toast({
        title: 'Error',
        description: 'Failed to load broker connections',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (connectionId: string, connectionName: string) => {
    if (!confirm(`Are you sure you want to delete "${connectionName}"?`)) {
      return;
    }

    setDeletingId(connectionId);
    try {
      const { error } = await (supabase as any)
        .from('broker_connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Connection "${connectionName}" deleted successfully`,
      });
      loadConnections();
    } catch (error) {
      console.error('Failed to delete connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete broker connection',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    loadConnections();

    // Set up real-time subscription for connection changes
    if (!userId) return;

    const channel = supabase
      .channel('broker_connections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'broker_connections',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadConnections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No saved broker connections. Register a new connection to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add New Connection Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Saved Connections</h3>
        <Button
          onClick={() => {
            if (onAddNew) {
              onAddNew();
            } else {
              toast({
                title: 'Add New Connection',
                description: 'Switch to the "Register New" tab to add a connection',
              });
            }
          }}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Connection
        </Button>
      </div>

      {connections.map((connection) => (
        <Card key={connection.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
               <div>
                <CardTitle>{connection.connection_name}</CardTitle>
                <CardDescription>
                  {connection.broker_type}
                </CardDescription>
              </div>
              <Badge variant={connection.status === 'connected' ? 'default' : 'secondary'}>
                {connection.status === 'connected' ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {connection.status !== 'connected' && (
                <ConnectBrokerButton
                  connectionId={connection.id}
                  connectionName={connection.connection_name}
                  onSuccess={() => {
                    loadConnections();
                    onConnectionSuccess?.();
                  }}
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Switch to Update tab - will be handled by parent
                  toast({
                    title: 'Edit Connection',
                    description: 'Switch to the "Update Existing" tab to edit this connection',
                  });
                }}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(connection.id, connection.connection_name)}
                disabled={deletingId === connection.id}
              >
                {deletingId === connection.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
