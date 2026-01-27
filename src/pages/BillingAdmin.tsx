import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Settings, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PlanDefinitionsManager } from '@/components/billing-admin/PlanDefinitionsManager';
import { useAdminRole } from '@/hooks/useAdminRole';

export default function BillingAdmin() {
  const { isAdmin, loading: adminLoading } = useAdminRole();

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need administrator privileges to access the billing management page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/app/strategies">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="icon">
                <Link to="/app/admin">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <CreditCard className="h-6 w-6" />
                  Billing Administration
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage plans, pricing, and subscription configurations
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            <PlanDefinitionsManager />
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Subscriptions</CardTitle>
                <CardDescription>
                  View and manage active user subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  User subscription management coming soon. For now, use the Admin → Plans tab.
                </p>
                <Button asChild variant="link" className="p-0 mt-4">
                  <Link to="/app/admin">Go to Admin Panel → Plans Tab</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Analytics</CardTitle>
                <CardDescription>
                  Revenue, subscription metrics, and usage analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Billing analytics dashboard coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
