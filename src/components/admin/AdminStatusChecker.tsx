
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { useAdminRole } from '@/hooks/useAdminRole';
import { userProfileService } from '@/lib/supabase/services/user-profile-service';
import { useClerkUser } from '@/hooks/useClerkUser';

const AdminStatusChecker: React.FC = () => {
  const { user, userId } = useClerkUser();
  const { isAdmin, loading } = useAdminRole();
  const [targetUserId, setTargetUserId] = useState('');
  const [message, setMessage] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    if (!userId) return;
    
    try {
      const profile = await userProfileService.getUserProfile(userId);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleGrantAdminAccess = async () => {
    setMessage('Admin role management is now handled through the Roles tab.');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Checking admin status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current User Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Admin Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Badge variant="default" className="bg-green-500">Admin</Badge>
                <span className="text-sm text-green-600">You have admin privileges</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <Badge variant="secondary">Regular User</Badge>
                <span className="text-sm text-red-600">No admin privileges</span>
              </>
            )}
          </div>
          
          <div className="space-y-2 text-sm">
            <div><strong>User ID:</strong> {userId}</div>
            <div><strong>Email:</strong> {user?.emailAddresses?.[0]?.emailAddress}</div>
            <div><strong>Profile Email:</strong> {userProfile?.email || 'Not set'}</div>
            <div><strong>Username:</strong> {userProfile?.username || 'Not set'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Grant Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Target User ID:</label>
              <Input
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="Enter user ID to grant admin access"
                className="mt-1"
              />
            </div>
            <Button onClick={handleGrantAdminAccess} className="w-full">
              Grant Admin Access
            </Button>
          </CardContent>
        </Card>
      )}

      {/* How to Become Admin */}
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>How to Become Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
             <p>Admin privileges are managed through the database role system:</p>
             <ol className="list-decimal list-inside space-y-1 ml-4">
               <li>Admin roles are stored in the user_roles table</li>
               <li>Use the "Roles" tab to manage user roles and permissions</li>
               <li>Contact a system administrator for role assignments</li>
             </ol>
             <p className="text-muted-foreground mt-3">
               Your current role status is determined by the user_roles database table.
             </p>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
};

export default AdminStatusChecker;
