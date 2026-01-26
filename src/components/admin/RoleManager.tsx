import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Trash2, Shield, User, Crown } from 'lucide-react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useToast } from '@/hooks/use-toast';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}

const RoleManager: React.FC = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'moderator' | 'user'>('user');
  const [loading, setLoading] = useState(true);
  const { getAuthenticatedClient } = useSupabaseClient();
  const { toast } = useToast();

  const loadUserRoles = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = await getAuthenticatedClient();
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error loading user roles:', error);
      toast({
        title: "Error",
        description: "Failed to load user roles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [getAuthenticatedClient, toast]);

  useEffect(() => {
    loadUserRoles();
  }, [loadUserRoles]);

  const addRole = async () => {
    if (!newUserId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive"
      });
      return;
    }

    try {
      const supabase = await getAuthenticatedClient();
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: newUserId.trim(),
          role: newRole
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role ${newRole} added for user ${newUserId}`,
      });

      setNewUserId('');
      setNewRole('user');
      loadUserRoles();
    } catch (error: any) {
      console.error('Error adding role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add role",
        variant: "destructive"
      });
    }
  };

  const removeRole = async (roleId: string) => {
    try {
      const supabase = await getAuthenticatedClient();
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role removed successfully",
      });

      loadUserRoles();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'moderator':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading roles...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Role Management
        </CardTitle>
        <CardDescription>
          Grant and revoke user roles for administrative access
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Add Role Form */}
        <div className="flex gap-4 mb-6 p-4 border rounded-lg">
          <Input
            placeholder="User ID (from Clerk)"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            className="flex-1"
          />
          <Select value={newRole} onValueChange={(value: 'admin' | 'moderator' | 'user') => setNewRole(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addRole} className="whitespace-nowrap">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        </div>

        {/* Roles Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Added Date</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No roles assigned yet
                  </TableCell>
                </TableRow>
              ) : (
                userRoles.map((userRole) => (
                  <TableRow key={userRole.id}>
                    <TableCell className="font-mono text-sm">
                      {userRole.user_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleColor(userRole.role)} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(userRole.role)}
                        {userRole.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(userRole.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRole(userRole.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleManager;