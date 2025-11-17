// Service to get complete user information including subscription tier
// This combines auth data (from localStorage) with subscription data (from user_usage table)

import * as authService from './authService';
import { getUserUsage, type UserUsage } from './usageService';
import type { UserProfile } from '../types';

const FUNCTIONS_URL = import.meta.env.VITE_NETLIFY_FUNCTIONS_URL || '/.netlify/functions';

export interface CompleteUser {
  profile: UserProfile;
  userId: string;
  subscriptionTier: 'free' | 'starter' | 'pro' | 'business';
  userLevel: 'user' | 'admin';
  isPro: boolean; // true if tier is 'pro' or 'business'
  isAdmin: boolean; // true if user_level is 'admin'
  usage?: UserUsage;
}

/**
 * Gets complete user information including subscription tier from database
 * This is the main function to use instead of getCurrentUser() when you need subscription info
 */
export const getCompleteUser = async (): Promise<CompleteUser | null> => {
  // Get auth info (from localStorage)
  const authUser = await authService.getCurrentUser();
  if (!authUser) return null;

  // Get user ID - from auth if available, or generate from email
  let userId: string;
  if (authUser.userId) {
    userId = authUser.userId;
  } else if (authUser.profile.email) {
    // Generate stable user ID from email (for localStorage fallback)
    const encoder = new TextEncoder();
    const data = encoder.encode(authUser.profile.email);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    userId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  } else {
    return null;
  }

  // Get subscription tier and user level from user_usage table
  const usage = await getUserUsage();
  const subscriptionTier = (usage?.tier || 'free') as 'free' | 'starter' | 'pro' | 'business';
  const userLevel = (usage?.user_level || 'user') as 'user' | 'admin';
  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'business';
  const isAdmin = userLevel === 'admin';

  return {
    profile: authUser.profile,
    userId,
    subscriptionTier,
    userLevel,
    isPro,
    isAdmin,
    usage: usage || undefined,
  };
};

/**
 * Initialize a new user in the database after sign up
 * Creates a record in user_usage table
 */
export const initializeUser = async (userId: string, email: string, name?: string): Promise<UserUsage | null> => {
  try {
    console.log('Initializing user in database:', { userId, email, name, functionsUrl: FUNCTIONS_URL });
    
    const url = `${FUNCTIONS_URL}/user-init`;
    console.log('Calling:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, name }),
    });

    console.log('User init response status:', response.status);
    console.log('User init response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('Failed to initialize user - response body:', errorText);
      } catch (e) {
        errorText = `HTTP ${response.status} ${response.statusText}`;
        console.error('Failed to read error response:', e);
      }
      
      const errorMessage = `Failed to initialize user: ${response.status} ${errorText}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('User initialized successfully:', result);
    console.log('Result keys:', result ? Object.keys(result) : 'null');
    console.log('Has user_id:', result?.user_id ? 'yes' : 'no');
    console.log('Has user_id (alternative):', result?.userId ? 'yes' : 'no');
    
    // Check for both user_id and userId (case variations)
    if (!result || (!result.user_id && !result.userId)) {
      console.error('User initialization returned invalid result:', result);
      throw new Error('User initialization returned invalid result - missing user_id');
    }
    
    return result;
  } catch (error) {
    console.error('Error initializing user:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Re-throw so the caller knows it failed
    throw error;
  }
};
