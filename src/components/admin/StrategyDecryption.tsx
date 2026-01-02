import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Upload, Database } from 'lucide-react';
import { useAdminRole } from '@/hooks/useAdminRole';
import { decryptStrategyData } from '@/components/strategy/utils/import-export/encryptionUtils';
import { getAllUsersWithStrategies, getStrategiesForUser, loadUserStrategy, UserWithStrategies } from '@/components/strategy/utils/storage/operations/adminStorageOperations';
import { FileDecryptionTab } from './decryption/FileDecryptionTab';
import { DatabaseLoadTab } from './decryption/DatabaseLoadTab';
import { DecryptedResult } from './decryption/DecryptedResult';
import { DecryptionInstructions } from './decryption/DecryptionInstructions';

const StrategyDecryption: React.FC = () => {
  const { user } = useUser();
  const { isAdmin } = useAdminRole();
  const [encryptedData, setEncryptedData] = useState('');
  const [decryptedData, setDecryptedData] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // State for user/strategy selection
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [usersWithStrategies, setUsersWithStrategies] = useState<UserWithStrategies[]>([]);
  const [userStrategies, setUserStrategies] = useState<Array<{id: string, name: string, created: string}>>([]);
  const [activeTab, setActiveTab] = useState<'file' | 'database'>('file');

  // Load users with strategies on component mount
  useEffect(() => {
    console.log('StrategyDecryption: isAdmin =', isAdmin, 'user.id =', user?.id);
    if (isAdmin && user?.id) {
      console.log('Loading users with strategies from database...');
      const loadUsers = async () => {
        const users = await getAllUsersWithStrategies(user.id);
        console.log('Found users with strategies:', users);
        setUsersWithStrategies(users);
      };
      loadUsers();
    }
  }, [isAdmin, user?.id]);

  // Load strategies when user is selected
  useEffect(() => {
    if (selectedUserId) {
      const loadStrategies = async () => {
        const strategies = await getStrategiesForUser(selectedUserId);
        setUserStrategies(strategies);
        setSelectedStrategyId(''); // Reset strategy selection
      };
      loadStrategies();
    } else {
      setUserStrategies([]);
      setSelectedStrategyId('');
    }
  }, [selectedUserId]);


  const handleDecrypt = async () => {
    if (!encryptedData.trim()) {
      setError('Please provide encrypted data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Only support .tls shared encryption for admins
      console.log('Attempting admin decryption...');
      const result = decryptStrategyData(encryptedData);
      setDecryptedData(JSON.stringify(result, null, 2));
    } catch (error: any) {
      console.error('Decryption error:', error);
      setError(`Decryption failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFromDatabase = async () => {
    if (!selectedUserId || !selectedStrategyId) {
      setError('Please select both user and strategy');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log(`Loading strategy ${selectedStrategyId} for user ${selectedUserId}`);
      const strategy = await loadUserStrategy(selectedUserId, selectedStrategyId);
      
      if (strategy) {
        setDecryptedData(JSON.stringify(strategy, null, 2));
        setEncryptedData(''); // Clear encrypted data since we loaded from database
      } else {
        setError('Strategy not found or could not be loaded');
      }
    } catch (error: any) {
      console.error('Database load error:', error);
      setError(`Failed to load strategy: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };



  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              Only administrators can access the strategy decryption tool.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Strategy Decryption Tool
          </CardTitle>
          <CardDescription>
            Decrypt .tls strategy files (Admin only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tab Selection */}
          <div className="flex space-x-2 p-1 bg-muted rounded-lg">
            <Button
              variant={activeTab === 'file' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('file')}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Decrypt File
            </Button>
            <Button
              variant={activeTab === 'database' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('database')}
              className="flex-1"
            >
              <Database className="w-4 h-4 mr-2" />
              Load from Database
            </Button>
          </div>

          {activeTab === 'file' ? (
            <FileDecryptionTab
              encryptedData={encryptedData}
              setEncryptedData={setEncryptedData}
              onDecrypt={handleDecrypt}
              loading={loading}
              setError={setError}
            />
          ) : (
            <DatabaseLoadTab
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
              selectedStrategyId={selectedStrategyId}
              setSelectedStrategyId={setSelectedStrategyId}
              usersWithStrategies={usersWithStrategies}
              userStrategies={userStrategies}
              onLoadFromDatabase={handleLoadFromDatabase}
              loading={loading}
            />
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decrypted Result */}
      {decryptedData && (
        <DecryptedResult 
          decryptedData={decryptedData} 
          sourceUserId={activeTab === 'database' ? selectedUserId : undefined}
        />
      )}

      {/* Instructions */}
      <DecryptionInstructions />
    </div>
  );
};

export default StrategyDecryption;