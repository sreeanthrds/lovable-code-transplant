import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { migrationService, type MigrationFilters, type BulkMigrationResult } from '@/lib/supabase/services/migration-service';
import { Loader2, Play, AlertTriangle, CheckCircle, XCircle, Database } from 'lucide-react';

export default function StrategyMigration() {
  const [filters, setFilters] = useState<MigrationFilters>({ scope: 'all' });
  const [strategies, setStrategies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredStrategies, setFilteredStrategies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<BulkMigrationResult | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [strategiesData, usersData] = await Promise.all([
          migrationService.getStrategiesForMigration(),
          migrationService.getUsersWithStrategies()
        ]);
        setStrategies(strategiesData);
        setUsers(usersData);
      } catch (error) {
        toast({
          title: "Error Loading Data",
          description: error instanceof Error ? error.message : "Failed to load strategies and users data.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [toast]);

  // Filter strategies based on selected user
  useEffect(() => {
    if (filters.userId) {
      setFilteredStrategies(strategies.filter(strategy => strategy.user_id === filters.userId));
    } else {
      setFilteredStrategies(strategies);
    }
  }, [filters.userId, strategies]);

  const handleMigration = async () => {
    setIsLoading(true);
    setMigrationResult(null);

    try {
      const result = await migrationService.migrateStrategies(filters);
      setMigrationResult(result);
      
      toast({
        title: "Migration Complete",
        description: `Migrated ${result.migratedStrategies} out of ${result.totalStrategies} strategies.`,
      });
    } catch (error) {
      toast({
        title: "Migration Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canMigrate = () => {
    if (filters.scope === 'specific' && !filters.strategyId) return false;
    if (filters.scope === 'user' && !filters.userId) return false;
    return true;
  };

  const getSelectedUser = () => {
    return users.find(user => user.user_id === filters.userId);
  };

  const getSelectedStrategy = () => {
    return strategies.find(strategy => strategy.id === filters.strategyId);
  };

  if (isLoadingData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading migration data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Strategy Migration</h1>
        <p className="text-muted-foreground">
          Migrate strategies from string-based timeframes to ID-based timeframes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migration Configuration
          </CardTitle>
          <CardDescription>
            Select the scope and target for timeframe migration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Select User</Label>
            <Select 
              value={filters.userId || 'all'} 
              onValueChange={(value) => {
                if (value === 'all') {
                  setFilters({ scope: 'all' });
                } else {
                  setFilters({ scope: 'user', userId: value });
                }
                setMigrationResult(null);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    <div className="flex flex-col">
                      <span>{user.email}</span>
                      {(user.first_name || user.last_name) && (
                        <span className="text-xs text-muted-foreground">
                          {user.first_name} {user.last_name}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.scope === 'all' && (
              <p className="text-sm text-muted-foreground">
                All strategies from all users are going to be migrated
              </p>
            )}
          </div>

          {(filters.scope === 'user' || filters.scope === 'specific') && filters.userId && (
            <div className="space-y-2">
              <Label htmlFor="strategy">Select Strategy</Label>
              <Select 
                value={filters.strategyId || 'all'} 
                onValueChange={(value) => {
                  console.log('Strategy selected:', value, 'Current filters:', filters);
                  if (value === 'all') {
                    setFilters({ scope: 'user', userId: filters.userId });
                  } else {
                    setFilters({ scope: 'specific', userId: filters.userId, strategyId: value });
                  }
                  setMigrationResult(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Strategies</SelectItem>
                  {filteredStrategies.map((strategy) => (
                    <SelectItem key={strategy.id} value={strategy.id}>
                      <div className="flex flex-col">
                        <span>{strategy.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(strategy.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Migration Summary:</strong>
              {filters.scope === 'specific' && filters.strategyId && (
                <div>Will migrate strategy: <strong>{getSelectedStrategy()?.name}</strong> for user: <strong>{getSelectedUser()?.email}</strong></div>
              )}
              {filters.scope === 'user' && filters.userId && (
                <div>Will migrate all strategies for user: <strong>{getSelectedUser()?.email}</strong> ({filteredStrategies.length} strategies)</div>
              )}
              {filters.scope === 'all' && (
                <div>Will migrate <strong>ALL strategies</strong> from <strong>ALL users</strong> ({strategies.length} total strategies)</div>
              )}
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleMigration} 
            disabled={!canMigrate() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Migrating...' : 'Start Migration'}
          </Button>
        </CardContent>
      </Card>

      {migrationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Migration Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{migrationResult.totalStrategies}</div>
                <div className="text-sm text-muted-foreground">Total Strategies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{migrationResult.migratedStrategies}</div>
                <div className="text-sm text-muted-foreground">Migrated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{migrationResult.failedStrategies}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>

            {migrationResult.totalStrategies > 0 && (
              <Progress 
                value={(migrationResult.migratedStrategies / migrationResult.totalStrategies) * 100} 
                className="w-full"
              />
            )}

            {migrationResult.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warnings:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {migrationResult.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Detailed Results</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {migrationResult.results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{result.strategyName}</div>
                      <div className="text-sm text-muted-foreground">
                        User: {strategies.find(s => s.id === result.strategyId)?.user_profiles.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.migrated ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Migrated
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          <XCircle className="h-3 w-3 mr-1" />
                          {result.error ? 'Failed' : 'No changes needed'}
                        </Badge>
                      )}
                      {result.createdTimeframes > 0 && (
                        <Badge variant="secondary">
                          +{result.createdTimeframes} TF
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}