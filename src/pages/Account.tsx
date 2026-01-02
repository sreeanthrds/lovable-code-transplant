import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreditCard, Users, ExternalLink } from 'lucide-react';
import { useClerkUser } from '@/hooks/useClerkUser';
import UserLoginDetails from '@/components/auth/UserLoginDetails';
import UserProfilesManager from '@/components/admin/UserProfilesManager';

const Account = () => {
  const { user, isLoading } = useClerkUser();

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-10">
        <div className="flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.fullName || 'User';
  const email = user?.emailAddresses[0]?.emailAddress || '';
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  
  return (
    <div className="container max-w-5xl py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.imageUrl} alt={displayName} />
                <AvatarFallback className="text-2xl">
                  {email.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-2">
                <h3 className="font-medium">{displayName}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Active
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <Tabs defaultValue="profile">
              <TabsList className="grid grid-cols-5 mb-8">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="login-info">Login Info</TabsTrigger>
                <TabsTrigger value="admin">
                  <Users className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Your profile information from Clerk
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={firstName}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={lastName}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userId">User ID</Label>
                      <Input id="userId" value={user?.id || ''} disabled />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">
                      Profile information is managed through Clerk. Use the user menu to update your profile.
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Security settings are managed through Clerk
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Password Management</Label>
                      <p className="text-sm text-muted-foreground">
                        Password changes are handled through Clerk's secure interface.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Configure 2FA through your Clerk user profile.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">
                      Use the user menu in the top-right to access all security settings.
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>
                      Manage your subscription and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-6">
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded">
                              <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">Current Plan</h3>
                              <p className="text-sm text-muted-foreground">Free Plan</p>
                            </div>
                          </div>
                          <Button disabled>Upgrade Soon</Button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Payment Methods</h3>
                        <p className="text-sm text-muted-foreground">No payment methods configured yet.</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Billing History</h3>
                        <p className="text-sm text-muted-foreground">No billing history available.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="login-info">
                <UserLoginDetails />
              </TabsContent>

              <TabsContent value="admin">
                <div className="space-y-6">
                  {/* Clerk Dashboard Access */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ExternalLink className="w-5 h-5" />
                        Clerk Dashboard Access
                      </CardTitle>
                      <CardDescription>
                        View all users and authentication settings in the Clerk Dashboard
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                            Why can't we embed the dashboard?
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                            Clerk's dashboard has security restrictions that prevent embedding for protection against clickjacking attacks. 
                            You'll need to open it in a separate tab to access all user data and settings.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Users in Supabase</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Users with created profiles in your database
                            </p>
                            <p className="text-lg font-semibold">Managed below ↓</p>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">All Clerk Users</h4>
                            <p className="text-sm text-muted-foreground mb-2">
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
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
