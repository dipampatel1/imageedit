import type { UserProfile } from '../types';
import { stackServerApp } from '../stack';

/**
 * Authentication Service with Stack Auth and localStorage fallback
 * Tries Stack Auth first, falls back to localStorage if Stack Auth is not configured
 */

// Helper to generate stable user ID from email (for localStorage)
const generateUserIdFromEmail = (email: string): string => {
    // Simple hash function for consistent user IDs
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        const char = email.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return `user_${Math.abs(hash)}`;
};

/**
 * Registers a new user via Stack Auth (creates in neon_auth schema) or localStorage fallback.
 * @throws Will throw an error if the email is already in use or sign-up fails.
 */
export const signUp = async (name: string, email: string, password: string): Promise<{ profile: UserProfile, userId?: string }> => {
    try {
        // Try Stack Auth first
        const result = await stackServerApp.signUpWithCredential({
            email,
            password,
            displayName: name,
        });

        if (result.user) {
            return {
                profile: {
                    name: result.user.displayName || name,
                    email: result.user.primaryEmail || email,
                    imageUrl: result.user.profileImageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
                },
                userId: result.user.id,
            };
        }
    } catch (error: any) {
        // If Stack Auth fails with "not configured", fall back to localStorage
        if (error.message?.includes('not configured') || error.message?.includes('Stack Auth is not configured')) {
            // Fallback to localStorage
            const existingUsers = JSON.parse(localStorage.getItem('users') || '{}');
            if (existingUsers[email]) {
                throw new Error('An account with this email already exists.');
            }
            
            const userId = generateUserIdFromEmail(email);
            const userProfile: UserProfile = {
                name,
                email,
                imageUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
            };
            
            // Store user in localStorage
            existingUsers[email] = {
                userId,
                profile: userProfile,
                password: password, // In production, this should be hashed
            };
            localStorage.setItem('users', JSON.stringify(existingUsers));
            localStorage.setItem('currentUser', JSON.stringify({ userId, profile: userProfile }));
            
            return { profile: userProfile, userId };
        }
        
        // Handle other Stack Auth errors
        if (error.message?.includes('already exists') || error.message?.includes('already registered')) {
            throw new Error('An account with this email already exists.');
        }
        
        throw new Error(error.message || 'Failed to create account. Please try again.');
    }
    
    throw new Error('Failed to create user account. Please try again.');
};

/**
 * Signs in an existing user via Stack Auth or localStorage fallback.
 * @throws Will throw an error for invalid credentials.
 */
