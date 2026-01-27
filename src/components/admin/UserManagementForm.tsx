import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Edit, Trash2, Shield, User, Crown, Search, RefreshCw, Download, Menu, Activity, Clock, Wallet } from 'lucide-react';
import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/lib/supabase/services/admin-service';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import UserPlanEditor from './UserPlanEditor';
import { UserPlan, PLAN_CONFIGS, PlanType } from '@/types/billing';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  username?: string;
  created_at: string;
  last_login?: string;
}

interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data?: any;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}

const UserManagementForm: React.FC = () => {
  const { user } = useUser();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'moderator' | 'user'>('user');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activitiesDialogOpen, setActivitiesDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [planEditorOpen, setPlanEditorOpen] = useState(false);
  const [planEditorUser, setPlanEditorUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) {
      console.log('[UserManagement] No user ID available');
      return;
    }
    
    setLoading(true);
    console.log('[UserManagement] Loading data for admin:', user.id);
    
    try {
      // Load user profiles using adminService with Clerk user ID
      const profiles = await adminService.getAllUserProfiles(user.id);
      console.log('[UserManagement] Loaded profiles:', profiles.length);

      // Load user roles
      const { data: roles, error: rolesError } = await (supabase as any)
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Load user activities
      const { data: activities, error: activitiesError } = await (supabase as any)
        .from('user_activity')
        .select('*')
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;

      // Load user plans
      const plans = await adminService.getAllUserPlans();
      console.log('[UserManagement] Loaded plans:', plans.length);

      setUsers(profiles || []);
      setUserRoles(roles || []);
      setUserActivities(activities || []);
      setUserPlans(plans || []);
    } catch (error) {
      console.error('[UserManagement] Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const syncClerkUsers = async () => {
    setSyncing(true);
    try {
      console.log('Starting user sync from Clerk...');
      
      const { data, error } = await supabase.functions.invoke('sync-clerk-users', {
        method: 'POST'
      });

      if (error) {
        console.error('Sync error:', error);
        toast({
          title: "Sync Error",
          description: error.message || "Failed to sync users from Clerk",
          variant: "destructive"
        });
      } else {
        console.log('Sync completed:', data);
        toast({
          title: "Sync Completed",
          description: `${data.results?.created || 0} users created, ${data.results?.updated || 0} users updated`,
        });
        // Reload the user list
        loadData();
      }
    } catch (error: any) {
      console.error('Sync function error:', error);
      toast({
        title: "Sync Error",
        description: error.message || "Failed to sync users from Clerk",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    try {
      await adminService.updateUserProfileAdmin(userId, updates);

      toast({
        title: "Success",
        description: "User profile updated successfully",
      });

      loadData();
      setEditDialogOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user profile",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await adminService.deleteUserProfileAdmin(userId);

      toast({
        title: "Success",
        description: "User and all related data deleted successfully",
      });

      loadData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const grantRole = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    try {
      const { error } = await (supabase as any)
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${role} role granted successfully`,
      });

      loadData();
    } catch (error: any) {
      console.error('Error granting role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to grant role",
        variant: "destructive"
      });
    }
  };

  const revokeRole = async (roleId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role revoked successfully",
      });

      loadData();
    } catch (error: any) {
      console.error('Error revoking role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to revoke role",
        variant: "destructive"
      });
    }
  };

  const getUserRoles = (userId: string) => {
    return userRoles.filter(role => role.user_id === userId);
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

  const getUserActivities = (userId: string) => {
    return userActivities.filter(activity => activity.user_id === userId);
  };

  const getLastActiveDate = (userId: string) => {
    const activities = getUserActivities(userId);
    if (activities.length === 0) return 'Never';
    
    const lastActivity = activities[0]; // Activities are ordered by created_at desc
    return new Date(lastActivity.created_at).toLocaleDateString();
  };

  const formatActivityType = (activityType: string) => {
    return activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const openUserActivities = (userId: string) => {
    setSelectedUserId(userId);
    setActivitiesDialogOpen(true);
  };

  const getUserPlan = (userId: string): UserPlan | undefined => {
    return userPlans.find(plan => plan.user_id === userId);
  };

  const getPlanBadgeVariant = (plan?: PlanType) => {
    switch (plan) {
      case 'ENTERPRISE': return 'destructive';
      case 'PRO': return 'default';
      case 'LAUNCH': return 'secondary';
      default: return 'outline';
    }
  };

  const openPlanEditor = (userProfile: UserProfile) => {
    setPlanEditorUser(userProfile);
    setPlanEditorOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading users...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user profiles, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Sync Button and Search */}
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={syncClerkUsers} 
              disabled={syncing}
              className="flex items-center gap-2"
            >
              {syncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {syncing ? 'Syncing...' : 'Sync from Clerk'}
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((userItem) => {
                    const roles = getUserRoles(userItem.id);
                    const plan = getUserPlan(userItem.id);
                    return (
                      <TableRow key={userItem.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {userItem.first_name || userItem.last_name 
                                ? `${userItem.first_name || ''} ${userItem.last_name || ''}`.trim()
                                : 'No name'
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">{userItem.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {userItem.phone_number || 'No phone'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={getPlanBadgeVariant(plan?.plan)}>
                              {plan ? PLAN_CONFIGS[plan.plan]?.name || plan.plan : 'Free'}
                            </Badge>
                            {plan?.status && plan.status !== 'active' && (
                              <Badge variant="outline" className="text-xs">
                                {plan.status}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {roles.length === 0 ? (
                              <Badge variant="outline">No roles</Badge>
                            ) : (
                              roles.map((role) => (
                                <Badge key={role.id} variant={getRoleColor(role.role)} className="flex items-center gap-1">
                                  {getRoleIcon(role.role)}
                                  {role.role}
                                  <button
                                    onClick={() => revokeRole(role.id)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(userItem.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{getLastActiveDate(userItem.id)}</span>
                          </div>
                        </TableCell>
                         <TableCell>
                           <div className="flex gap-1">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => openPlanEditor(userItem)}
                               title="Manage plan & billing"
                             >
                               <Wallet className="w-4 h-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => openUserActivities(userItem.id)}
                               title="View user activities"
                             >
                               <Menu className="w-4 h-4" />
                             </Button>
                             <Dialog open={editDialogOpen && editingUser?.id === userItem.id} onOpenChange={setEditDialogOpen}>
                               <DialogTrigger asChild>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => setEditingUser(userItem)}
                                 >
                                   <Edit className="w-4 h-4" />
                                 </Button>
                               </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit User Profile</DialogTitle>
                                  <DialogDescription>
                                    Update user information and grant roles
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="firstName">First Name</Label>
                                      <Input
                                        id="firstName"
                                        value={editingUser?.first_name || ''}
                                        onChange={(e) => setEditingUser(prev => 
                                          prev ? { ...prev, first_name: e.target.value } : null
                                        )}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="lastName">Last Name</Label>
                                      <Input
                                        id="lastName"
                                        value={editingUser?.last_name || ''}
                                        onChange={(e) => setEditingUser(prev => 
                                          prev ? { ...prev, last_name: e.target.value } : null
                                        )}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                      id="phone"
                                      value={editingUser?.phone_number || ''}
                                      onChange={(e) => setEditingUser(prev => 
                                        prev ? { ...prev, phone_number: e.target.value } : null
                                      )}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                      id="username"
                                      value={editingUser?.username || ''}
                                      onChange={(e) => setEditingUser(prev => 
                                        prev ? { ...prev, username: e.target.value } : null
                                      )}
                                    />
                                  </div>
                                  <div className="flex gap-4">
                                    <Select value={newRole} onValueChange={(value: 'admin' | 'moderator' | 'user') => setNewRole(value)}>
                                      <SelectTrigger className="flex-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="moderator">Moderator</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button onClick={() => grantRole(userItem.id, newRole)}>
                                      Grant Role
                                    </Button>
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={() => editingUser && updateUserProfile(editingUser.id, editingUser)}>
                                      Update Profile
                                    </Button>
                                  </div>
                                </div>
                               </DialogContent>
                             </Dialog>
                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   title="Delete user"
                                 >
                                   <Trash2 className="w-4 h-4 text-destructive" />
                                 </Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent>
                                 <AlertDialogHeader>
                                   <AlertDialogTitle>Delete User</AlertDialogTitle>
                                   <AlertDialogDescription>
                                     Are you sure you want to delete this user? This will permanently delete:
                                     <ul className="list-disc ml-6 mt-2">
                                       <li>User profile</li>
                                       <li>All user strategies</li>
                                       <li>User activities</li>
                                       <li>User roles</li>
                                     </ul>
                                     This action cannot be undone.
                                   </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel>Cancel</AlertDialogCancel>
                                   <AlertDialogAction
                                     onClick={() => deleteUser(userItem.id)}
                                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                   >
                                     Delete User
                                   </AlertDialogAction>
                                 </AlertDialogFooter>
                               </AlertDialogContent>
                             </AlertDialog>
                           </div>
                         </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Activities Dialog */}
      <Dialog open={activitiesDialogOpen} onOpenChange={setActivitiesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              User Activities
            </DialogTitle>
            <DialogDescription>
              {selectedUserId && (
                <>Activity history for {users.find(u => u.id === selectedUserId)?.email}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedUserId && (
              <>
                {getUserActivities(selectedUserId).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No activities found for this user
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getUserActivities(selectedUserId).map((activity) => (
                      <Card key={activity.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {formatActivityType(activity.activity_type)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(activity.created_at).toLocaleString()}
                              </span>
                            </div>
                            {activity.activity_data && (
                              <div className="text-sm bg-muted p-2 rounded">
                                <pre className="whitespace-pre-wrap text-xs">
                                  {JSON.stringify(activity.activity_data, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* User Plan Editor Dialog */}
      {planEditorUser && (
        <UserPlanEditor
          isOpen={planEditorOpen}
          onClose={() => {
            setPlanEditorOpen(false);
            setPlanEditorUser(null);
          }}
          userId={planEditorUser.id}
          userEmail={planEditorUser.email}
          userName={`${planEditorUser.first_name || ''} ${planEditorUser.last_name || ''}`.trim()}
          currentPlan={getUserPlan(planEditorUser.id)}
          onPlanUpdated={loadData}
        />
      )}
    </div>
  );
};

export default UserManagementForm;