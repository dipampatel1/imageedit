
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

// Helper to create a user session
const createSession = (user: any) => {
    const sessionData = {
        profile: {
            name: user.name,
            email: user.email,
            imageUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
        },
        isPro: user.isPro,
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));
    return sessionData;
};


/**
 * Registers a new user and automatically signs them in.
 * @throws Will throw an error if the email is already in use.
 */
export const signUp = async (name: string, email: string, password: string): Promise<{ profile: UserProfile, isPro: boolean }> => {
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
                    return {
                        profile: {
                            name: user.displayName || user.name || name,
                            email: user.primaryEmail || user.email || email,
                            imageUrl: user.profileImageUrl || user.imageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
                        },
                        isPro: false, // Will be determined by subscription
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
 * @throws Will throw an error for invalid credentials.
 */
export const signIn = async (email: string, password: string): Promise<{ profile: UserProfile, isPro: boolean }> => {
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
                    return {
                        profile: {
                            name: user.displayName || user.name || email.split('@')[0],
                            email: user.primaryEmail || user.email || email,
                            imageUrl: user.profileImageUrl || user.imageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(email)}`,
                        },
                        isPro: false, // Will be determined by subscription
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
 * @returns The user session object or null if not signed in.
 */
export const getCurrentUser = async (): Promise<{ profile: UserProfile, isPro: boolean } | null> => {
    // Try Neon Auth first if configured
    if (isNeonAuthConfigured()) {
        const stackClient = await getStackClient();
        if (stackClient) {
            try {
                const user = await stackClient.getUser?.() || await stackClient.user;
                if (user) {
                    return {
                        profile: {
                            name: user.displayName || user.name || user.primaryEmail?.split('@')[0] || 'User',
                            email: user.primaryEmail || user.email || '',
                            imageUrl: user.profileImageUrl || user.imageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.primaryEmail || user.email || 'user')}`,
                        },
                        isPro: false, // Will be determined by subscription
                    };
                }
            } catch (error) {
                console.error('Error getting user from Neon Auth:', error);
            }
        }
    }
    
    // Fallback to localStorage
    const session = localStorage.getItem(CURRENT_USER_KEY);
    return session ? JSON.parse(session) : null;
};

/**
 * Simulates upgrading the current user to a Pro plan.
 */
export const upgradeCurrentUserToPro = async (): Promise<void> => {
    const session = await getCurrentUser();
    if (!session) return;

    // For Neon Auth, subscription management would be handled via Stripe webhooks
    // For now, just update localStorage
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === session.profile.email);

    if (userIndex !== -1) {
        users[userIndex].isPro = true;
        saveUsers(users);
        // Update the current session to reflect the change immediately
        createSession(users[userIndex]);
    }
};
