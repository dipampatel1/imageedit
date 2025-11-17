
import type { UserProfile } from '../types';
import * as supabaseAuth from './supabaseAuthService';
import { isSupabaseConfigured } from './supabaseService';

// This service integrates with Supabase Auth when configured,
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
    console.log('signUp called with:', { name, email, passwordLength: password.length });
    
    // Try Supabase Auth first if configured
    if (isSupabaseConfigured()) {
        console.log('Supabase is configured, attempting to use Supabase Auth');
        try {
            const result = await supabaseAuth.signUp(name, email, password);
            console.log('Supabase sign up successful:', result);
            return {
                profile: result.profile,
                userId: result.userId,
            };
        } catch (error: any) {
            console.error('Supabase Auth sign up error:', error);
            console.error('Error details:', {
                message: error?.message,
                stack: error?.stack,
                name: error?.name,
            });
            // Fall through to localStorage fallback instead of throwing
            console.log('Falling back to localStorage...');
        }
    } else {
        console.log('Supabase not configured, using localStorage fallback');
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
    // Try Supabase Auth first if configured
    if (isSupabaseConfigured()) {
        try {
            const result = await supabaseAuth.signIn(email, password);
            return {
                profile: result.profile,
                userId: result.userId,
            };
        } catch (error: any) {
            console.error('Supabase Auth sign in error:', error);
            throw new Error(error.message || 'Invalid email or password.');
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
    // Try Supabase Auth first if configured
    if (isSupabaseConfigured()) {
        try {
            await supabaseAuth.signOut();
        } catch (error) {
            console.error('Error signing out from Supabase:', error);
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
    // Try Supabase Auth first if configured
    if (isSupabaseConfigured()) {
        try {
            const result = await supabaseAuth.getCurrentUser();
            if (result) {
                return {
                    profile: result.profile,
                    userId: result.userId,
                };
            }
        } catch (error: any) {
            // Don't log "Auth session missing" errors - this is expected when not logged in
            const isSessionMissing = error?.message?.includes('Auth session missing') || 
                                     error?.name === 'AuthSessionMissingError' ||
                                     error?.message?.includes('session');
            
            if (!isSessionMissing) {
                // Only log unexpected errors
                console.error('Error getting user from Supabase:', error);
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
