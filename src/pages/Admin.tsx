import React, { useState } from 'react';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useAdminRole } from '@/hooks/useAdminRole';
import AdminStatusChecker from '@/components/admin/AdminStatusChecker';
import EncryptionAccessManager from '@/components/strategy/utils/import-export/EncryptionAccessManager';
import UserManagementForm from '@/components/admin/UserManagementForm';
import RoleManager from '@/components/admin/RoleManager';
import StrategyDecryption from '@/components/admin/StrategyDecryption';
import StrategyMigration from '@/pages/admin/StrategyMigration';
import ApiConfigManager from '@/components/admin/ApiConfigManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Key, AlertTriangle, Settings, Database, RefreshCw, KeyRound } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import JsonToTlsTab from '@/components/admin/decryption/JsonToTlsTab';
import JwtTestPanel from '@/components/admin/JwtTestPanel';

const Admin = () => {
  const { user } = useClerkUser();
  const { isAdmin, loading } = useAdminRole();
  const [encryptionManagerOpen, setEncryptionManagerOpen] = useState(false);

  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Please log in to access the admin panel.</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Checking admin permissions...</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">You do not have admin privileges to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Comprehensive administrative control and user management</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="api">API Config</TabsTrigger>
            <TabsTrigger value="encryption">Encryption</TabsTrigger>
            <TabsTrigger value="decryption">Decryption</TabsTrigger>
            <TabsTrigger value="json-import">JSON Import</TabsTrigger>
            <TabsTrigger value="migration">Migration</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admin Status</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Active</div>
                  <p className="text-xs text-muted-foreground">
                    You have full administrative privileges
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Role Management</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Full Control</div>
                  <p className="text-xs text-muted-foreground">
                    Grant and revoke user roles and permissions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Access</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Encryption</div>
                  <p className="text-xs text-muted-foreground">
                    Manage file access and encryption settings
                  </p>
                </CardContent>
              </Card>
            </div>

            <AdminStatusChecker />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <RoleManager />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagementForm />
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <ApiConfigManager />
          </TabsContent>

          <TabsContent value="encryption" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Encryption Access Manager
                </CardTitle>
                <CardDescription>
                  Manage user access to encrypted strategy files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EncryptionAccessManager onClose={() => {}} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decryption" className="space-y-6">
            <StrategyDecryption />
          </TabsContent>

          <TabsContent value="json-import" className="space-y-6">
            {/* JSON -> Strategy / .TLS for admins */}
            <JsonToTlsTab />
          </TabsContent>

          <TabsContent value="migration" className="space-y-6">
            <StrategyMigration />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <JwtTestPanel />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  System-wide settings and configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">System configuration options will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Encryption Manager Dialog */}
        <Dialog open={encryptionManagerOpen} onOpenChange={setEncryptionManagerOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Encryption Access Manager</DialogTitle>
            </DialogHeader>
            <EncryptionAccessManager onClose={() => setEncryptionManagerOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Admin;