
import type { UserProfile } from '../types';

// This service uses localStorage for authentication.
// In production, you would integrate with Neon Auth (Stack Auth) or another auth provider.

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
    // Removed verbose logging to reduce console spam
    
    // Use localStorage for authentication
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
                password: password, // In a real app, this would be hashed.
                isPro: false,
                createdAt: new Date().toISOString(),
            };

            users.push(newUser);
            saveUsers(users);
            
            // Verify password was saved
            const savedUsers = getUsers();
            const savedUser = savedUsers.find(u => u.email === email);
            if (!savedUser || !savedUser.password) {
                console.error('❌ Password was not saved correctly during sign-up');
                throw new Error('Failed to save password. Please try again.');
            }

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
    // Use localStorage for authentication
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
    // Clear localStorage
    localStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * Gets the currently signed-in user.
 * Note: Subscription tier is NOT stored in auth - it comes from user_usage table.
 * Use getUserUsage() from usageService to get subscription tier.
 * @returns The user session object or null if not signed in.
 */
export const getCurrentUser = async (): Promise<{ profile: UserProfile, userId?: string } | null> => {
    // Use localStorage
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
 * Resets a user's password (for localStorage fallback only).
 * In production, this would send an email with a reset link.
 * @param email The user's email address
 * @param newPassword The new password to set
 * @throws Will throw an error if the user is not found.
 */
export const resetPassword = async (email: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                console.log('🔵 resetPassword: Resetting password for:', email);
                const users = getUsers();
                console.log('🔵 resetPassword: Total users:', users.length);
                const userIndex = users.findIndex(u => u.email && u.email.toLowerCase() === email.toLowerCase());
                console.log('🔵 resetPassword: User index:', userIndex);

                if (userIndex === -1) {
                    console.error('❌ resetPassword: User not found');
                    return reject(new Error('No account found with this email address.'));
                }

                // Update the password
                users[userIndex].password = newPassword; // In a real app, this would be hashed.
                saveUsers(users);

                // Verify password was saved
                const savedUsers = getUsers();
                const savedUser = savedUsers.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
                if (!savedUser || !savedUser.password) {
                    console.error('❌ resetPassword: Password was not saved correctly');
                    return reject(new Error('Failed to save new password. Please try again.'));
                }

                console.log('✅ resetPassword: Password reset successful');
                resolve();
            } catch (error) {
                console.error('❌ resetPassword: Error:', error);
                reject(error instanceof Error ? error : new Error('Failed to reset password'));
            }
        }, 500);
    });
};

/**
 * Checks if an email exists in the system (for password reset).
 * @param email The email to check
 * @returns true if the email exists, false otherwise
 */
export const emailExists = async (email: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const users = getUsers();
                console.log('🔵 emailExists: Checking email:', email);
                console.log('🔵 emailExists: Total users in localStorage:', users.length);
                console.log('🔵 emailExists: User emails:', users.map(u => u.email));
                const exists = users.some(u => u.email && u.email.toLowerCase() === email.toLowerCase());
                console.log('🔵 emailExists: Result:', exists);
                resolve(exists);
            } catch (error) {
                console.error('❌ Error checking email existence:', error);
                resolve(false);
            }
        }, 300);
    });
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
