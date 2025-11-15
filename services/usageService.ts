import * as authService from './authService';

const FUNCTIONS_URL = import.meta.env.VITE_NETLIFY_FUNCTIONS_URL || '/.netlify/functions';

export interface UserUsage {
  id?: number;
  user_id: string;
  email: string;
  tier: 'free' | 'starter' | 'pro' | 'business';
  images_generated: number;
  current_period_start: string;
  current_period_end: string;
  created_at?: string;
  updated_at?: string;
}

export interface UsageCheck {
  canGenerate: boolean;
  tier: string;
  imagesGenerated: number;
  limit: number;
  remaining: number;
}

const getUserId = async (): Promise<string | null> => {
  const user = await authService.getCurrentUser();
  if (!user) return null;
  
  // For Neon Auth, we'd get the actual user ID from the auth system
  // For localStorage fallback, generate a stable ID from email
  if (user.profile.email) {
    // Create a stable user ID from email (hash it)
    const encoder = new TextEncoder();
    const data = encoder.encode(user.profile.email);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  }
  return null;
};

export const getUserUsage = async (): Promise<UserUsage | null> => {
  const userId = await getUserId();
  if (!userId) return null;

  try {
    const user = await authService.getCurrentUser();
    const response = await fetch(`${FUNCTIONS_URL}/usage-get?userId=${userId}&email=${encodeURIComponent(user?.profile.email || '')}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch usage');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching usage:', error);
    // Fallback to localStorage
    const stored = localStorage.getItem(`usage_${userId}`);
    return stored ? JSON.parse(stored) : null;
  }
};

export const checkUsageLimit = async (): Promise<UsageCheck> => {
  const userId = await getUserId();
  if (!userId) {
    return {
      canGenerate: false,
      tier: 'free',
      imagesGenerated: 0,
      limit: 25,
      remaining: 0,
    };
  }

  try {
    const response = await fetch(`${FUNCTIONS_URL}/usage-check?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to check usage');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking usage:', error);
    // Fallback to localStorage
    const stored = localStorage.getItem(`usage_${userId}`);
    const usage = stored ? JSON.parse(stored) : { images_generated: 0, tier: 'free' };
    const limit = getUsageLimit(usage.tier || 'free');
    const remaining = Math.max(0, limit - usage.images_generated);
    
    return {
      canGenerate: remaining > 0,
      tier: usage.tier || 'free',
      imagesGenerated: usage.images_generated || 0,
      limit,
      remaining,
    };
  }
};

export const incrementUsage = async (): Promise<UserUsage | null> => {
  const userId = await getUserId();
  if (!userId) return null;

  try {
    const user = await authService.getCurrentUser();
    const response = await fetch(`${FUNCTIONS_URL}/usage-increment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email: user?.profile.email || '',
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to increment usage');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error incrementing usage:', error);
    // Fallback to localStorage
    const stored = localStorage.getItem(`usage_${userId}`);
    const usage = stored ? JSON.parse(stored) : { images_generated: 0, tier: 'free' };
    usage.images_generated = (usage.images_generated || 0) + 1;
    localStorage.setItem(`usage_${userId}`, JSON.stringify(usage));
    return usage;
  }
};

export const getUsageLimit = (tier: string): number => {
  switch (tier) {
    case 'starter':
      return 200;
    case 'pro':
      return 1000;
    case 'business':
      return 5000;
    default:
      return 25; // Free tier
  }
};

