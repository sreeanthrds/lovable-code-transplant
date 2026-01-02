
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, UserPlus, UserMinus, Users, Key } from 'lucide-react';
import { 
  grantUserAccess, 
  revokeUserAccess, 
  listUsersWithAccess,
  getUserEncryptionKey,
  getCurrentUserId
} from './encryption';


interface EncryptionAccessManagerProps {
  onClose?: () => void;
}

const EncryptionAccessManager: React.FC<EncryptionAccessManagerProps> = ({ onClose }) => {
  const [targetUserId, setTargetUserId] = useState('');
  const [dataOwnerId, setDataOwnerId] = useState('');
  const [usersWithAccess, setUsersWithAccess] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userEncryptionKey, setUserEncryptionKey] = useState('');

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (currentUserId) {
      loadUserEncryptionKey();
    }
  }, [currentUserId]);

  const loadUserEncryptionKey = async () => {
    if (!currentUserId) return;
    
    try {
      const key = await getUserEncryptionKey(currentUserId);
      setUserEncryptionKey(key);
    } catch (error) {
      console.error('Error loading user encryption key:', error);
    }
  };

  const handleGrantAccess = async () => {
    if (!targetUserId || !dataOwnerId || !currentUserId) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const success = await grantUserAccess(targetUserId, dataOwnerId, currentUserId);
      if (success) {
        setMessage(`Successfully granted access to user ${targetUserId}`);
        setTargetUserId('');
        loadUsersWithAccess();
      } else {
        setMessage('Failed to grant access. Check your admin permissions.');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (userId: string) => {
    if (!dataOwnerId || !currentUserId) {
      setMessage('Please specify the data owner ID');
      return;
    }

    setLoading(true);
    try {
      const success = await revokeUserAccess(userId, dataOwnerId, currentUserId);
      if (success) {
        setMessage(`Successfully revoked access for user ${userId}`);
        loadUsersWithAccess();
      } else {
        setMessage('Failed to revoke access. Check your admin permissions.');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadUsersWithAccess = async () => {
    if (!dataOwnerId || !currentUserId) return;

    setLoading(true);
    try {
      const users = await listUsersWithAccess(dataOwnerId, currentUserId);
      setUsersWithAccess(users);
    } catch (error) {
      setMessage(`Error loading users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Encryption Access Manager</h1>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Your Encryption Details
          </CardTitle>
          <CardDescription>
            Your unique encryption key and user information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Your User ID:</label>
              <p className="text-sm font-mono bg-muted p-2 rounded">{currentUserId}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Your Encryption Key:</label>
              <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                {userEncryptionKey || 'Loading...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grant Access Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Grant Access to Encrypted Files
          </CardTitle>
          <CardDescription>
            Allow specific users to decrypt encrypted strategy files from another user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Target User ID (who gets access):</label>
            <Input
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="Enter user ID to grant access to"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Data Owner ID (whose files to access):</label>
            <Input
              value={dataOwnerId}
              onChange={(e) => setDataOwnerId(e.target.value)}
              placeholder="Enter user ID who owns the encrypted files"
              className="mt-1"
            />
          </div>
          <Button 
            onClick={handleGrantAccess} 
            disabled={loading}
            className="w-full"
          >
            Grant Access
          </Button>
        </CardContent>
      </Card>

      {/* View Access Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users with Access
          </CardTitle>
          <CardDescription>
            View and manage users who have access to encrypted files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={loadUsersWithAccess} 
            disabled={loading || !dataOwnerId}
            variant="outline"
            className="w-full"
          >
            Load Users with Access
          </Button>
          
          {usersWithAccess.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Users with access to {dataOwnerId}'s files:</h4>
              {usersWithAccess.map((userId) => (
                <div key={userId} className="flex items-center justify-between p-2 border rounded">
                  <Badge variant="secondary">{userId}</Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRevokeAccess(userId)}
                    disabled={loading}
                  >
                    <UserMinus className="h-4 w-4" />
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Message */}
      {message && (
        <Card>
          <CardContent className="pt-6">
            <p className={`text-sm ${message.includes('Error') || message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>1. User-Specific Files:</strong> When you export strategies, they're now encrypted with your unique key and saved as .tlsu files.</p>
          <p><strong>2. Access Control:</strong> Only you can decrypt your exported files by default.</p>
          <p><strong>3. Grant Access:</strong> As an admin, you can grant other users access to decrypt specific user's files.</p>
          <p><strong>4. Admin Check:</strong> Admin permissions are checked based on your profile (email/username containing "admin").</p>
          <p><strong>5. File Extensions:</strong> .tlsu = user-specific encrypted files, .tls = shared encrypted files</p>
        </CardContent>
      </Card>

      {onClose && (
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default EncryptionAccessManager;