export const signIn = async (email: string, password: string): Promise<{ profile: UserProfile, userId?: string }> => {
    try {
        // Try Stack Auth first
        const result = await stackServerApp.signInWithCredential({
            email,
            password,
        });

        if (result.user) {
            return {
                profile: {
                    name: result.user.displayName || '',
                    email: result.user.primaryEmail || email,
                    imageUrl: result.user.profileImageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(result.user.displayName || email)}`,
                },
                userId: result.user.id,
            };
        }
    } catch (error: any) {
        // If Stack Auth fails with "not configured", fall back to localStorage
        if (error.message?.includes('not configured') || error.message?.includes('Stack Auth is not configured')) {
            // Fallback to localStorage
            const existingUsers = JSON.parse(localStorage.getItem('users') || '{}');
            const user = existingUsers[email];
            
            if (!user || user.password !== password) {
                throw new Error('Invalid email or password.');
            }
            
            // Set current user
            localStorage.setItem('currentUser', JSON.stringify({ userId: user.userId, profile: user.profile }));
            
            return { profile: user.profile, userId: user.userId };
        }
        
        // Handle other Stack Auth errors
        if (error.message?.includes('Invalid') || error.message?.includes('password') || error.message?.includes('credentials')) {
            throw new Error('Invalid email or password.');
        }
        
        throw new Error(error.message || 'Failed to sign in. Please try again.');
    }
    
    throw new Error('Invalid email or password.');
};

/**
 * Signs out the current user via Stack Auth or localStorage.
 */
export const signOut = async (): Promise<void> => {
    try {
        await stackServerApp.signOut();
    } catch (error: any) {
        // If Stack Auth fails, clear localStorage
        if (error.message?.includes('not configured') || error.message?.includes('Stack Auth is not configured')) {
            localStorage.removeItem('currentUser');
            return;
        }
    }
    
    // Always clear localStorage as fallback
    localStorage.removeItem('currentUser');
};

/**
 * Gets the currently signed-in user from Stack Auth or localStorage.
 * Note: Subscription tier is NOT stored in auth - it comes from user_usage table.
 * Use getUserUsage() from usageService to get subscription tier.
 * @returns The user session object or null if not signed in.
 */
export const getCurrentUser = async (): Promise<{ profile: UserProfile, userId?: string } | null> => {
    try {
        // Try Stack Auth first
        const user = await stackServerApp.getUser();
        if (user) {
            return {
                profile: {
                    name: user.displayName || '',
                    email: user.primaryEmail || '',
                    imageUrl: user.profileImageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.primaryEmail || '')}`,
                },
                userId: user.id,
            };
        }
    } catch (error: any) {
        // If Stack Auth fails, fall back to localStorage
        if (error.message?.includes('not configured') || error.message?.includes('Stack Auth is not configured')) {
            const currentUserStr = localStorage.getItem('currentUser');
            if (currentUserStr) {
                try {
                    return JSON.parse(currentUserStr);
                } catch {
                    return null;
                }
            }
            return null;
        }
    }
    
    // Fallback to localStorage
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
        try {
            return JSON.parse(currentUserStr);
        } catch {
            return null;
        }
    }
    
    return null;
};

/**
 * Resets a user's password via Stack Auth.
 * @param email The user's email address
 * @param newPassword The new password to set
 * @throws Will throw an error if the user is not found or reset fails.
 */
export const resetPassword = async (email: string, newPassword: string): Promise<void> => {
    try {
        // First, sign in to verify the user exists
        const user = await stackServerApp.getUserByEmail(email);
        
        if (!user) {
            throw new Error('No account found with this email address.');
        }

        // Update password via Stack Auth
        await stackServerApp.updateUserPassword(user.id, newPassword);
    } catch (error: any) {
        console.error('❌ Stack Auth password reset error:', error);
        
        if (error.message?.includes('not found') || error.message?.includes('No account')) {
            throw new Error('No account found with this email address.');
        }
        
        throw new Error(error.message || 'Failed to reset password. Please try again.');
    }
};

/**
 * Checks if an email exists in Stack Auth (neon_auth schema).
 * @param email The email to check
 * @returns true if the email exists, false otherwise
 */
export const emailExists = async (email: string): Promise<boolean> => {
    try {
        // Check Stack Auth for email
        const user = await stackServerApp.getUserByEmail(email);
        return !!user;
    } catch (error) {
        console.error('❌ Error checking email in Stack Auth:', error);
        // If check fails, also check Neon database user_usage table as fallback
        try {
            const FUNCTIONS_URL = import.meta.env.VITE_NETLIFY_FUNCTIONS_URL || '/.netlify/functions';
            const url = `${FUNCTIONS_URL}/email-check?email=${encodeURIComponent(email)}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const result = await response.json();
                return result.exists === true;
            }
        } catch (dbError) {
            console.error('❌ Error checking database:', dbError);
        }
        return false;
    }
};

/**
 * Note: Subscription upgrades are handled via Stripe webhooks that update the user_usage table.
 * This function is kept for backward compatibility but subscription tier should come from database.
 */
export const upgradeCurrentUserToPro = async (): Promise<void> => {
    // Subscription tier is managed in user_usage table via Stripe webhooks
    // This function is deprecated - use getUserUsage() from usageService instead
    console.warn('upgradeCurrentUserToPro is deprecated. Subscription tier is managed in user_usage table.');
};
