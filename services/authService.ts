
import type { UserProfile } from '../types';

// This service simulates a backend user authentication system using localStorage.
// It's a robust way to test user flows without a live server.

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
export const signUp = (name: string, email: string, password: string): Promise<{ profile: UserProfile, isPro: boolean }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate network latency
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
export const signIn = (email: string, password: string): Promise<{ profile: UserProfile, isPro: boolean }> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate network latency
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
 * Signs out the current user by clearing the session from localStorage.
 */
export const signOut = (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * Gets the currently signed-in user from the localStorage session.
 * @returns The user session object or null if not signed in.
 */
export const getCurrentUser = (): { profile: UserProfile, isPro: boolean } | null => {
    const session = localStorage.getItem(CURRENT_USER_KEY);
    return session ? JSON.parse(session) : null;
};

/**
 * Simulates upgrading the current user to a Pro plan.
 */
export const upgradeCurrentUserToPro = (): void => {
    const session = getCurrentUser();
    if (!session) return;

    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === session.profile.email);

    if (userIndex !== -1) {
        users[userIndex].isPro = true;
        saveUsers(users);
        // Update the current session to reflect the change immediately
        createSession(users[userIndex]);
    }
};
