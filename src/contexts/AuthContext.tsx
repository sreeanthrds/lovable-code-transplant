import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  emailAddresses?: { emailAddress: string }[];
  createdAt?: Date | number | null;
}

interface AuthContextType {
  user: AuthUser | null;
  userId: string | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  isAdmin: boolean;
  isAdminLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convert Supabase User to our AuthUser format
 */
const mapSupabaseUser = (user: User | null): AuthUser | null => {
  if (!user) return null;

  const email = user.email;
  const phone = user.phone;
  const metadata = user.user_metadata || {};

  return {
    id: user.id,
    email: email,
    phone: phone,
    firstName: metadata.first_name || metadata.given_name || undefined,
    lastName: metadata.last_name || metadata.family_name || undefined,
    fullName: metadata.full_name || metadata.name || undefined,
    imageUrl: metadata.avatar_url || metadata.picture || undefined,
    emailAddresses: email ? [{ emailAddress: email }] : [],
    createdAt: user.created_at ? new Date(user.created_at) : null,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Cached admin role state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const adminCheckRef = useRef<string | null>(null);

  /**
   * Check if user has admin role
   */
  const checkAdminStatus = useCallback(async (userId: string | null) => {
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
  }, []);

  /**
   * Refresh the current session
   */
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      setSession(newSession);
      setUser(mapSupabaseUser(newSession?.user ?? null));
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }, []);

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
    // Reset state
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    adminCheckRef.current = null;
  }, []);

  // Initialize auth state and listen for changes
  useEffect(() => {
    console.log('🔐 Initializing Supabase Auth...');

    // Set up auth state listener FIRST (before checking session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, newSession: Session | null) => {
        console.log('🔄 Auth state changed:', event);
        
        setSession(newSession);
        setUser(mapSupabaseUser(newSession?.user ?? null));
        
        // Use setTimeout to defer admin check (avoid Supabase deadlock)
        if (newSession?.user?.id) {
          setTimeout(() => {
            checkAdminStatus(newSession.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsAdminLoading(false);
          adminCheckRef.current = null;
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      
      setSession(existingSession);
      setUser(mapSupabaseUser(existingSession?.user ?? null));
      setIsLoaded(true);

      if (existingSession?.user?.id) {
        checkAdminStatus(existingSession.user.id);
      } else {
        setIsAdminLoading(false);
      }

      console.log('✅ Supabase Auth initialized', existingSession ? '(authenticated)' : '(not authenticated)');
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const userId = user?.id ?? null;
  const isAuthenticated = !!session && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      userId,
      session,
      isAuthenticated,
      isLoaded,
      isAdmin,
      isAdminLoading,
      signOut,
      refreshSession,
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
