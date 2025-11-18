import type { UserProfile } from '../types';
import { useUser, useStackApp } from '@stackframe/stack';
import { stackServerApp } from '../stack';

/**
 * Neon Auth (Stack Auth) Integration
 * Users are automatically created in the neon_auth schema when signing up via Stack Auth.
 * This service provides a wrapper around Stack Auth for backward compatibility.
 */

/**
 * Registers a new user via Stack Auth (creates in neon_auth schema).
 * @throws Will throw an error if the email is already in use or sign-up fails.
 */
export const signUp = async (name: string, email: string, password: string): Promise<{ profile: UserProfile, userId?: string }> => {
    try {
        // Use Stack Auth for sign-up (creates user in neon_auth schema)
        const result = await stackServerApp.signUpWithCredential({
            email,
            password,
            displayName: name,
        });

        if (!result.user) {
            throw new Error('Failed to create user account. Please try again.');
        }

        // Return user profile in expected format
        return {
            profile: {
                name: result.user.displayName || name,
                email: result.user.primaryEmail || email,
                imageUrl: result.user.profileImageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
            },
            userId: result.user.id,
        };
    } catch (error: any) {
        console.error('❌ Stack Auth sign-up error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('already exists') || error.message?.includes('already registered')) {
            throw new Error('An account with this email already exists.');
        }
        
        throw new Error(error.message || 'Failed to create account. Please try again.');
    }
};

/**
 * Signs in an existing user via Stack Auth.
 * @throws Will throw an error for invalid credentials.
 */
export const signIn = async (email: string, password: string): Promise<{ profile: UserProfile, userId?: string }> => {
    try {
        // Use Stack Auth for sign-in
        const result = await stackServerApp.signInWithCredential({
            email,
            password,
        });

        if (!result.user) {
            throw new Error('Invalid email or password.');
        }

        // Return user profile in expected format
        return {
            profile: {
                name: result.user.displayName || '',
                email: result.user.primaryEmail || email,
                imageUrl: result.user.profileImageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(result.user.displayName || email)}`,
            },
            userId: result.user.id,
        };
    } catch (error: any) {
        console.error('❌ Stack Auth sign-in error:', error);
        
        if (error.message?.includes('Invalid') || error.message?.includes('password') || error.message?.includes('credentials')) {
            throw new Error('Invalid email or password.');
        }
        
        throw new Error(error.message || 'Failed to sign in. Please try again.');
    }
};

/**
 * Signs out the current user via Stack Auth.
 */
export const signOut = async (): Promise<void> => {
    try {
        await stackServerApp.signOut();
    } catch (error) {
        console.error('❌ Stack Auth sign-out error:', error);
        // Don't throw - sign-out should always succeed
    }
};

/**
 * Gets the currently signed-in user from Stack Auth.
 * Note: Subscription tier is NOT stored in auth - it comes from user_usage table.
 * Use getUserUsage() from usageService to get subscription tier.
 * @returns The user session object or null if not signed in.
 */
export const getCurrentUser = async (): Promise<{ profile: UserProfile, userId?: string } | null> => {
    try {
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return null;
        }

        return {
            profile: {
                name: user.displayName || '',
                email: user.primaryEmail || '',
                imageUrl: user.profileImageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.primaryEmail || '')}`,
            },
            userId: user.id,
        };
    } catch (error) {
        console.error('❌ Error getting user from Stack Auth:', error);
        return null;
    }
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
