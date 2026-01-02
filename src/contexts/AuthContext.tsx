import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';

interface EmailAddress {
  emailAddress: string;
}

interface AuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  emailAddresses?: EmailAddress[];
  createdAt?: Date | number | null;
}

interface AuthContextType {
  user: AuthUser | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  isMockAuth: boolean;
  isAdmin: boolean;
  isAdminLoading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fallback mock user when Clerk fails
const MOCK_USER: AuthUser = {
  id: 'dev-user-tradelayout',
  email: 'developer@tradelayout.com',
  firstName: 'Demo',
  lastName: 'User',
  fullName: 'Demo User',
  emailAddresses: [{ emailAddress: 'developer@tradelayout.com' }],
  createdAt: Date.now(),
};

const CLERK_LOAD_TIMEOUT = 3000; // 3 seconds timeout for Clerk to load

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [useMockAuth, setUseMockAuth] = useState(false);
  const [mockAuthenticated, setMockAuthenticated] = useState(true);
  const [clerkUser, setClerkUser] = useState<AuthUser | null>(null);
  const [clerkLoaded, setClerkLoaded] = useState(false);
  const [clerkSignedIn, setClerkSignedIn] = useState(false);
  
  // Cached admin role state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const adminCheckRef = useRef<string | null>(null);

  // Try to get Clerk state from window.Clerk
  const checkClerkState = useCallback(() => {
    try {
      const clerk = (window as any).Clerk;
      if (clerk) {
        if (clerk.loaded) {
          setClerkLoaded(true);
          if (clerk.user) {
            setClerkSignedIn(true);
            setClerkUser({
              id: clerk.user.id,
              email: clerk.user.emailAddresses?.[0]?.emailAddress,
              firstName: clerk.user.firstName || undefined,
              lastName: clerk.user.lastName || undefined,
              fullName: clerk.user.fullName || undefined,
              imageUrl: clerk.user.imageUrl,
              emailAddresses: clerk.user.emailAddresses || [],
              createdAt: clerk.user.createdAt || null,
            });
          } else {
            setClerkSignedIn(false);
            setClerkUser(null);
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.warn('⚠️ Error checking Clerk state:', error);
      return false;
    }
  }, []);

  // Monitor Clerk loading with polling and timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    // Poll for Clerk state
    intervalId = setInterval(() => {
      if (checkClerkState()) {
        console.log('✅ Clerk loaded successfully via polling');
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      }
    }, 200);

    // Timeout fallback
    timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      if (!clerkLoaded) {
        console.warn('⚠️ Clerk failed to load within timeout, using mock auth');
        setUseMockAuth(true);
      }
    }, CLERK_LOAD_TIMEOUT);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [checkClerkState, clerkLoaded]);

  // Listen for Clerk errors
  useEffect(() => {
    const handleClerkError = (event: ErrorEvent) => {
      if (event.message?.toLowerCase().includes('clerk')) {
        console.warn('⚠️ Clerk error detected, using mock auth:', event.message);
        setUseMockAuth(true);
      }
    };

    window.addEventListener('error', handleClerkError);
    return () => window.removeEventListener('error', handleClerkError);
  }, []);

  // Determine current auth state
  const isMockAuth = useMockAuth;
  const isLoaded = useMockAuth || clerkLoaded;
  const isAuthenticated = useMockAuth ? mockAuthenticated : clerkSignedIn;
  
  const user: AuthUser | null = useMockAuth 
    ? (mockAuthenticated ? MOCK_USER : null)
    : clerkUser;

  const userId = user?.id || null;

  // Fetch admin role once when userId changes (cached)
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!userId) {
        setIsAdmin(false);
        setIsAdminLoading(false);
        adminCheckRef.current = null;
        return;
      }

      // Skip if we already checked for this user
      if (adminCheckRef.current === userId) {
        return;
      }

      setIsAdminLoading(true);
      adminCheckRef.current = userId;

      try {
        const { data, error } = await supabase.rpc('has_role', { 
          _user_id: userId, 
          _role: 'admin' 
        });

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data || false);
        }
      } catch (error) {
        console.error('Error calling has_role function:', error);
        setIsAdmin(false);
      } finally {
        setIsAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [userId]);

  const signOut = useCallback(() => {
    if (useMockAuth) {
      setMockAuthenticated(false);
    } else {
      try {
        const clerk = (window as any).Clerk;
        if (clerk?.signOut) {
          clerk.signOut();
        }
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
    // Reset admin state on sign out
    setIsAdmin(false);
    adminCheckRef.current = null;
  }, [useMockAuth]);

  return (
    <AuthContext.Provider value={{
      user,
      userId,
      isAuthenticated,
      isLoaded,
      isMockAuth,
      isAdmin,
      isAdminLoading,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAppAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAppAuth must be used within an AuthProvider');
  }
  return context;
};
