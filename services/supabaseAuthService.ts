// Supabase Auth service
// Replaces Neon Auth (Stack Auth) with Supabase Auth

import { getSupabaseClient } from './supabaseService';
import type { UserProfile } from '../types';

/**
 * Sign up a new user with Supabase Auth
 */
export const signUp = async (name: string, email: string, password: string): Promise<{ profile: UserProfile, userId: string }> => {
  console.log('🔵 Supabase Auth signUp called:', { name, email, passwordLength: password.length });
  
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('❌ Supabase client not available');
    throw new Error('Supabase client not available. Check your Supabase configuration (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).');
  }
  
  console.log('✅ Supabase client obtained');
  
  try {
    console.log('🔵 Calling supabase.auth.signUp...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          display_name: name,
        },
      },
    });
    
    console.log('Supabase signUp response:', { 
      hasData: !!data, 
      hasUser: !!data?.user, 
      hasError: !!error,
      errorMessage: error?.message 
    });
    
    if (error) {
      console.error('❌ Supabase sign up error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw new Error(error.message || 'Failed to create account. Please try again.');
    }
    
    if (!data.user) {
      console.error('❌ User object was null');
      throw new Error('Failed to create account. User object was null.');
    }
    
    console.log('✅ Supabase user created:', { userId: data.user.id, email: data.user.email });
    
    return {
      profile: {
        name: data.user.user_metadata?.name || data.user.user_metadata?.display_name || name,
        email: data.user.email || email,
        imageUrl: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
      },
      userId: data.user.id,
    };
  } catch (error: any) {
    console.error('❌ Error in Supabase sign up:', error);
    console.error('Error type:', typeof error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    throw error;
  }
};

/**
 * Sign in an existing user with Supabase Auth
 */
export const signIn = async (email: string, password: string): Promise<{ profile: UserProfile, userId: string }> => {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    throw new Error('Supabase client not available. Check your Supabase configuration.');
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Supabase sign in error:', error);
      throw new Error(error.message || 'Invalid email or password.');
    }
    
    if (!data.user) {
      throw new Error('Sign in failed. User object was null.');
    }
    
    return {
      profile: {
        name: data.user.user_metadata?.name || data.user.user_metadata?.display_name || email.split('@')[0],
        email: data.user.email || email,
        imageUrl: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(email)}`,
      },
      userId: data.user.id,
    };
  } catch (error: any) {
    console.error('Error in Supabase sign in:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  const supabase = getSupabaseClient();
  
  if (supabase) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
      }
    } catch (error) {
      console.error('Error signing out from Supabase:', error);
    }
  }
  
  // Always clear localStorage as fallback
  localStorage.removeItem('imageedit_currentUser');
};

/**
 * Get the currently signed-in user
 */
export const getCurrentUser = async (): Promise<{ profile: UserProfile, userId: string } | null> => {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    // Fallback to localStorage
    const session = localStorage.getItem('imageedit_currentUser');
    if (session) {
      const parsed = JSON.parse(session);
      return {
        profile: parsed.profile,
        userId: parsed.userId,
      };
    }
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // Don't log "Auth session missing" errors - this is expected when not logged in
      const isSessionMissing = error.message?.includes('Auth session missing') || 
                               error.name === 'AuthSessionMissingError' ||
                               error.message?.includes('session');
      
      if (!isSessionMissing) {
        // Only log unexpected errors
        console.error('Error getting user from Supabase:', error);
      }
      
      // Fallback to localStorage
      const session = localStorage.getItem('imageedit_currentUser');
      if (session) {
        const parsed = JSON.parse(session);
        return {
          profile: parsed.profile,
          userId: parsed.userId,
        };
      }
      return null;
    }
    
    if (!user) {
      return null;
    }
    
    return {
      profile: {
        name: user.user_metadata?.name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        imageUrl: user.user_metadata?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.email || 'user')}`,
      },
      userId: user.id,
    };
  } catch (error: any) {
    // Don't log "Auth session missing" errors - this is expected when not logged in
    const isSessionMissing = error?.message?.includes('Auth session missing') || 
                             error?.name === 'AuthSessionMissingError' ||
                             error?.message?.includes('session');
    
    if (!isSessionMissing) {
      // Only log unexpected errors
      console.error('Error getting current user:', error);
    }
    
    return null;
  }
};

/**
 * Check if Supabase Auth is configured
 */
export const isSupabaseAuthConfigured = (): boolean => {
  return isSupabaseConfigured();
};

// Re-export for convenience
import { isSupabaseConfigured } from './supabaseService';
export { isSupabaseConfigured };

