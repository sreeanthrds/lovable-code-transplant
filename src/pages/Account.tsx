import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, ExternalLink, Shield, Key, Bell, Smartphone, Wallet, CreditCard, BarChart3 } from 'lucide-react';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useAdminRole } from '@/hooks/useAdminRole';
import UserLoginDetails from '@/components/auth/UserLoginDetails';
import UserProfilesManager from '@/components/admin/UserProfilesManager';
import UserBillingTab from '@/components/account/UserBillingTab';
import UserPaymentHistoryTab from '@/components/account/UserPaymentHistoryTab';
import AppLayout from '@/layouts/AppLayout';
import { useSearchParams } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';

const Account = () => {
  const { user, isLoading } = useClerkUser();
  const { isAdmin } = useAdminRole();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container max-w-5xl py-10">
          <div className="flex items-center justify-center">
            <p className="text-white/70">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const displayName = user?.fullName || 'User';
  const email = user?.emailAddresses[0]?.emailAddress || '';
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const tabCount = isAdmin ? 6 : 5;
  
  return (
    <AppLayout>
      <div className="container max-w-5xl py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white/95">Account Settings</h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <div className="glass-card flex flex-col items-center gap-4 p-6 rounded-xl">
                <Avatar className="h-20 w-20 ring-2 ring-primary/30">
                  <AvatarImage src={user?.imageUrl} alt={displayName} />
                  <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                    {email.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-2">
                  <h3 className="font-medium text-white/95">{displayName}</h3>
                  <p className="text-sm text-white/60">{email}</p>
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/20 text-primary border border-primary/30">
                    Active
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <Tabs defaultValue={defaultTab}>
                <TabsList className="grid grid-cols-5 md:grid-cols-6 mb-8 bg-white/5">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Profile</TabsTrigger>
                  <TabsTrigger value="billing" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <Wallet className="w-4 h-4 mr-1 hidden md:inline" />
                    Billing
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <CreditCard className="w-4 h-4 mr-1 hidden md:inline" />
                    Payments
                  </TabsTrigger>
                  <TabsTrigger value="security" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Security</TabsTrigger>
                  <TabsTrigger value="login-info" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Login Info</TabsTrigger>
                  {isAdmin && (
                    <TabsTrigger value="admin" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                      <Users className="w-4 h-4 mr-2" />
                      Admin
                    </TabsTrigger>
                  )}
                </TabsList>
              
              <TabsContent value="profile">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white/95">Profile Information</CardTitle>
                    <CardDescription className="text-white/60">
                      Your profile information from Clerk
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white/80">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={firstName}
                          disabled
                          className="bg-white/5 border-white/10 text-white/90"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white/80">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={lastName}
                          disabled
                          className="bg-white/5 border-white/10 text-white/90"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/80">Email</Label>
                      <Input id="email" type="email" value={email} disabled className="bg-white/5 border-white/10 text-white/90" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userId" className="text-white/80">User ID</Label>
                      <Input id="userId" value={user?.id || ''} disabled className="bg-white/5 border-white/10 text-white/90" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-white/50">
                      Profile information is managed through Clerk. Use the user menu to update your profile.
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <UserBillingTab />
              </TabsContent>

              <TabsContent value="payments">
                <UserPaymentHistoryTab />
              </TabsContent>
              
              <TabsContent value="security">
                <div className="space-y-6">
                  {/* Password Management */}
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white/95">
                        <Key className="w-5 h-5 text-primary" />
                        Password Management
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Manage your password and authentication methods
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="space-y-1">
                          <p className="font-medium text-white/90">Change Password</p>
                          <p className="text-sm text-white/50">
                            Update your password through Clerk's secure interface
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="border-primary/30 text-primary hover:bg-primary/10"
                          onClick={() => window.open('https://accounts.clerk.dev/user', '_blank')}
                        >
                          Change Password
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Two-Factor Authentication */}
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white/95">
                        <Smartphone className="w-5 h-5 text-primary" />
                        Two-Factor Authentication
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Add an extra layer of security to your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="space-y-1">
                          <p className="font-medium text-white/90">Authenticator App</p>
                          <p className="text-sm text-white/50">
                            Use an authenticator app for 2FA codes
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="border-primary/30 text-primary hover:bg-primary/10"
                          onClick={() => window.open('https://accounts.clerk.dev/user/security', '_blank')}
                        >
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notification Preferences */}
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white/95">
                        <Bell className="w-5 h-5 text-primary" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Manage how you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="space-y-1">
                          <p className="font-medium text-white/90">Email Notifications</p>
                          <p className="text-sm text-white/50">
                            Receive trading alerts and account updates via email
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="space-y-1">
                          <p className="font-medium text-white/90">Strategy Alerts</p>
                          <p className="text-sm text-white/50">
                            Get notified when your strategies trigger signals
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="space-y-1">
                          <p className="font-medium text-white/90">Security Alerts</p>
                          <p className="text-sm text-white/50">
                            Be notified of suspicious activity on your account
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Sessions */}
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white/95">
                        <Shield className="w-5 h-5 text-primary" />
                        Active Sessions
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Manage your active sessions and devices
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="space-y-1">
                          <p className="font-medium text-white/90">View All Sessions</p>
                          <p className="text-sm text-white/50">
                            See all devices where you're logged in
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="border-primary/30 text-primary hover:bg-primary/10"
                          onClick={() => window.open('https://accounts.clerk.dev/user/security', '_blank')}
                        >
                          View Sessions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="login-info">
                <UserLoginDetails />
              </TabsContent>

              {isAdmin && (
                <TabsContent value="admin">
                  <div className="space-y-6">
                    {/* Clerk Dashboard Access */}
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white/95">
                          <ExternalLink className="w-5 h-5 text-primary" />
                          Clerk Dashboard Access
                        </CardTitle>
                        <CardDescription className="text-white/60">
                          View all users and authentication settings in the Clerk Dashboard
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg border-primary/20 bg-primary/5">
                            <h4 className="font-medium text-white/90 mb-2">
                              Why can't we embed the dashboard?
                            </h4>
                            <p className="text-sm text-white/60 mb-3">
                              Clerk's dashboard has security restrictions that prevent embedding for protection against clickjacking attacks. 
                              You'll need to open it in a separate tab to access all user data and settings.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                              <h4 className="font-medium mb-2 text-white/90">Users in Supabase</h4>
                              <p className="text-sm text-white/50 mb-2">
                                Users with created profiles in your database
                              </p>
                              <p className="text-lg font-semibold text-primary">Managed below ↓</p>
                            </div>
                            
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                              <h4 className="font-medium mb-2 text-white/90">All Clerk Users</h4>
                              <p className="text-sm text-white/50 mb-2">
                                Complete user data including those without profiles
                              </p>
                              <Button 
                                onClick={() => window.open('https://dashboard.clerk.com', '_blank')}
                                className="w-full"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Clerk Dashboard
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Existing User Profiles Manager */}
                    <UserProfilesManager />
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
    </AppLayout>
  );
};

export default Account;
