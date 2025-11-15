// Service to get complete user information including subscription tier
// This combines auth data (from Neon Auth) with subscription data (from user_usage table)

import * as authService from './authService';
import { getUserUsage, type UserUsage } from './usageService';
import type { UserProfile } from '../types';

export interface CompleteUser {
  profile: UserProfile;
  userId: string;
  subscriptionTier: 'free' | 'starter' | 'pro' | 'business';
  isPro: boolean; // true if tier is 'pro' or 'business'
  usage?: UserUsage;
}

/**
 * Gets complete user information including subscription tier from database
 * This is the main function to use instead of getCurrentUser() when you need subscription info
 */
export const getCompleteUser = async (): Promise<CompleteUser | null> => {
  // Get auth info (from Neon Auth or localStorage)
  const authUser = await authService.getCurrentUser();
  if (!authUser) return null;

  // Get user ID - from Neon Auth if available, or generate from email
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

  // Get subscription tier from user_usage table
  const usage = await getUserUsage();
  const subscriptionTier = (usage?.tier || 'free') as 'free' | 'starter' | 'pro' | 'business';
  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'business';

  return {
    profile: authUser.profile,
    userId,
    subscriptionTier,
    isPro,
    usage: usage || undefined,
  };
};

