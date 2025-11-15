
import type { UserProfile } from '../types';
import { getStackClient, isNeonAuthConfigured } from './neonAuthService';

// This service integrates with Neon Auth (Stack Auth) when configured,
// with a localStorage fallback for development/testing.

const USERS_DB_KEY = 'imageedit_users';
const CURRENT_USER_KEY = 'imageedit_currentUser';

// Helper to get all users from localStorage
const getUsers = () => {
    const users = localStorage.getItem(USERS_DB_KEY);
    return users ? JSON.parse(users) : [];
};

// Helper to save all users to localStorage
const saveUsers = (users: any[]) => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

// Helper to create a user session (for localStorage fallback only)
const createSession = (user: any) => {
    const sessionData = {
        profile: {
            name: user.name,
            email: user.email,
            imageUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
        },
        userId: user.id || user.userId,
        // Note: isPro/subscription tier should come from user_usage table, not stored here
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));
    return sessionData;
};


/**
 * Registers a new user and automatically signs them in.
 * Note: Subscription tier is stored in user_usage table, not in auth.
 * @throws Will throw an error if the email is already in use.
 */
export const signUp = async (name: string, email: string, password: string): Promise<{ profile: UserProfile, userId?: string }> => {
    // Try Neon Auth first if configured
    if (isNeonAuthConfigured()) {
        const stackClient = await getStackClient();
        if (stackClient) {
            try {
                // Stack Auth API - adjust method names based on actual SDK
                const user = await stackClient.signUpWithCredential?.({
                    email,
                    password,
                    displayName: name,
                }) || await stackClient.signUp?.({
                    email,
                    password,
                    displayName: name,
                });
                
                if (user) {
                    const userId = user.id || user.userId || null;
                    return {
                        profile: {
                            name: user.displayName || user.name || name,
                            email: user.primaryEmail || user.email || email,
                            imageUrl: user.profileImageUrl || user.imageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
                        },
                        userId: userId || undefined,
                    };
                }
            } catch (error: any) {
                console.error('Stack Auth sign up error:', error);
                throw new Error(error.message || 'Failed to create account. Please try again.');
            }
        }
    }
    
    // Fallback to localStorage
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();
            const existingUser = users.find(u => u.email === email);

            if (existingUser) {
                return reject(new Error('An account with this email already exists.'));
            }

            const newUser = {
                id: crypto.randomUUID(),
                name,
                email,
                password, // In a real app, this would be hashed.
                isPro: false,
            };

            users.push(newUser);
            saveUsers(users);

            const session = createSession(newUser);
            resolve(session);
        }, 500);
    });
};

/**
 * Signs in an existing user.
 * Note: Subscription tier is stored in user_usage table, not in auth.
 * @throws Will throw an error for invalid credentials.
 */
export const signIn = async (email: string, password: string): Promise<{ profile: UserProfile, userId?: string }> => {
    // Try Neon Auth first if configured
    if (isNeonAuthConfigured()) {
        const stackClient = await getStackClient();
        if (stackClient) {
            try {
                // Stack Auth API - adjust method names based on actual SDK
                const user = await stackClient.signInWithCredential?.({
                    email,
                    password,
                }) || await stackClient.signIn?.({
                    email,
                    password,
                });
                
                if (user) {
                    const userId = user.id || user.userId || null;
                    return {
                        profile: {
                            name: user.displayName || user.name || email.split('@')[0],
                            email: user.primaryEmail || user.email || email,
                            imageUrl: user.profileImageUrl || user.imageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(email)}`,
                        },
                        userId: userId || undefined,
                    };
                }
            } catch (error: any) {
                console.error('Stack Auth sign in error:', error);
                throw new Error(error.message || 'Invalid email or password.');
            }
        }
    }
    
    // Fallback to localStorage
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();
            const user = users.find(u => u.email === email);

            if (!user || user.password !== password) {
                return reject(new Error('Invalid email or password.'));
            }
            
            const session = createSession(user);
            resolve(session);
        }, 500);
    });
};

/**
 * Signs out the current user.
 */
export const signOut = async (): Promise<void> => {
    // Try Neon Auth first if configured
    if (isNeonAuthConfigured()) {
        const stackClient = await getStackClient();
        if (stackClient) {
            try {
                await stackClient.signOut();
            } catch (error) {
                console.error('Error signing out from Neon Auth:', error);
            }
        }
    }
    
    // Always clear localStorage as fallback
    localStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * Gets the currently signed-in user.
 * Note: Subscription tier is NOT stored in auth - it comes from user_usage table.
 * Use getUserUsage() from usageService to get subscription tier.
 * @returns The user session object or null if not signed in.
 */
export const getCurrentUser = async (): Promise<{ profile: UserProfile, userId?: string } | null> => {
    // Try Neon Auth first if configured
    if (isNeonAuthConfigured()) {
        const stackClient = await getStackClient();
        if (stackClient) {
            try {
                const user = await stackClient.getUser?.() || await stackClient.user;
                if (user) {
                    // Get user ID from Stack Auth
                    const userId = user.id || user.userId || null;
                    
                    return {
                        profile: {
                            name: user.displayName || user.name || user.primaryEmail?.split('@')[0] || 'User',
                            email: user.primaryEmail || user.email || '',
                            imageUrl: user.profileImageUrl || user.imageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.primaryEmail || user.email || 'user')}`,
                        },
                        userId: userId || undefined,
                    };
                }
            } catch (error) {
                console.error('Error getting user from Neon Auth:', error);
            }
        }
    }
    
    // Fallback to localStorage
    const session = localStorage.getItem(CURRENT_USER_KEY);
    if (session) {
        const parsed = JSON.parse(session);
        // Remove isPro from session - it should come from database
        return {
            profile: parsed.profile,
            userId: parsed.userId,
        };
    }
    return null;
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
