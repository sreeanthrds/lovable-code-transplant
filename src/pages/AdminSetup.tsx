import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import QuickAdminSetup from '@/components/admin/QuickAdminSetup';

const AdminSetup = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Setup</h1>
          <p className="text-muted-foreground">
            Grant yourself admin access to see the admin tab in navigation
          </p>
        </div>
        <QuickAdminSetup />
      </div>
    </AppLayout>
  );
};

export default AdminSetup;