import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useClerkUser } from '@/hooks/useClerkUser';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard that restricts access to admin users only.
 * Redirects non-admin users to the strategies page.
 */
const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useClerkUser();
  const { isAdmin, loading: adminLoading } = useAdminRole();

  // Show loading while checking authentication and admin status
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Redirect to strategies page if not admin
  if (!isAdmin) {
    return <Navigate to="/app/strategies" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
