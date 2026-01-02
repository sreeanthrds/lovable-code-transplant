import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, UserPlus } from 'lucide-react';
import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';
import { useToast } from '@/hooks/use-toast';
import { useClerkUser } from '@/hooks/useClerkUser';

const QuickAdminSetup: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useClerkUser();

  // Auto-fill current user ID
  React.useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user]);

  const checkExistingRoles = async (userId: string) => {
    try {
      const { data: roles, error } = await (supabase as any)
        .from('user_roles')
        .select('role, created_at')
        .eq('user_id', userId);

      if (error) throw error;
      return roles || [];
    } catch (error) {
      console.error('Error checking roles:', error);
      return [];
    }
  };

  const grantAdminRole = async () => {
    if (!userId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // First check if user already has roles
      const existingRoles = await checkExistingRoles(userId.trim());
      
      if (existingRoles.length > 0) {
        const hasAdmin = existingRoles.some(role => role.role === 'admin');
        if (hasAdmin) {
          toast({
            title: "Already Admin",
            description: `This user already has admin role (granted ${new Date(existingRoles.find(r => r.role === 'admin')?.created_at || '').toLocaleDateString()}). Refresh the page to see the admin tab.`,
          });
          setUserId('');
          setLoading(false);
          return;
        }
      }

      const { error } = await (supabase as any)
        .from('user_roles')
        .insert({
          user_id: userId.trim(),
          role: 'admin'
        });

      if (error) {
        // Handle specific RLS violation
        if (error.code === '42501') {
          toast({
            title: "Permission Denied",
            description: "Unable to grant admin role due to security policies. Please contact a system administrator or use the database migration to manually add the admin role.",
            variant: "destructive"
          });
        } else if (error.message.includes('duplicate') || error.message.includes('unique')) {
          toast({
            title: "Already Admin", 
            description: "This user already has admin role. Refresh the page to see admin tab.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success!",
          description: "Admin role granted successfully. Refresh the page to see the admin tab.",
        });
      }

      // Clear the input
      setUserId('');
    } catch (error: any) {
      console.error('Error granting admin role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to grant admin role",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Quick Admin Setup
        </CardTitle>
        <CardDescription>
          Grant admin role to see the admin tab in navigation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="userId">User ID (Clerk ID)</Label>
          <Input
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter Clerk user ID"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your current user ID is pre-filled above
          </p>
        </div>
        
        <Button 
          onClick={grantAdminRole} 
          disabled={loading}
          className="w-full"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {loading ? 'Granting Admin...' : 'Grant Admin Role'}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Steps:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click "Grant Admin Role" above</li>
            <li>Refresh the page</li>
            <li>Look for "Admin" tab in the navigation</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickAdminSetup;