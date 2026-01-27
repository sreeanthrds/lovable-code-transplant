/**
 * Supabase Auth Service
 * 
 * Provides authentication methods for:
 * - Phone OTP login
 * - Email OTP login (passwordless)
 * - Google OAuth
 */

import { supabase } from '@/integrations/supabase/client';
import { Provider } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  error?: string;
  needsVerification?: boolean;
}

/**
 * Send OTP to phone number
 */
export const signInWithPhoneOtp = async (phone: string): Promise<AuthResult> => {
  try {
    // Validate phone format (basic validation)
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone.startsWith('+')) {
      return { success: false, error: 'Phone number must include country code (e.g., +91...)' };
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: cleanPhone,
    });

    if (error) {
      console.error('Phone OTP error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, needsVerification: true };
  } catch (error) {
    console.error('Phone OTP error:', error);
    return { success: false, error: 'Failed to send OTP. Please try again.' };
  }
};

/**
 * Send OTP to email (passwordless)
 */
export const signInWithEmailOtp = async (email: string): Promise<AuthResult> => {
  try {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/app/strategies`,
      },
    });

    if (error) {
      console.error('Email OTP error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, needsVerification: true };
  } catch (error) {
    console.error('Email OTP error:', error);
    return { success: false, error: 'Failed to send OTP. Please try again.' };
  }
};

/**
 * Verify phone OTP code
 */
export const verifyPhoneOtp = async (phone: string, token: string): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) {
      console.error('Phone OTP verification error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Phone OTP verification error:', error);
    return { success: false, error: 'Failed to verify OTP. Please try again.' };
  }
};

/**
 * Verify email OTP code
 */
export const verifyEmailOtp = async (email: string, token: string): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      console.error('Email OTP verification error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Email OTP verification error:', error);
    return { success: false, error: 'Failed to verify OTP. Please try again.' };
  }
};

/**
 * Sign in with OAuth provider (Google, GitHub, etc.)
 */
export const signInWithOAuth = async (provider: Provider): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/app/strategies`,
      },
    });

    if (error) {
      console.error('OAuth error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('OAuth error:', error);
    return { success: false, error: 'Failed to sign in. Please try again.' };
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<AuthResult> => {
  return signInWithOAuth('google');
};

/**
 * Sign out
 */
export const signOutUser = async (): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: 'Failed to sign out. Please try again.' };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Get user error:', error);
    return null;
  }
  return user;
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Get session error:', error);
    return null;
  }
  return session;
};
