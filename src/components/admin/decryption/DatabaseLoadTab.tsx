import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, User } from 'lucide-react';

import { UserWithStrategies } from '@/components/strategy/utils/storage/operations/adminStorageOperations';

interface DatabaseLoadTabProps {
  selectedUserId: string;
  setSelectedUserId: (userId: string) => void;
  selectedStrategyId: string;
  setSelectedStrategyId: (strategyId: string) => void;
  usersWithStrategies: UserWithStrategies[];
  userStrategies: Array<{id: string, name: string, created: string}>;
  onLoadFromDatabase: () => void;
  loading: boolean;
}

export const DatabaseLoadTab: React.FC<DatabaseLoadTabProps> = ({
  selectedUserId,
  setSelectedUserId,
  selectedStrategyId,
  setSelectedStrategyId,
  usersWithStrategies,
  userStrategies,
  onLoadFromDatabase,
  loading,
}) => {
  console.log('DatabaseLoadTab: usersWithStrategies received:', usersWithStrategies);
  return (
    <>
      {/* User Selection */}
      <div>
        <Label htmlFor="user-select">Select User</Label>
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Choose a user..." />
          </SelectTrigger>
          <SelectContent>
            {usersWithStrategies.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <div className="flex flex-col">
                    <div className="font-medium">
                      {user.email} - {user.first_name || user.last_name 
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : 'No Name'
                      } (ID: {user.id.slice(-8)})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.strategy_count} strategies
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Strategy Selection */}
      <div>
        <Label htmlFor="strategy-select">Select Strategy</Label>
        <Select 
          value={selectedStrategyId} 
          onValueChange={setSelectedStrategyId}
          disabled={!selectedUserId}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Choose a strategy..." />
          </SelectTrigger>
          <SelectContent>
            {userStrategies.map((strategy) => (
              <SelectItem key={strategy.id} value={strategy.id}>
                <div>
                  <div className="font-medium">{strategy.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(strategy.created).toLocaleDateString()}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Load Button */}
      <Button
        onClick={onLoadFromDatabase}
        disabled={!selectedUserId || !selectedStrategyId || loading}
        className="w-full"
      >
        {loading ? 'Loading...' : 'Load Strategy'}
      </Button>
    </>
  );
};